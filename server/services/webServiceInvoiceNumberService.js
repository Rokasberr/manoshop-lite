const InvoiceSequence = require("../models/InvoiceSequence");

const INVOICE_SERIES = "ST";

const formatWebServiceInvoiceNumber = ({ year, value }) =>
  `${INVOICE_SERIES}-${year}-${String(value).padStart(4, "0")}`;

const allocateWebServiceInvoiceNumber = async (issuedAt = new Date()) => {
  const date = new Date(issuedAt);
  if (Number.isNaN(date.getTime())) throw new Error("Netinkama sąskaitos data.");
  const year = date.getUTCFullYear();
  const sequence = await InvoiceSequence.findOneAndUpdate(
    { series: INVOICE_SERIES, year },
    { $inc: { value: 1 }, $setOnInsert: { series: INVOICE_SERIES, year } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return formatWebServiceInvoiceNumber({ year, value: sequence.value });
};

module.exports = { INVOICE_SERIES, allocateWebServiceInvoiceNumber, formatWebServiceInvoiceNumber };
