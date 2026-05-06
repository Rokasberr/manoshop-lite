const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    livemode: {
      type: Boolean,
      default: false,
    },
    apiVersion: {
      type: String,
      default: "",
      trim: true,
    },
    processingStatus: {
      type: String,
      enum: ["processing", "processed", "failed"],
      default: "processing",
      index: true,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    processedAt: {
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

webhookEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);
