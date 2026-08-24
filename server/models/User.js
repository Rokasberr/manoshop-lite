const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "basic", "personal", "private_business", "bazinis", "asmeninis", "privatus_verslas"],
      default: "free",
    },
    planName: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "inactive",
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "unpaid",
        "paused",
      ],
      default: "active",
    },
    provider: {
      type: String,
      enum: ["internal", "stripe", "paysera", "crypto"],
      default: "internal",
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    stripePriceId: {
      type: String,
      default: "",
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    passwordResetTokenHash: {
      type: String,
      default: "",
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    authVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "Customer", "Admin"],
      default: "customer",
    },
    isAdmin: {
      type: Boolean,
      default: false,
      select: true,
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({
        plan: "free",
        planName: "",
        status: "active",
        provider: "internal",
      }),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ "subscription.stripeCustomerId": 1 }, { sparse: true });
userSchema.index({ "subscription.stripeSubscriptionId": 1 }, { sparse: true });
userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });

userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
