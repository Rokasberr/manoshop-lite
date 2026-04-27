const Order = require("../models/Order");
const { createInvoicePdfBuffer } = require("../utils/invoicePdf");
const { getStripeClient, resolveClientUrl } = require("../utils/stripeClient");
const {
  canAccessOrder,
  createReservedOrder,
  cancelStripeOrder,
  syncStripeOrderFromSession,
} = require("../services/orderCheckoutService");

const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  const order = await createReservedOrder({
    user: req.user,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || "card",
    paymentStatus: "pending",
  });

  res.status(201).json(order);
};

const createStripeCheckoutSession = async (req, res) => {
  const { items, shippingAddress } = req.body;
  const stripe = getStripeClient();
  const clientUrl = resolveClientUrl(req.headers.origin);

  const order = await createReservedOrder({
    user: req.user,
    items,
    shippingAddress,
    paymentMethod: "stripe",
    paymentStatus: "pending",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${clientUrl}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      customer_email: req.user.email,
      client_reference_id: req.user._id.toString(),
      metadata: {
        checkoutType: "order",
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      payment_intent_data: {
        metadata: {
          checkoutType: "order",
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
        },
      })),
    });

    order.stripeCheckoutSessionId = session.id;
    order.checkoutExpiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : null;
    await order.save();

    res.status(201).json({
      url: session.url,
      sessionId: session.id,
      orderId: order._id,
    });
  } catch (error) {
    await cancelStripeOrder(order, "Stripe session creation failed.");
    await order.deleteOne();
    throw error;
  }
};

const getStripeCheckoutSessionStatus = async (req, res) => {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  const orderId = session.metadata?.orderId;
  const order = orderId
    ? await Order.findById(orderId).populate("user", "name email")
    : await Order.findOne({ stripeCheckoutSessionId: session.id }).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Stripe užsakymas nerastas.");
  }

  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error("Neturi teisės matyti šio užsakymo.");
  }

  const syncedOrder = await syncStripeOrderFromSession(session);

  res.json({
    sessionId: session.id,
    checkoutStatus: session.status,
    paymentStatus: session.payment_status,
    order: syncedOrder || order,
  });
};

const cancelStripeCheckout = async (req, res) => {
  const stripe = getStripeClient();
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Užsakymas nerastas.");
  }

  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error("Neturi teisės atšaukti šio mokėjimo.");
  }

  if (order.paymentStatus === "paid") {
    res.status(409);
    throw new Error("Apmokėto užsakymo atšaukti nebegalima.");
  }

  if (order.stripeCheckoutSessionId) {
    try {
      await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
    } catch (error) {
      const message = error.message?.toLowerCase() || "";
      const canIgnore =
        message.includes("expired") ||
        message.includes("complete") ||
        message.includes("completed") ||
        message.includes("cannot be expired");

      if (!canIgnore) {
        throw error;
      }
    }
  }

  const updatedOrder = await cancelStripeOrder(order, "Customer canceled checkout.");
  res.json({
    message: "Stripe checkout atšauktas.",
    order: updatedOrder,
  });
};

const adminCancelOrderPayment = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Užsakymas nerastas.");
  }

  if (["paid", "refunded", "canceled"].includes(order.paymentStatus)) {
    res.status(409);
    throw new Error("Šio užsakymo mokėjimo atšaukti nebegalima.");
  }

  if (order.paymentMethod === "stripe" && order.stripeCheckoutSessionId) {
    const stripe = getStripeClient();
    try {
      await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
    } catch (error) {
      const message = error.message?.toLowerCase() || "";
      const canIgnore =
        message.includes("expired") ||
        message.includes("complete") ||
        message.includes("completed") ||
        message.includes("cannot be expired");

      if (!canIgnore) {
        throw error;
      }
    }
  }

  const updatedOrder = await cancelStripeOrder(order, "Admin canceled payment.");
  const populatedOrder = await updatedOrder.populate("user", "name email");

  res.json({
    message: "Mokėjimas atšauktas, o rezervuotas likutis grąžintas.",
    order: populatedOrder,
  });
};

const refundStripeOrderPayment = async (req, res) => {
  const stripe = getStripeClient();
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Užsakymas nerastas.");
  }

  if (order.paymentStatus === "refunded") {
    res.status(409);
    throw new Error("Šis užsakymas jau yra refundintas.");
  }

  if (order.paymentStatus !== "paid") {
    res.status(409);
    throw new Error("Refund galima atlikti tik apmokėtam užsakymui.");
  }

  if (order.paymentMethod !== "stripe" || !order.stripePaymentIntentId) {
    res.status(400);
    throw new Error("Šis užsakymas neturi Stripe mokėjimo, todėl refund per sistemą negalimas.");
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      orderId: order._id.toString(),
      invoiceNumber: order.invoice?.number || "",
    },
  });

  order.paymentStatus = "refunded";
  order.refundedAt = new Date();
  order.stripeRefundId = refund.id || "";

  const updatedOrder = await order.save();
  const populatedOrder = await updatedOrder.populate("user", "name email");

  res.json({
    message: "Stripe refund sukurtas sėkmingai.",
    refundId: refund.id,
    order: populatedOrder,
  });
};

const getUserOrders = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    paymentStatus: { $ne: "canceled" },
  }).sort({ createdAt: -1 });

  res.json(orders);
};

const getAdminOrders = async (_req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "shipped", "delivered"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Netinkamas užsakymo statusas.");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Užsakymas nerastas.");
  }

  order.status = status;
  const updatedOrder = await order.save();
  const populatedOrder = await updatedOrder.populate("user", "name email");

  res.json(populatedOrder);
};

const getOrderInvoicePdf = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Užsakymas nerastas.");
  }

  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error("Neturi teisės matyti šios sąskaitos.");
  }

  const pdfBuffer = createInvoicePdfBuffer(order);
  const invoiceNumber =
    order.invoice?.number || `INV-LEGACY-${String(order._id).slice(-6).toUpperCase()}`;
  const safeFileName = `${invoiceNumber}.pdf`.replace(/[^\w.-]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.send(pdfBuffer);
};

module.exports = {
  createOrder,
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
  cancelStripeCheckout,
  adminCancelOrderPayment,
  refundStripeOrderPayment,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  getOrderInvoicePdf,
};
