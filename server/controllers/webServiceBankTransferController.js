const crypto = require("crypto");

const WebServiceRequest = require("../models/WebServiceRequest");
const {
  areWebStripeDepositsEnabled,
  getWebBankTransferDetails,
} = require("../config/webServicePayments");
const { createHttpError } = require("../utils/httpError");

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

const getPublicWebServiceBankTransfer = async (req, res) => {
  const request = await findProposalByToken(req.params.token);

  if (request.proposalStatus !== "accepted") {
    throw createHttpError("Banko pavedimo duomenys rodomi tik patvirtinus pasiūlymą.", 409);
  }

  const bankTransfer = getWebBankTransferDetails(request.requestNumber);
  if (!bankTransfer) {
    throw createHttpError("Banko pavedimo duomenys dar nesukonfigūruoti.", 503);
  }

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
  const request = await WebServiceRequest.findById(req.params.id);
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
  requireWebStripeDepositsEnabled,
};
