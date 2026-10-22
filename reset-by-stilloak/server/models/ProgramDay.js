import mongoose from "mongoose";

const programDaySchema = new mongoose.Schema(
  {
    duration: { type: Number, enum: [7, 30, 60, 90], required: true },
    day: { type: Number, min: 1, max: 90, required: true },
    focus: { type: String, required: true, maxlength: 160 },
    challenge: { type: String, required: true, maxlength: 300 },
    reflection: { type: String, required: true, maxlength: 300 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

programDaySchema.index({ duration: 1, day: 1 }, { unique: true });

export default mongoose.models.ResetProgramDay || mongoose.model("ResetProgramDay", programDaySchema);
