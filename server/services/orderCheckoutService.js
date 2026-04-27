const Order = require("../models/Order");
const Product = require("../models/Product");

const buildInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const uniquePart = `${Date.now()}${Math.floor(100 + Math.random() * 900)}`.slice(-9);
  return `INV-${datePart}-${uniquePart}`;
};

const canAccessOrder = (order, user) => {
  if (user.role === "admin") {
    return true;
  }

  const orderUserId =
    typeof order.user === "object" && order.user?._id ? order.user._id.toString() : order.user.toString();

  return orderUserId === user._id.toString();
};

const validateShippingAddress = (shippingAddress) => {
  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.postalCode ||
    !shippingAddress?.country
  ) {
    const error = new Error("Užpildyk pristatymo informaciją.");
    error.statusCode = 400;
    throw error;
  }
};

const buildOrderDraft = async ({ items, shippingAddress }) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Krepšelis tuščias.");
    error.statusCode = 400;
    throw error;
  }

  validateShippingAddress(shippingAddress);

  const normalizedItems = items.map((item) => ({
    product: String(item.product || ""),
    quantity: Math.max(Number(item.quantity) || 0, 0),
  }));

  if (normalizedItems.some((item) => !item.product || item.quantity < 1)) {
    const error = new Error("Netinkami krepšelio duomenys.");
    error.statusCode = 400;
    throw error;
  }

  const products = await Product.find({
    _id: { $in: normalizedItems.map((item) => item.product) },
  });

  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = normalizedItems.map((item) => {
    const matchingProduct = productsById.get(item.product);

    if (!matchingProduct) {
      const error = new Error("Vienas iš produktų neegzistuoja.");
      error.statusCode = 404;
      throw error;
    }

    if (matchingProduct.stock < item.quantity) {
      const error = new Error(`Nepakanka likučio produktui: ${matchingProduct.name}`);
      error.statusCode = 400;
      throw error;
    }

    return {
      product: matchingProduct._id,
      name: matchingProduct.name,
      price: matchingProduct.price,
      image: matchingProduct.images[0],
      quantity: item.quantity,
    };
  });

  const itemsPrice = Number(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const shippingPrice = itemsPrice >= 100 ? 0 : 6.99;
  const taxPrice = Number((itemsPrice * 0.21).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return {
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    shippingAddress: {
      fullName: shippingAddress.fullName.trim(),
      address: shippingAddress.address.trim(),
      city: shippingAddress.city.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country.trim(),
      phone: shippingAddress.phone?.trim() || "",
    },
  };
};

const reserveStock = async (orderItems) => {
  const reservedItems = [];

  try {
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        const error = new Error(`Nepakanka likučio produktui: ${item.name}`);
        error.statusCode = 400;
        throw error;
      }

      reservedItems.push(item);
    }
  } catch (error) {
    if (reservedItems.length) {
      await releaseStock(reservedItems);
    }

    throw error;
  }
};

const releaseStock = async (orderItems) => {
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    )
  );
};

const createReservedOrder = async ({
  user,
  items,
  shippingAddress,
  paymentMethod,
  paymentStatus = "pending",
}) => {
  const draft = await buildOrderDraft({
    items,
    shippingAddress,
  });

  await reserveStock(draft.orderItems);

  try {
    const order = await Order.create({
      user: user._id,
      items: draft.orderItems,
      shippingAddress: draft.shippingAddress,
      customerEmail: user.email,
      paymentMethod,
      paymentStatus,
      stockReserved: true,
      itemsPrice: draft.itemsPrice,
      shippingPrice: draft.shippingPrice,
      taxPrice: draft.taxPrice,
      totalPrice: draft.totalPrice,
      invoice: {
        number: buildInvoiceNumber(),
        issuedAt: new Date(),
      },
    });

    return order;
  } catch (error) {
    await releaseStock(draft.orderItems);
    throw error;
  }
};

const finalizeStripeOrderPayment = async (order, session) => {
  if (!order || order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "paid";
  order.paidAt = new Date();
  order.stripeCheckoutSessionId = session.id || order.stripeCheckoutSessionId;
  order.stripePaymentIntentId =
    (typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id) ||
    order.stripePaymentIntentId;

  await order.save();
  return order;
};

const cancelStripeOrder = async (order, reason = "Checkout canceled.") => {
  if (!order || order.paymentStatus === "paid") {
    return order;
  }

  if (order.stockReserved) {
    await releaseStock(order.items);
  }

  order.paymentStatus = "canceled";
  order.stockReserved = false;
  order.checkoutExpiresAt = null;
  order.stripePaymentIntentId = order.stripePaymentIntentId || "";
  order.canceledAt = new Date();

  await order.save();
  return order;
};

const failStripeOrder = async (order, reason = "Stripe checkout expired.") => {
  if (!order || ["paid", "failed", "canceled"].includes(order.paymentStatus)) {
    return order;
  }

  if (order.stockReserved) {
    await releaseStock(order.items);
  }

  order.paymentStatus = "failed";
  order.stockReserved = false;
  order.checkoutExpiresAt = null;

  await order.save();
  return order;
};

const syncStripeOrderFromSession = async (session) => {
  const orderId = session.metadata?.orderId;
  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({ stripeCheckoutSessionId: session.id });

  if (!order) {
    return null;
  }

  if (session.payment_status === "paid") {
    return finalizeStripeOrderPayment(order, session);
  }

  if (session.status === "expired") {
    return failStripeOrder(order, "Stripe checkout expired.");
  }

  return order;
};

module.exports = {
  buildInvoiceNumber,
  canAccessOrder,
  buildOrderDraft,
  createReservedOrder,
  finalizeStripeOrderPayment,
  cancelStripeOrder,
  failStripeOrder,
  syncStripeOrderFromSession,
};
