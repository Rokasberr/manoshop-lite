const crypto = require("crypto");

const WebServiceRequest = require("../models/WebServiceRequest");
const { buildIdempotencyKey } = require("../services/stripeCheckoutService");
const { syncWebServiceDepositFromSession } = require("../services/webServiceDepositService");
const { createHttpError } = require("../utils/httpError");
const { getWebServiceStripeClient } = require("../utils/webServiceStripeClient");

const PROPOSAL_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const cleanString = (value, maxLength = 5000) =>
  String(value || "").trim().slice(0, maxLength);

const hashProposalToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const getWebPublicUrl = () =>
  (process.env.WEB_SERVICES_PUBLIC_URL?.trim() || "https://web.stilloak-studio.com").replace(/\/+$/, "");

const serializePublicProposal = (request) => ({
  requestNumber: request.requestNumber,
  customer: {
    name: request.name,
    company: request.company || "",
  },
  package: {
    id: request.packageId,
    name: request.packageName,
  },
  proposal: {
    price: request.proposalPrice,
    summary: request.proposalSummary,
    scope: request.proposalScope,
    terms: request.proposalTerms,
    status: request.proposalStatus,
    sentAt: request.proposalSentAt,
    viewedAt: request.proposalViewedAt,
    acceptedAt: request.proposalAcceptedAt,
    acceptedName: request.proposalAcceptedName,
    expiresAt: request.proposalExpiresAt,
    termsVersion: request.proposalTermsVersion,
  },
  deposit: {
    percent: request.depositPercent,
    amount: request.depositAmount,
    status: request.depositStatus,
    paidAt: request.depositPaidAt,
  },
});

const findProposalByToken = async (rawToken) => {
  const token = cleanString(rawToken, 80);
  if (!PROPOSAL_TOKEN_PATTERN.test(token)) {
    throw createHttpError("Pasiūlymo nuoroda negalioja.", 404);
  }

  const request = await WebServiceRequest.findOne({ proposalTokenHash: hashProposalToken(token) });
  if (!request) {
    throw createHttpError("Pasiūlymas nerastas arba nuoroda nebegalioja.", 404);
  }

  return { request, token };
};

const createPublicWebServiceDepositSession = async (req, res) => {
  const { request, token } = await findProposalByToken(req.params.token);

  if (request.proposalStatus !== "accepted") {
    throw createHttpError("Pirmiausia patvirtinkite pasiūlymą.", 409);
  }
  if (request.depositStatus === "paid") {
    return res.json({ alreadyPaid: true, proposal: serializePublicProposal(request) });
  }
  if (!request.depositAmount || request.depositAmount <= 0) {
    throw createHttpError("Avanso suma nenustatyta.", 409);
  }

  const stripe = getWebServiceStripeClient();
  const publicUrl = getWebPublicUrl();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: request.email,
      success_url: `${publicUrl}/pasiulymas/${token}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicUrl}/pasiulymas/${token}?payment=cancel`,
      metadata: {
        checkoutType: "web_service_deposit",
        requestId: request._id.toString(),
        requestNumber: request.requestNumber,
      },
      payment_intent_data: {
        metadata: {
          checkoutType: "web_service_deposit",
          requestId: request._id.toString(),
          requestNumber: request.requestNumber,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(request.depositAmount * 100),
            product_data: {
              name: `Stilloak Web projekto avansas — ${request.requestNumber}`,
              description: `${request.depositPercent}% avansas už ${request.packageName}`,
            },
          },
        },
      ],
    },
    {
      idempotencyKey: buildIdempotencyKey(
        "web-service-deposit",
        [request._id, request.proposalAcceptedAt?.toISOString(), request.depositAmount],
        req.headers["idempotency-key"]
      ),
    }
  );

  request.depositStatus = "pending";
  request.stripeDepositCheckoutSessionId = session.id;
  await request.save();

  res.status(201).json({ url: session.url, sessionId: session.id });
};

const confirmPublicWebServiceDeposit = async (req, res) => {
  const { request } = await findProposalByToken(req.params.token);
  const sessionId = cleanString(req.body?.sessionId, 255);

  if (!sessionId || sessionId !== request.stripeDepositCheckoutSessionId) {
    throw createHttpError("Stripe apmokėjimo sesija neatitinka šio pasiūlymo.", 400);
  }

  const stripe = getWebServiceStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.metadata?.checkoutType !== "web_service_deposit" ||
    session.metadata?.requestId !== request._id.toString() ||
    session.metadata?.requestNumber !== request.requestNumber
  ) {
    throw createHttpError("Stripe sesijos duomenys neatitinka pasiūlymo.", 400);
  }

  await syncWebServiceDepositFromSession(session);
  const current = await WebServiceRequest.findById(request._id);
  res.json(serializePublicProposal(current));
};

const syncAdminWebServiceDeposit = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (!request.stripeDepositCheckoutSessionId) {
    throw createHttpError("Šiam pasiūlymui Stripe avanso sesija dar nesukurta.", 409);
  }

  const stripe = getWebServiceStripeClient();
  const session = await stripe.checkout.sessions.retrieve(request.stripeDepositCheckoutSessionId);
  await syncWebServiceDepositFromSession(session, { expired: session.status === "expired" });
  res.json(await WebServiceRequest.findById(request._id));
};

module.exports = {
  confirmPublicWebServiceDeposit,
  createPublicWebServiceDepositSession,
  syncAdminWebServiceDeposit,
};
