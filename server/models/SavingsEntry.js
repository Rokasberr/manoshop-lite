const mongoose = require("mongoose");

const savingsEntrySchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
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

module.exports = mongoose.model("SavingsEntry", savingsEntrySchema);
