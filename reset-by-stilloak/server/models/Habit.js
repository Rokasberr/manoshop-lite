import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetUser", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    frequency: { type: String, enum: ["daily", "weekdays", "custom"], default: "daily" },
    days: [{ type: Number, min: 0, max: 6 }],
    scheduleMode: { type: String, enum: ["exact", "flexible"], default: "flexible" },
    time: { type: String, default: "" },
    anchor: {
      type: String,
      enum: ["Morning", "Midday", "Afternoon", "Evening", "Before bed"],
      default: "Morning"
    },
    targetPerDay: { type: Number, default: 1, min: 1, max: 20 },
    isDefault: { type: Boolean, default: false },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, archived: 1 });

export default mongoose.models.ResetHabit || mongoose.model("ResetHabit", habitSchema);
