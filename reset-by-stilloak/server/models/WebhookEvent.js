import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    livemode: { type: Boolean, default: false },
    status: { type: String, enum: ["processing", "processed", "failed"], default: "processing" },
    error: { type: String, default: "" },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.ResetWebhookEvent || mongoose.model("ResetWebhookEvent", webhookEventSchema);
