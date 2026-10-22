import mongoose from "mongoose";

const emailDeliverySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetUser", required: true, index: true },
    type: { type: String, required: true },
    dedupeKey: { type: String, required: true },
    recipient: { type: String, required: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    providerMessageId: { type: String, default: "" },
    error: { type: String, default: "" },
    sentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

emailDeliverySchema.index({ userId: 1, type: 1, dedupeKey: 1 }, { unique: true });

export default mongoose.models.ResetEmailDelivery || mongoose.model("ResetEmailDelivery", emailDeliverySchema);
