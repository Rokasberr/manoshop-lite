const mongoose = require("mongoose");

const savingsStudioProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlySavingsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    primaryFocus: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavingsStudioProfile", savingsStudioProfileSchema);
