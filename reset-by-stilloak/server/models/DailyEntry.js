import mongoose from "mongoose";

const routineItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, default: "" },
    anchor: { type: String, default: "" },
    status: { type: String, enum: ["pending", "done", "skipped"], default: "pending" },
    note: { type: String, default: "", maxlength: 400 },
    source: { type: String, enum: ["routine", "habit"], default: "routine" },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetHabit", default: null }
  },
  { _id: false }
);

const dailyEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "ResetUser", required: true, index: true },
    date: { type: String, required: true },
    routine: [routineItemSchema],
    cigarettes: { type: Number, default: null, min: 0, max: 200 },
    cigaretteTarget: { type: Number, default: null, min: 0, max: 200 },
    lastCigaretteAt: { type: Date, default: null },
    screenTimeMinutes: { type: Number, default: null, min: 0, max: 1440 },
    screenTargetMinutes: { type: Number, default: null, min: 0, max: 1440 },
    noScrollCompleted: { type: Boolean, default: null },
    noScrollStart: { type: String, default: "22:00" },
    noScrollEnd: { type: String, default: "08:00" },
    mood: { type: Number, default: null, min: 1, max: 5 },
    workout: { type: Boolean, default: null },
    readingMinutes: { type: Number, default: null, min: 0, max: 600 },
    sleepTime: { type: String, default: "" },
    wentWell: { type: String, default: "", maxlength: 500 },
    mainFocus: { type: String, default: "", maxlength: 160 },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.ResetDailyEntry || mongoose.model("ResetDailyEntry", dailyEntrySchema);
