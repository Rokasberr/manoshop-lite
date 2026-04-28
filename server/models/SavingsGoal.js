const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: String,
      default: "",
      match: [/^$|^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD date format"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
