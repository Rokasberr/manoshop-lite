import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const emailPreferencesSchema = new mongoose.Schema(
  {
    morningEnabled: { type: Boolean, default: false },
    morningTime: { type: String, default: "07:30" },
    eveningEnabled: { type: Boolean, default: false },
    eveningTime: { type: String, default: "21:30" },
    weeklyEnabled: { type: Boolean, default: false }
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    goals: [{ type: String }],
    wakeTime: { type: String, default: "08:00" },
    bedtime: { type: String, default: "23:30" },
    cigarettesPerDay: { type: Number, default: 0, min: 0, max: 200 },
    cigaretteTarget: { type: Number, default: 0, min: 0, max: 200 },
    screenTimeMinutes: { type: Number, default: 240, min: 0, max: 1440 },
    screenTargetMinutes: { type: Number, default: 180, min: 0, max: 1440 },
    exerciseFrequency: { type: Number, default: 3, min: 0, max: 14 },
    readingMinutes: { type: Number, default: 20, min: 0, max: 600 },
    morningRoutine: { type: String, default: "Water, shower, breakfast" },
    eveningRoutine: { type: String, default: "No-scroll wind-down, hygiene, reading" },
    scheduleMode: { type: String, enum: ["exact", "flexible"], default: "exact" },
    timeZone: { type: String, default: "Europe/Vilnius" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    authVersion: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "lifetime"], default: "free" },
    lifetime: {
      active: { type: Boolean, default: false },
      activatedAt: { type: Date, default: null },
      stripeCustomerId: { type: String, default: "", select: false },
      stripePaymentIntentId: { type: String, default: "", select: false },
      stripeCheckoutSessionId: { type: String, default: "", select: false },
      paymentStatus: { type: String, default: "not_started" }
    },
    onboardingComplete: { type: Boolean, default: false },
    resetDuration: { type: Number, enum: [7, 30, 60, 90], default: 7 },
    resetStartedAt: { type: Date, default: Date.now },
    preferences: { type: preferencesSchema, default: () => ({}) },
    emailPreferences: { type: emailPreferencesSchema, default: () => ({}) },
    passwordResetTokenHash: { type: String, default: "", select: false },
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    lastActiveAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(value) {
  return bcrypt.compare(value, this.password);
};

export default mongoose.models.ResetUser || mongoose.model("ResetUser", userSchema);
