const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["inactive", "active", "trialing", "past_due", "canceled", "incomplete"],
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
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({
        plan: "free",
        status: "active",
        provider: "internal",
      }),
    },
  },
  {
    timestamps: true,
  }
);

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
