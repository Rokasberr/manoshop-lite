const mongoose = require("mongoose");

const digitalProductPurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      default: "",
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "eur",
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

digitalProductPurchaseSchema.index({ user: 1, productId: 1 }, { unique: true });
digitalProductPurchaseSchema.index({ stripeSessionId: 1 }, { sparse: true });
digitalProductPurchaseSchema.index({ purchasedAt: -1 });

module.exports = mongoose.model("DigitalProductPurchase", digitalProductPurchaseSchema);
