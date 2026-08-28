const WebServiceRequest = require("../models/WebServiceRequest");

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");
const sameAmount = (expected, actualCents) =>
  Math.round(Number(expected || 0) * 100) > 0 &&
  Math.round(Number(expected || 0) * 100) === Number(actualCents || 0);

const syncWebServiceFinalPaymentFromSession = async (session, { expired = false } = {}) => {
  if (session?.metadata?.checkoutType !== "web_service_final_payment") return null;
  const request = await WebServiceRequest.findById(String(session.metadata?.requestId || "").trim());
  if (!request || request.requestNumber !== String(session.metadata?.requestNumber || "").trim()) return null;

  if (expired) {
    if (request.finalPaymentStatus === "pending" && request.stripeFinalCheckoutSessionId === session.id) {
      request.finalPaymentStatus = "requested";
      request.stripeFinalCheckoutSessionId = "";
      request.contactHistory.push({ type: "note", note: "Stripe likusios sumos sesija baigė galioti neapmokėta.", happenedAt: new Date() });
      await request.save();
    }
    return request;
  }

  if (session.payment_status !== "paid" || !sameAmount(request.finalPaymentAmount, session.amount_total)) return request;
  request.finalPaymentStatus = "paid";
  request.finalPaymentMethod = "stripe";
  request.finalPaymentPaidAt = request.finalPaymentPaidAt || new Date();
  request.stripeFinalCheckoutSessionId = session.id || request.stripeFinalCheckoutSessionId;
  request.stripeFinalPaymentIntentId = getStripeId(session.payment_intent) || request.stripeFinalPaymentIntentId;
  request.status = "completed";
  request.projectStage = "completed";
  request.nextAction = "Projektas apmokėtas pilnai";
  request.nextActionAt = null;
  const note = "Gauta likusi projekto suma per Stripe.";
  if (!request.contactHistory.some((entry) => entry.note === note)) {
    request.contactHistory.push({ type: "note", note, happenedAt: new Date() });
  }
  await request.save();
  return request;
};

module.exports = { syncWebServiceFinalPaymentFromSession };
