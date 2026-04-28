const mongoose = require("mongoose");

const savingsStudioAuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    entityId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavingsStudioAuditLog", savingsStudioAuditLogSchema);
