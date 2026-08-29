const mongoose = require("mongoose");

const operationalEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["application_error", "backup_success", "backup_failed"], required: true, index: true },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "warning", index: true },
    message: { type: String, required: true, maxlength: 500 },
    context: { type: mongoose.Schema.Types.Mixed, default: {} },
    resolvedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

operationalEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("OperationalEvent", operationalEventSchema);
