const mongoose = require("mongoose");

const subscriptionRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "personal", "private_business", "bazinis", "asmeninis", "privatus_verslas"],
      default: "free",
      index: true,
    },
    planName: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "inactive",
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "unpaid",
        "paused",
      ],
      default: "inactive",
      index: true,
    },
    provider: {
      type: String,
      enum: ["internal", "stripe"],
      default: "stripe",
      index: true,
    },
    stripeCustomerId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
      trim: true,
    },
    stripePriceId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    latestInvoiceId: {
      type: String,
      default: "",
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
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

subscriptionRecordSchema.index({ stripeSubscriptionId: 1 });
subscriptionRecordSchema.index({ user: 1, provider: 1, status: 1 });
subscriptionRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Subscription", subscriptionRecordSchema);
