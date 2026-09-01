const WebServiceRequest = require("../models/WebServiceRequest");
const { deliverWebServiceInvoice } = require("../services/webServiceInvoiceDeliveryService");
const { createHttpError } = require("../utils/httpError");

const resendAdminWebServiceTestInvoice = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  const paymentType = String(req.body?.paymentType || "").trim();
  if (!['deposit', 'final'].includes(paymentType)) throw createHttpError("Pasirinkite pirmo mokėjimo arba likučio sąskaitą.", 400);
  if (paymentType === "deposit" && request.depositStatus !== "paid") throw createHttpError("Pirmas mokėjimas dar negautas.", 409);
  if (paymentType === "final" && request.finalPaymentStatus !== "paid") throw createHttpError("Likutis dar neapmokėtas.", 409);

  const delivery = await deliverWebServiceInvoice({ request, paymentType });
  const paymentLabel = paymentType === "final" ? "likučio" : request.paymentPlan === "full" ? "pilno mokėjimo" : "avanso";
  request.contactHistory.push({ type: "email", note: `Pakartotinai išsiųsta ${paymentLabel} ${delivery.official ? "oficiali" : "testinė"} PDF sąskaita.`, happenedAt: new Date(), actorName: req.user?.name || "Administratorius", actorEmail: req.user?.email || "" });
  await request.save();
  res.json({ request, delivery: { sent: delivery.sent, provider: delivery.provider, invoiceNumber: delivery.invoiceNumber } });
};

module.exports = { resendAdminWebServiceTestInvoice };
