import mongoose from "mongoose";

const rateLimitBucketSchema = new mongoose.Schema(
  {
    _id: { type: String },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

export default mongoose.models.ResetRateLimitBucket || mongoose.model("ResetRateLimitBucket", rateLimitBucketSchema);
