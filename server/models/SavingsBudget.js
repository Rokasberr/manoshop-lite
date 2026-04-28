const mongoose = require("mongoose");

const savingsBudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  {
    timestamps: true,
  }
);

savingsBudgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("SavingsBudget", savingsBudgetSchema);
