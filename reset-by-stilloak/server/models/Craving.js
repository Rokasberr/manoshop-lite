import mongoose from "mongoose";

const cravingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetUser", required: true, index: true },
    level: { type: Number, min: 1, max: 5, default: 3 },
    trigger: { type: String, default: "", maxlength: 100 },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    stillWanted: { type: Boolean, default: null },
    cigaretteAvoided: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.ResetCraving || mongoose.model("ResetCraving", cravingSchema);
