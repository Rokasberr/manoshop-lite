const mongoose = require("mongoose");

const recurringExpenseSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
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

module.exports = mongoose.model("RecurringExpense", recurringExpenseSchema);
