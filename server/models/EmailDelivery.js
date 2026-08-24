const mongoose = require("mongoose");

const emailDeliverySchema = new mongoose.Schema(
  {
    deliveryKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    dedupeKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["processing", "sent", "failed"],
      default: "processing",
      index: true,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    provider: {
      type: String,
      default: "",
      trim: true,
    },
    messageId: {
      type: String,
      default: "",
      trim: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

emailDeliverySchema.index({ type: 1, dedupeKey: 1 }, { unique: true });
emailDeliverySchema.index({ status: 1, updatedAt: 1 });

module.exports = mongoose.model("EmailDelivery", emailDeliverySchema);
