import mongoose from "mongoose";

const smokingEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetUser", required: true, index: true },
    date: { type: String, required: true, index: true },
    smokedAt: { type: Date, default: Date.now },
    trigger: { type: String, default: "", maxlength: 100 }
  },
  { timestamps: true }
);

export default mongoose.models.ResetSmokingEvent || mongoose.model("ResetSmokingEvent", smokingEventSchema);
