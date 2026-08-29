const WebServiceRequest = require("../models/WebServiceRequest");
const { deliverWebServiceHandoverEmail } = require("../services/webServiceLifecycleEmailService");
const { deliverWebServiceTestContract } = require("../services/webServiceTestContractEmailService");
const { createHttpError } = require("../utils/httpError");

const resendAdminWebServiceTestContract = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (request.proposalStatus !== "accepted") throw createHttpError("Pasiūlymas dar nepatvirtintas.", 409);
  const delivery = await deliverWebServiceTestContract(request);
  request.contactHistory.push({ type: "email", note: "Pakartotinai išsiųsta testinė projekto sutartis.", happenedAt: new Date() });
  await request.save();
  res.json({ request, delivery: { sent: delivery.sent, provider: delivery.provider, contractNumber: delivery.contractNumber } });
};

const resendAdminWebServiceHandover = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (request.finalPaymentStatus !== "paid") throw createHttpError("Projektas dar neapmokėtas pilnai.", 409);
  request.handoverEmailStatus = "not_created";
  await request.save();
  const delivery = await deliverWebServiceHandoverEmail(request);
  res.json({ request, delivery: { sent: delivery.sent, provider: delivery.provider } });
};

module.exports = { resendAdminWebServiceHandover, resendAdminWebServiceTestContract };
