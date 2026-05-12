const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const { getStripeClient } = require("../utils/stripeClient");
const { createHttpError } = require("../utils/httpError");

const parseListLimit = (value, fallback = 100) => Math.min(Math.max(Number(value) || fallback, 1), 250);

const getAdminOrders = async (req, res) => {
  const limit = parseListLimit(req.query.limit);
  const orders = await Order.find()
    .populate("user", "name email role")
    .populate("store", "name slug")
    .populate("storeOwner", "name email role")
    .populate("product")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(orders);
};

const getAdminPayments = async (req, res) => {
  const limit = parseListLimit(req.query.limit);
  const payments = await Payment.find()
    .populate("user", "name email role")
    .populate("order")
    .populate("subscription")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(payments);
};

const getAdminSubscriptions = async (req, res) => {
  const limit = parseListLimit(req.query.limit);
  const subscriptions = await Subscription.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(subscriptions);
};

const refundPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("order");

  if (!payment) {
    throw createHttpError("Mokėjimas nerastas.", 404);
  }

  if (payment.provider !== "stripe" || !payment.stripePaymentIntentId) {
    throw createHttpError("Šis mokėjimas neturi Stripe PaymentIntent.", 400);
  }

  if (!["succeeded", "partially_refunded"].includes(payment.status)) {
    throw createHttpError("Refund galima pradėti tik sėkmingam mokėjimui.", 409);
  }

  const refundAmount = Number(req.body?.amount || 0);
  const stripe = getStripeClient();
  const refundPayload = {
    payment_intent: payment.stripePaymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      paymentId: payment._id.toString(),
      orderId: payment.order?._id?.toString() || "",
      requestedBy: req.user._id.toString(),
    },
  };

  if (Number.isFinite(refundAmount) && refundAmount > 0) {
    refundPayload.amount = Math.round(refundAmount * 100);
  }

  const refund = await stripe.refunds.create(refundPayload, {
    idempotencyKey: `admin-refund:${payment._id}:${refundPayload.amount || "full"}`,
  });

  res.status(202).json({
    message: "Refund išsiųstas Stripe. Vietinė būsena atsinaujins per webhook.",
    refundId: refund.id,
    payment,
  });
};

const cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id).populate("user", "name email role");

  if (!subscription) {
    throw createHttpError("Prenumerata nerasta.", 404);
  }

  if (subscription.provider !== "stripe" || !subscription.stripeSubscriptionId) {
    throw createHttpError("Ši prenumerata neturi Stripe Subscription ID.", 400);
  }

  if (subscription.status === "canceled") {
    throw createHttpError("Prenumerata jau atšaukta.", 409);
  }

  const cancelAtPeriodEnd = req.body?.cancelAtPeriodEnd !== false;
  const stripe = getStripeClient();
  const stripeSubscription = cancelAtPeriodEnd
    ? await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        canceledByAdminId: req.user._id.toString(),
      },
    })
    : await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  res.status(202).json({
    message: "Prenumeratos atšaukimas išsiųstas Stripe. Vietinė būsena atsinaujins per webhook.",
    stripeSubscriptionId: stripeSubscription.id,
    cancelAtPeriodEnd,
    subscription,
  });
};

module.exports = {
  cancelSubscription,
  getAdminOrders,
  getAdminPayments,
  getAdminSubscriptions,
  refundPayment,
};
