const WebServiceRequest = require("../models/WebServiceRequest");
const { deliverWebServiceTestInvoice } = require("../services/webServiceTestInvoiceEmailService");
const { createHttpError } = require("../utils/httpError");

const resendAdminWebServiceTestInvoice = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  const paymentType = String(req.body?.paymentType || "").trim();
  if (!['deposit', 'final'].includes(paymentType)) throw createHttpError("Pasirinkite avanso arba likučio sąskaitą.", 400);
  if (paymentType === "deposit" && request.depositStatus !== "paid") throw createHttpError("Avansas dar neapmokėtas.", 409);
  if (paymentType === "final" && request.finalPaymentStatus !== "paid") throw createHttpError("Likutis dar neapmokėtas.", 409);

  const delivery = await deliverWebServiceTestInvoice({ request, paymentType });
  request.contactHistory.push({ type: "email", note: `Pakartotinai išsiųsta ${paymentType === "final" ? "likučio" : "avanso"} testinė PDF sąskaita.`, happenedAt: new Date() });
  await request.save();
  res.json({ request, delivery: { sent: delivery.sent, provider: delivery.provider, invoiceNumber: delivery.invoiceNumber } });
};

module.exports = { resendAdminWebServiceTestInvoice };
