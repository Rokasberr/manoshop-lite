const crypto = require("crypto");

const WebServiceRequest = require("../models/WebServiceRequest");
const {
  areWebStripeDepositsEnabled,
  getWebBankTransferDetails,
} = require("../config/webServicePayments");
const { syncWebServiceDepositFromSession } = require("../services/webServiceDepositService");
const { syncWebServiceFinalPaymentFromSession } = require("../services/webServiceFinalPaymentService");
const { deliverWebServiceTestInvoice } = require("../services/webServiceTestInvoiceEmailService");
const { createHttpError } = require("../utils/httpError");
const { getWebServiceStripeClient } = require("../utils/stripeClient");

const PROPOSAL_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const cleanToken = (value) => String(value || "").trim();
const hashProposalToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const findProposalByToken = async (rawToken) => {
  const token = cleanToken(rawToken);
  if (!PROPOSAL_TOKEN_PATTERN.test(token)) {
    throw createHttpError("Pasiūlymo nuoroda negalioja.", 404);
  }

  const request = await WebServiceRequest.findOne({ proposalTokenHash: hashProposalToken(token) });
  if (!request) {
    throw createHttpError("Pasiūlymas nerastas arba nuoroda nebegalioja.", 404);
  }

  return request;
};

const retireExistingStripeDepositSession = async (request) => {
  if (!request.stripeDepositCheckoutSessionId || request.depositStatus === "paid") return request;

  try {
    const stripe = getWebServiceStripeClient();
    const session = await stripe.checkout.sessions.retrieve(request.stripeDepositCheckoutSessionId);

    if (session.payment_status === "paid") {
      await syncWebServiceDepositFromSession(session);
      return WebServiceRequest.findById(request._id);
    }

    if (session.status === "open") {
      await stripe.checkout.sessions.expire(session.id);
    }

    if (request.depositStatus === "pending") {
      request.depositStatus = "not_requested";
    }
    request.stripeDepositCheckoutSessionId = "";
    request.contactHistory.push({
      type: "note",
      note: "Ankstesnė neapmokėta Stripe avanso sesija uždaryta pereinant prie banko pavedimo.",
      happenedAt: new Date(),
    });
    await request.save();
  } catch (error) {
    console.warn(
      `[web-bank-transfer] Nepavyko uždaryti Stripe sesijos ${request.stripeDepositCheckoutSessionId}: ${error.message}`
    );
  }

  return request;
};

const getPublicWebServiceBankTransfer = async (req, res) => {
  let request = await findProposalByToken(req.params.token);

  if (request.proposalStatus !== "accepted") {
    throw createHttpError("Banko pavedimo duomenys rodomi tik patvirtinus pasiūlymą.", 409);
  }

  const bankTransfer = getWebBankTransferDetails(request.requestNumber);
  if (!bankTransfer) {
    throw createHttpError("Banko pavedimo duomenys dar nesukonfigūruoti.", 503);
  }

  request = await retireExistingStripeDepositSession(request);

  res.json({
    requestNumber: request.requestNumber,
    deposit: {
      percent: request.depositPercent,
      amount: request.depositAmount,
      status: request.depositStatus,
      paidAt: request.depositPaidAt,
    },
    bankTransfer,
    stripeEnabled: areWebStripeDepositsEnabled(),
  });
};

const markAdminWebServiceBankTransferPaid = async (req, res) => {
  let request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);

  if (request.proposalStatus !== "accepted") {
    throw createHttpError("Pirmiausia klientas turi patvirtinti pasiūlymą.", 409);
  }
  if (!request.depositAmount || request.depositAmount <= 0) {
    throw createHttpError("Avanso suma nenustatyta.", 409);
  }
  if (request.depositStatus === "paid") {
    return res.json(request);
  }

  request = await retireExistingStripeDepositSession(request);
  if (request.depositStatus === "paid") return res.json(request);

  const now = new Date();
  request.depositStatus = "paid";
  request.depositPaidAt = now;
  request.depositPaymentMethod = "bank_transfer";
  request.nextAction = "Suderinti projekto startą ir pradėti darbus";
  request.nextActionAt = null;

  request.contactHistory.push({
    type: "note",
    note: `Patvirtintas ${request.depositPercent}% projekto avansas banko pavedimu (${request.depositAmount} €).`,
    happenedAt: now,
  });

  await request.save();
  try {
    await deliverWebServiceTestInvoice({ request, paymentType: "deposit" });
  } catch (error) {
    console.error(`[web-bank-transfer] ${request.requestNumber} avanso PDF laiško klaida: ${error.message}`);
  }
  res.json(request);
};

const retireExistingStripeFinalSession = async (request) => {
  if (!request.stripeFinalCheckoutSessionId || request.finalPaymentStatus === "paid") return request;
  try {
    const stripe = getWebServiceStripeClient();
    const session = await stripe.checkout.sessions.retrieve(request.stripeFinalCheckoutSessionId);
    if (session.payment_status === "paid") {
      await syncWebServiceFinalPaymentFromSession(session);
      return WebServiceRequest.findById(request._id);
    }
    if (session.status === "open") await stripe.checkout.sessions.expire(session.id);
    request.finalPaymentStatus = "requested";
    request.stripeFinalCheckoutSessionId = "";
    request.contactHistory.push({ type: "note", note: "Ankstesnė neapmokėta Stripe likučio sesija uždaryta pereinant prie banko pavedimo.", happenedAt: new Date() });
    await request.save();
  } catch (error) {
    console.warn(`[web-bank-transfer] Nepavyko uždaryti likučio Stripe sesijos: ${error.message}`);
  }
  return request;
};

const markAdminWebServiceFinalBankTransferPaid = async (req, res) => {
  let request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (request.depositStatus !== "paid" || !request.finalPaymentRequestedAt) {
    throw createHttpError("Pirmiausia turi būti gautas avansas ir paprašytas likučio mokėjimas.", 409);
  }
  if (!request.finalPaymentAmount || request.finalPaymentAmount <= 0) throw createHttpError("Likusio mokėjimo suma nenustatyta.", 409);
  if (request.finalPaymentStatus === "paid") return res.json(request);

  request = await retireExistingStripeFinalSession(request);
  if (request.finalPaymentStatus === "paid") return res.json(request);
  const now = new Date();
  request.finalPaymentStatus = "paid";
  request.finalPaymentMethod = "bank_transfer";
  request.finalPaymentPaidAt = now;
  request.status = "completed";
  request.nextAction = "Projektas apmokėtas pilnai";
  request.nextActionAt = null;
  request.contactHistory.push({ type: "note", note: `Patvirtinta likusi ${request.finalPaymentAmount} € projekto suma banko pavedimu.`, happenedAt: now });
  await request.save();
  try {
    await deliverWebServiceTestInvoice({ request, paymentType: "final" });
  } catch (error) {
    console.error(`[web-bank-transfer] ${request.requestNumber} likučio PDF laiško klaida: ${error.message}`);
  }
  res.json(request);
};

const requireWebStripeDepositsEnabled = (req, _res, next) => {
  if (!areWebStripeDepositsEnabled()) {
    throw createHttpError(
      "Kortelės mokėjimas šiuo metu išjungtas. Avansą atlikite banko pavedimu.",
      409
    );
  }
  next();
};

module.exports = {
  getPublicWebServiceBankTransfer,
  markAdminWebServiceBankTransferPaid,
  markAdminWebServiceFinalBankTransferPaid,
  requireWebStripeDepositsEnabled,
};
