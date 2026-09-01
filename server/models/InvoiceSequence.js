const mongoose = require("mongoose");

const invoiceSequenceSchema = new mongoose.Schema(
  {
    series: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    year: { type: Number, required: true, min: 2020, max: 2200 },
    value: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

invoiceSequenceSchema.index({ series: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("InvoiceSequence", invoiceSequenceSchema);
