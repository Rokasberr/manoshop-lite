const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");
const { calculateCommission } = require("../services/commissionService");
const { buildIdempotencyKey, buildOrderLineItems } = require("../services/stripeCheckoutService");
const { getStripeClient, resolveClientUrl } = require("../utils/stripeClient");
const { createHttpError } = require("../utils/httpError");

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalizeSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const serializeProduct = (product) => {
  const source = product?.toObject ? product.toObject() : product;
  const images = Array.isArray(source?.images) ? source.images : [];

  return {
    ...source,
    title: source?.title || source?.name || "",
    previewImage: source?.previewImage || images[0] || "",
    type: source?.type || source?.productType || "digital",
    currency: source?.currency || "eur",
  };
};

const serializeStore = (store) => {
  const source = store?.toObject ? store.toObject() : store;

  return {
    ...source,
    selectedProducts: Array.isArray(source?.selectedProducts)
      ? source.selectedProducts.map(serializeProduct)
      : [],
  };
};

const calculatePaidOrderTotals = (orders = []) =>
  orders
    .filter((order) => order?.paymentStatus === "paid")
    .reduce(
      (summary, order) => ({
        orders: summary.orders + 1,
        revenue: summary.revenue + Number(order.price || order.totalPrice || 0),
        platformCommission: summary.platformCommission + Number(order.platformCommission || 0),
        sellerEarnings: summary.sellerEarnings + Number(order.sellerEarnings || 0),
      }),
      { orders: 0, revenue: 0, platformCommission: 0, sellerEarnings: 0 }
    );

const validateStorePayload = async ({ payload, ownerId, existingStoreId = null }) => {
  const name = String(payload.name || "").trim();
  const slug = normalizeSlug(payload.slug || name);
  const headline = String(payload.headline || "").trim();
  const description = String(payload.description || "").trim();
  const theme = ["oak", "sage", "linen", "charcoal"].includes(payload.theme) ? payload.theme : "oak";
  const selectedProductValues = Array.isArray(payload.selectedProducts)
    ? payload.selectedProducts.map((id) => String(id || "").trim())
    : [];
  const invalidSelectedProducts = selectedProductValues.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  const selectedProductIds = [...new Set(selectedProductValues)];

  if (!name) {
    throw createHttpError("Ivesk svetaines pavadinima.", 400);
  }

  if (invalidSelectedProducts.length) {
    throw createHttpError("Store produkto identifikatoriai netinkami.", 400);
  }

  if (!slug || slug.length < 3 || slug.length > 80 || !slugPattern.test(slug)) {
    throw createHttpError("Slug turi buti 3-80 simboliu, tik mazosios raides, skaiciai ir bruksneliai.", 400);
  }

  const duplicateStore = await Store.findOne({
    slug,
    ...(existingStoreId ? { _id: { $ne: existingStoreId } } : {}),
  });

  if (duplicateStore) {
    throw createHttpError("Toks slug jau uzimtas.", 409);
  }

  const selectedProducts = selectedProductIds.length
    ? await Product.find({
        _id: { $in: selectedProductIds },
        productType: "digital",
        allowedForResale: true,
        isActive: { $ne: false },
      })
    : [];

  if (selectedProducts.length !== selectedProductIds.length) {
    throw createHttpError("Store galima priskirti tik aktyvius perpardavimui leidziamus produktus.", 400);
  }

  return {
    owner: ownerId,
    name,
    slug,
    headline,
    description,
    theme,
    selectedProducts: selectedProducts.map((product) => product._id),
    isPublished: Boolean(payload.isPublished),
  };
};

const getBusinessDashboard = async (req, res) => {
  const [store, paidOrders, recentOrders] = await Promise.all([
    Store.findOne({ owner: req.user._id }).populate("selectedProducts"),
    Order.find({ storeOwner: req.user._id, paymentStatus: "paid" }),
    Order.find({ storeOwner: req.user._id }).sort({ createdAt: -1 }).limit(8).populate("product"),
  ]);

  res.json({
    store: store ? serializeStore(store) : null,
    totals: calculatePaidOrderTotals(paidOrders),
    recentOrders,
  });
};

const getResaleProducts = async (_req, res) => {
  const products = await Product.find({
    productType: "digital",
    allowedForResale: true,
    isActive: { $ne: false },
  }).sort({ createdAt: -1 });

  res.json(products.map(serializeProduct));
};

const getMyStore = async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id }).populate("selectedProducts");
  res.json(store ? serializeStore(store) : null);
};

const upsertMyStore = async (req, res) => {
  const existingStore = await Store.findOne({ owner: req.user._id });
  const payload = await validateStorePayload({
    payload: req.body || {},
    ownerId: req.user._id,
    existingStoreId: existingStore?._id || null,
  });

  const store = existingStore
    ? await Store.findByIdAndUpdate(existingStore._id, payload, { new: true, runValidators: true }).populate("selectedProducts")
    : await Store.create(payload);

  const populatedStore = store.populate ? await store.populate("selectedProducts") : store;
  res.status(existingStore ? 200 : 201).json(serializeStore(populatedStore));
};

const getMyStoreOrders = async (req, res) => {
  const orders = await Order.find({ storeOwner: req.user._id })
    .populate("product")
    .populate("store", "name slug")
    .sort({ createdAt: -1 });

  res.json(orders);
};

const getPublicStore = async (req, res) => {
  const store = await Store.findOne({
    slug: normalizeSlug(req.params.slug),
    isPublished: true,
  })
    .populate({
      path: "selectedProducts",
      match: { isActive: { $ne: false } },
    })
    .populate("owner", "name");

  if (!store) {
    throw createHttpError("Store not available.", 404);
  }

  res.json(serializeStore(store));
};

const createStoreCheckoutSession = async (req, res) => {
  const store = await Store.findOne({
    slug: normalizeSlug(req.params.slug),
    isPublished: true,
  });

  if (!store) {
    throw createHttpError("Store not available.", 404);
  }

  const productId = String(req.body?.productId || "");
  const buyerEmail = String(req.body?.buyerEmail || "").trim().toLowerCase();
  const buyerName = String(req.body?.buyerName || "").trim();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw createHttpError("Pasirinktas produktas nerastas.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    throw createHttpError("Ivesk galiojanti el. pasta.", 400);
  }

  if (!store.selectedProducts.map(String).includes(productId)) {
    throw createHttpError("Produktas nepriskirtas siai parduotuvei.", 404);
  }

  const product = await Product.findOne({
    _id: productId,
    productType: "digital",
    allowedForResale: true,
    isActive: { $ne: false },
  });

  if (!product) {
    throw createHttpError("Produktas nepasiekiamas perpardavimui.", 404);
  }

  const commission = calculateCommission({
    price: product.price,
    commissionRate: product.commissionRate,
  });
  const stripe = getStripeClient();
  const clientUrl = resolveClientUrl(req.headers.origin);
  const productTitle = product.title || product.name;
  const order = await Order.create({
    user: null,
    buyer: null,
    buyerEmail,
    store: store._id,
    storeOwner: store.owner,
    product: product._id,
    price: product.price,
    currency: product.currency || "eur",
    platformCommission: commission.platformCommission,
    sellerEarnings: commission.sellerEarnings,
    commissionRate: commission.commissionRate,
    items: [
      {
        product: product._id,
        name: productTitle,
        price: product.price,
        image: product.previewImage || product.images?.[0] || "",
        quantity: 1,
        productType: "digital",
        digitalAsset: product.digitalAsset,
      },
    ],
    shippingAddress: {
      fullName: buyerName || buyerEmail,
      address: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
    customerEmail: buyerEmail,
    paymentMethod: "stripe",
    requiresShipping: false,
    containsDigitalProducts: true,
    digitalDeliveryEmail: {
      status: "pending",
    },
    paymentStatus: "pending",
    stockReserved: false,
    itemsPrice: product.price,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: product.price,
    status: "pending",
    orderStatus: "pending",
    invoice: {
      number: `STORE-${Date.now()}-${String(store._id).slice(-4)}`,
      issuedAt: new Date(),
    },
  });

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: `${clientUrl}/stores/${store.slug}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/stores/${store.slug}?checkout=cancel`,
        customer_email: buyerEmail,
        metadata: {
          checkoutType: "order",
          orderId: order._id.toString(),
          storeId: store._id.toString(),
          storeOwnerId: store.owner.toString(),
        },
        payment_intent_data: {
          metadata: {
            checkoutType: "order",
            orderId: order._id.toString(),
            storeId: store._id.toString(),
            storeOwnerId: store.owner.toString(),
          },
        },
        line_items: buildOrderLineItems(order),
      },
      {
        idempotencyKey: buildIdempotencyKey(
          "store-checkout",
          [store._id, product._id, buyerEmail, order._id],
          req.headers["idempotency-key"]
        ),
      }
    );

    order.stripeCheckoutSessionId = session.id;
    order.checkoutExpiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
    await order.save();

    res.status(201).json({
      url: session.url,
      sessionId: session.id,
      orderId: order._id,
    });
  } catch (error) {
    await order.deleteOne();
    throw error;
  }
};

const getAdminBusinessAnalytics = async (_req, res) => {
  const orders = await Order.find({ store: { $ne: null } })
    .populate("store", "name slug")
    .populate("storeOwner", "name email")
    .populate("product")
    .sort({ createdAt: -1 });

  const totals = calculatePaidOrderTotals(orders);

  res.json({ totals, orders });
};

module.exports = {
  calculatePaidOrderTotals,
  createStoreCheckoutSession,
  getAdminBusinessAnalytics,
  getBusinessDashboard,
  getMyStore,
  getMyStoreOrders,
  getPublicStore,
  getResaleProducts,
  upsertMyStore,
};
