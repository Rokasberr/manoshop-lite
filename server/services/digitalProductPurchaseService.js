const path = require("path");

const { getDigitalProductById } = require("../config/digitalProducts");
const DigitalProductPurchase = require("../models/DigitalProductPurchase");
const User = require("../models/User");
const { buildIdempotencyKey } = require("./stripeCheckoutService");
const { ensureStripeCustomerForUser } = require("./stripeCustomerService");
const { getStripeClient, resolveClientUrl } = require("../utils/stripeClient");

const paidStatus = "paid";
const storageRoot = path.resolve(__dirname, "..", "protected-digital-products");

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const getPurchasedProductIds = async (userId) => {
  if (!userId) {
    return [];
  }

  const purchases = await DigitalProductPurchase.find({
    user: userId,
    status: paidStatus,
  })
    .select("productId")
    .lean();

  return purchases.map((purchase) => purchase.productId);
};

const hasPurchasedProduct = async (userId, productId) => {
  if (!userId || !productId) {
    return false;
  }

  const purchase = await DigitalProductPurchase.exists({
    user: userId,
    productId,
    status: paidStatus,
  });

  return Boolean(purchase);
};

const createDigitalProductCheckoutSession = async ({ user, productId, origin, idempotencyKey }) => {
  const product = getDigitalProductById(productId);

  if (!product) {
    const error = new Error("Produktas nerastas.");
    error.statusCode = 404;
    throw error;
  }

  const alreadyPurchased = await hasPurchasedProduct(user._id, product.id);

  if (alreadyPurchased) {
    return {
      alreadyPurchased: true,
      product,
    };
  }

  const stripe = getStripeClient();
  const clientUrl = resolveClientUrl(origin);
  const stripeCustomerId = await ensureStripeCustomerForUser(stripe, user);
  const successUrl = `${clientUrl}/digital-products?purchase=success&product=${encodeURIComponent(
    product.id
  )}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${clientUrl}/digital-products?purchase=cancel&product=${encodeURIComponent(product.id)}`;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer: stripeCustomerId,
      client_reference_id: user._id.toString(),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "digital_product",
        checkoutType: "digital_product",
        userId: user._id.toString(),
        productId: product.id,
      },
      payment_intent_data: {
        metadata: {
          type: "digital_product",
          userId: user._id.toString(),
          productId: product.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.priceCents,
            product_data: {
              name: product.title,
              metadata: {
                productId: product.id,
              },
            },
          },
        },
      ],
    },
    {
      idempotencyKey: buildIdempotencyKey(
        "digital-product-checkout",
        [user._id, product.id, idempotencyKey || Date.now()],
        idempotencyKey
      ),
    }
  );

  await DigitalProductPurchase.findOneAndUpdate(
    {
      user: user._id,
      productId: product.id,
    },
    {
      $set: {
        stripeSessionId: session.id,
        stripePaymentIntentId: getStripeId(session.payment_intent),
        amount: product.priceCents / 100,
        currency: product.currency,
        status: "pending",
      },
      $setOnInsert: {
        purchasedAt: null,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    session,
    product,
  };
};

const syncDigitalProductPurchaseFromSession = async (session) => {
  const metadata = session?.metadata || {};

  if (metadata.type !== "digital_product" && metadata.checkoutType !== "digital_product") {
    return null;
  }

  const product = getDigitalProductById(metadata.productId);
  const userId = metadata.userId || session.client_reference_id || "";

  if (!product || !userId) {
    return null;
  }

  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    return null;
  }

  const amountTotal = Number(session.amount_total ?? product.priceCents);
  const currency = String(session.currency || product.currency || "eur").toLowerCase();

  return DigitalProductPurchase.findOneAndUpdate(
    {
      user: userId,
      productId: product.id,
    },
    {
      $set: {
        stripeSessionId: session.id,
        stripePaymentIntentId: getStripeId(session.payment_intent),
        amount: Number((amountTotal / 100).toFixed(2)),
        currency,
        status: paidStatus,
        purchasedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

const resolveDigitalProductFilePath = (product, format) => {
  const normalizedFormat = format === "excel" || format === "xlsx" ? "excel" : format === "pdf" ? "pdf" : "";

  if (!normalizedFormat) {
    return null;
  }

  const fileName = normalizedFormat === "pdf" ? product.pdfFileName : product.excelFileName;

  if (!fileName) {
    return null;
  }

  const resolvedRoot = path.resolve(storageRoot);
  const resolvedPath = path.resolve(resolvedRoot, normalizedFormat, fileName);

  if (!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return null;
  }

  return {
    fileName,
    filePath: resolvedPath,
  };
};

module.exports = {
  createDigitalProductCheckoutSession,
  getPurchasedProductIds,
  hasPurchasedProduct,
  resolveDigitalProductFilePath,
  syncDigitalProductPurchaseFromSession,
};
