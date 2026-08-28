const WebServiceRequest = require("../models/WebServiceRequest");

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const sameAmount = (expected, amountTotal) => {
  const expectedCents = Math.round(Number(expected || 0) * 100);
  const actualCents = Number(amountTotal || 0);
  return expectedCents > 0 && expectedCents === actualCents;
};

const syncWebServiceDepositFromSession = async (session, { expired = false } = {}) => {
  if (session?.metadata?.checkoutType !== "web_service_deposit") return null;

  const requestId = String(session.metadata?.requestId || "").trim();
  const requestNumber = String(session.metadata?.requestNumber || "").trim();

  if (!requestId || !requestNumber) return null;

  const request = await WebServiceRequest.findById(requestId);
  if (!request || request.requestNumber !== requestNumber) return null;

  if (expired) {
    if (
      request.depositStatus === "pending" &&
      (!request.stripeDepositCheckoutSessionId || request.stripeDepositCheckoutSessionId === session.id)
    ) {
      request.depositStatus = "not_requested";
      request.stripeDepositCheckoutSessionId = "";
      request.contactHistory.push({
        type: "note",
        note: "Stripe avanso apmokėjimo sesija baigė galioti neapmokėta.",
        happenedAt: new Date(),
      });
      await request.save();
    }
    return request;
  }

  if (session.payment_status !== "paid") return request;
  if (!sameAmount(request.depositAmount, session.amount_total)) return request;

  request.depositStatus = "paid";
  request.depositPaymentMethod = "stripe";
  request.depositPaidAt = request.depositPaidAt || new Date();
  request.stripeDepositCheckoutSessionId = session.id || request.stripeDepositCheckoutSessionId;
  request.stripeDepositPaymentIntentId =
    getStripeId(session.payment_intent) || request.stripeDepositPaymentIntentId;
  request.nextAction = "Suderinti projekto startą ir pradėti darbus";
  request.nextActionAt = null;

  const alreadyLogged = request.contactHistory.some(
    (entry) => entry.note === `Gautas ${request.depositPercent}% projekto avansas per Stripe.`
  );

  if (!alreadyLogged) {
    request.contactHistory.push({
      type: "note",
      note: `Gautas ${request.depositPercent}% projekto avansas per Stripe.`,
      happenedAt: new Date(),
    });
  }

  await request.save();
  return request;
};

const syncWebServiceDepositRefund = async ({ paymentIntentId }) => {
  const normalizedPaymentIntentId = String(paymentIntentId || "").trim();
  if (!normalizedPaymentIntentId) return null;

  const request = await WebServiceRequest.findOne({
    stripeDepositPaymentIntentId: normalizedPaymentIntentId,
  });

  if (!request) return null;

  request.depositStatus = "refunded";
  request.contactHistory.push({
    type: "note",
    note: "Stripe projekto avansas pažymėtas kaip grąžintas.",
    happenedAt: new Date(),
  });
  await request.save();
  return request;
};

module.exports = {
  syncWebServiceDepositFromSession,
  syncWebServiceDepositRefund,
};
