const mongoose = require("mongoose");

const userConsentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "registration_terms_privacy",
        "digital_content_immediate_access",
        "subscription_checkout_notice",
      ],
      index: true,
    },
    consentKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    documentVersion: {
      type: String,
      required: true,
      trim: true,
    },
    acceptedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["accepted", "checkout_created", "checkout_failed"],
      default: "accepted",
      index: true,
    },
    productId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DigitalProductPurchase",
      default: null,
      index: true,
    },
    subscriptionPlan: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userConsentSchema.index({ user: 1, type: 1, productId: 1, stripeSessionId: 1 });
userConsentSchema.index({ user: 1, type: 1, subscriptionPlan: 1, acceptedAt: -1 });

module.exports = mongoose.model("UserConsent", userConsentSchema);
