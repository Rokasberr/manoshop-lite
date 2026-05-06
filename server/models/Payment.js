const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
      index: true,
    },
    provider: {
      type: String,
      enum: ["stripe"],
      default: "stripe",
      index: true,
    },
    type: {
      type: String,
      enum: ["one_time", "subscription_invoice", "refund"],
      default: "one_time",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "eur",
    },
    stripeCustomerId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
      trim: true,
    },
    stripeChargeId: {
      type: String,
      default: "",
      trim: true,
    },
    stripeInvoiceId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripeRefundId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeChargeId: 1 });
paymentSchema.index({ stripeInvoiceId: 1, type: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
