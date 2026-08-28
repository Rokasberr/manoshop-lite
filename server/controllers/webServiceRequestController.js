const crypto = require("crypto");

const { getWebServicePlan } = require("../config/webServicePlans");
const WebServiceRequest = require("../models/WebServiceRequest");
const { STATUS_OPTIONS, CONTACT_TYPE_OPTIONS, PROJECT_STAGE_OPTIONS } = require("../models/WebServiceRequest");
const { buildIdempotencyKey } = require("../services/stripeCheckoutService");
const { syncWebServiceDepositFromSession } = require("../services/webServiceDepositService");
const { syncWebServiceFinalPaymentFromSession } = require("../services/webServiceFinalPaymentService");
const { sendWebServiceFinalPaymentEmail } = require("../services/webServiceFinalPaymentEmailService");
const { sendWebServiceProposalEmail } = require("../services/webServiceProposalEmailService");
const { sendWebServiceRequestEmails } = require("../services/webServiceRequestEmailService");
const { createHttpError } = require("../utils/httpError");
const { getWebServiceStripeClient } = require("../utils/stripeClient");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROPOSAL_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const INITIAL_FOLLOW_UP_HOURS = {
  start: 8,
  business: 4,
  pro: 2,
  custom: 2,
};
const DEFAULT_PROPOSAL_TERMS =
  "Darbų apimtis, terminas ir kaina galioja pagal šį pasiūlymą. Darbai pradedami gavus sutartą avansą. Papildomi darbai ar apimties pakeitimai derinami atskirai.";

const cleanString = (value, maxLength = 5000) =>
  String(value || "").trim().slice(0, maxLength);

const cleanAttribution = (raw = {}) => ({
  source: cleanString(raw.source, 100).toLowerCase() || "direct",
  medium: cleanString(raw.medium, 100).toLowerCase() || "none",
  campaign: cleanString(raw.campaign, 160),
  content: cleanString(raw.content, 160),
  term: cleanString(raw.term, 160),
  referrer: cleanString(raw.referrer, 500),
  landingPage: cleanString(raw.landingPage, 500),
  gclid: cleanString(raw.gclid, 200),
  fbclid: cleanString(raw.fbclid, 200),
});

const parseNullablePrice = (rawPrice, errorMessage) => {
  if (rawPrice === null || rawPrice === "" || rawPrice === undefined) return null;
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    throw createHttpError(errorMessage, 400);
  }
  return Math.round(price * 100) / 100;
};

const parseNullableDate = (rawDate, errorMessage) => {
  if (rawDate === null || rawDate === "") return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(errorMessage, 400);
  }
  return date;
};

const parseDepositPercent = (rawValue) => {
  const value = Number(rawValue ?? 50);
  if (!Number.isFinite(value) || value < 10 || value > 100) {
    throw createHttpError("Avanso procentas turi būti nuo 10 iki 100.", 400);
  }
  return Math.round(value);
};

const parseExpiryDays = (rawValue) => {
  const value = Number(rawValue ?? 14);
  if (!Number.isFinite(value) || value < 1 || value > 60) {
    throw createHttpError("Pasiūlymo galiojimas turi būti nuo 1 iki 60 dienų.", 400);
  }
  return Math.round(value);
};

const buildRequestNumber = () => {
  const year = new Date().getFullYear();
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `WEB-${year}-${token}`;
};

const getInitialNextActionAt = (planId, now = Date.now()) => {
  const hours = INITIAL_FOLLOW_UP_HOURS[planId] || INITIAL_FOLLOW_UP_HOURS.start;
  return new Date(now + hours * 60 * 60 * 1000);
};

const buildProposalToken = () => crypto.randomBytes(32).toString("hex");
const hashProposalToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const getWebPublicUrl = () =>
  (process.env.WEB_SERVICES_PUBLIC_URL?.trim() || "https://web.stilloak-studio.com").replace(/\/+$/, "");

const calculateDeposit = (price, percent) => Math.round(Number(price) * Number(percent) * 100) / 10000;

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
  finalPayment: {
    amount: request.finalPaymentAmount,
    status: request.finalPaymentStatus,
    requestedAt: request.finalPaymentRequestedAt,
    paidAt: request.finalPaymentPaidAt,
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

  if (
    request.proposalExpiresAt &&
    request.proposalExpiresAt.getTime() < Date.now() &&
    !["accepted", "declined"].includes(request.proposalStatus)
  ) {
    request.proposalStatus = "expired";
    await request.save();
  }

  return { request, token };
};

const validatePublicPayload = (body = {}) => {
  const name = cleanString(body.name, 120);
  const email = cleanString(body.email, 254).toLowerCase();
  const phone = cleanString(body.phone, 60);
  const company = cleanString(body.company, 160);
  const packageId = cleanString(body.packageId || body.service, 40).toLowerCase();
  const budget = cleanString(body.budget, 80);
  const message = cleanString(body.message, 5000);
  const website = cleanString(body.website, 200);
  const attribution = cleanAttribution(body.attribution);
  const plan = getWebServicePlan(packageId);

  if (website) {
    throw createHttpError("Nepavyko pateikti užklausos.", 400);
  }

  if (name.length < 2) {
    throw createHttpError("Įrašykite vardą.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError("Įrašykite teisingą el. pašto adresą.", 400);
  }

  if (!plan) {
    throw createHttpError("Pasirinkite svetainės kūrimo paketą.", 400);
  }

  if (message.length < 20) {
    throw createHttpError("Trumpai aprašykite projektą bent keliais sakiniais.", 400);
  }

  return { name, email, phone, company, budget, message, plan, attribution };
};

const createWebServiceRequest = async (req, res) => {
  const { name, email, phone, company, budget, message, plan, attribution } = validatePublicPayload(req.body);

  const request = await WebServiceRequest.create({
    requestNumber: buildRequestNumber(),
    name,
    email,
    phone,
    company,
    packageId: plan.id,
    packageName: plan.name,
    basePrice: plan.basePrice,
    budget: plan.id === "custom" ? budget : "",
    message,
    source: "stilloak-web-services",
    attribution,
    nextAction: "Susisiekti su klientu",
    nextActionAt: getInitialNextActionAt(plan.id),
  });

  res.status(201).json({
    message: "Užklausa gauta. Susisieksime dėl kitų projekto žingsnių.",
    requestNumber: request.requestNumber,
    status: request.status,
    package: {
      id: request.packageId,
      name: request.packageName,
      basePrice: request.basePrice,
    },
  });

  sendWebServiceRequestEmails(request).catch((error) => {
    const causes = Array.isArray(error?.causes)
      ? error.causes.map((cause) => cause?.message || String(cause)).join(" | ")
      : error?.message || String(error);
    console.error(`[web-orders] ${request.requestNumber} el. pašto pranešimų klaida: ${causes}`);
  });
};

const getAdminWebServiceRequests = async (req, res) => {
  const status = cleanString(req.query?.status, 40).toLowerCase();
  const filter = status && STATUS_OPTIONS.includes(status) ? { status } : {};

  const requests = await WebServiceRequest.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json(requests);
};

const updateAdminWebServiceRequest = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);

  if (!request) {
    throw createHttpError("Web užsakymas nerastas.", 404);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "status")) {
    const status = cleanString(req.body.status, 40).toLowerCase();
    if (!STATUS_OPTIONS.includes(status)) {
      throw createHttpError("Netinkamas užsakymo statusas.", 400);
    }
    request.status = status;
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "projectStage")) {
    const projectStage = cleanString(req.body.projectStage, 40).toLowerCase();
    if (!PROJECT_STAGE_OPTIONS.includes(projectStage)) {
      throw createHttpError("Netinkamas projekto etapas.", 400);
    }
    request.projectStage = projectStage;
    if (projectStage === "completed") request.status = "completed";
    else if (request.status === "completed") request.status = "in_progress";
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "proposalPrice")) {
    request.proposalPrice = parseNullablePrice(req.body.proposalPrice, "Netinkama pasiūlymo kaina.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "finalPrice")) {
    request.finalPrice = parseNullablePrice(req.body.finalPrice, "Netinkama galutinė projekto kaina.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "nextAction")) {
    request.nextAction = cleanString(req.body.nextAction, 500);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "nextActionAt")) {
    request.nextActionAt = parseNullableDate(req.body.nextActionAt, "Netinkama kito veiksmo data.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "dueDate")) {
    request.dueDate = parseNullableDate(req.body.dueDate, "Netinkamas projekto terminas.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "internalNotes")) {
    request.internalNotes = cleanString(req.body.internalNotes, 5000);
  }

  if (req.body?.contactEntry) {
    const type = cleanString(req.body.contactEntry.type, 40).toLowerCase() || "note";
    const note = cleanString(req.body.contactEntry.note, 2000);
    const happenedAt = parseNullableDate(
      req.body.contactEntry.happenedAt,
      "Netinkama kontakto data."
    ) || new Date();

    if (!CONTACT_TYPE_OPTIONS.includes(type)) {
      throw createHttpError("Netinkamas kontakto tipas.", 400);
    }
    if (!note) {
      throw createHttpError("Įrašykite kontakto pastabą.", 400);
    }

    request.contactHistory.push({ type, note, happenedAt });
  }

  await request.save();
  res.json(request);
};

const sendAdminWebServiceProposal = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (request.depositStatus === "paid") {
    throw createHttpError("Avansas jau apmokėtas. Naujo pasiūlymo siųsti nebegalima.", 409);
  }

  const fallbackPrice = request.proposalPrice ?? request.finalPrice ?? request.basePrice;
  const proposalPrice = parseNullablePrice(
    Object.prototype.hasOwnProperty.call(req.body || {}, "proposalPrice")
      ? req.body.proposalPrice
      : fallbackPrice,
    "Netinkama pasiūlymo kaina."
  );
  const summary = cleanString(req.body?.proposalSummary, 3000);
  const scope = cleanString(req.body?.proposalScope, 5000);
  const terms = cleanString(req.body?.proposalTerms, 5000) || DEFAULT_PROPOSAL_TERMS;
  const depositPercent = parseDepositPercent(req.body?.depositPercent);
  const expiryDays = parseExpiryDays(req.body?.expiryDays);

  if (!proposalPrice || proposalPrice <= 0) {
    throw createHttpError("Prieš siunčiant pasiūlymą nustatykite projekto kainą.", 400);
  }
  if (summary.length < 20) {
    throw createHttpError("Pasiūlymo santrauka turi būti bent 20 simbolių.", 400);
  }
  if (scope.length < 20) {
    throw createHttpError("Darbų apimtis turi būti bent 20 simbolių.", 400);
  }

  const token = buildProposalToken();
  const now = new Date();
  const proposalUrl = `${getWebPublicUrl()}/pasiulymas/${token}`;

  request.proposalPrice = proposalPrice;
  request.proposalSummary = summary;
  request.proposalScope = scope;
  request.proposalTerms = terms;
  request.proposalStatus = "sent";
  request.proposalTokenHash = hashProposalToken(token);
  request.proposalSentAt = now;
  request.proposalViewedAt = null;
  request.proposalAcceptedAt = null;
  request.proposalAcceptedName = "";
  request.proposalExpiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  request.depositPercent = depositPercent;
  request.depositAmount = calculateDeposit(proposalPrice, depositPercent);
  request.depositStatus = "not_requested";
  request.stripeDepositCheckoutSessionId = "";
  request.stripeDepositPaymentIntentId = "";
  request.depositPaidAt = null;
  request.status = "proposal_sent";
  request.nextAction = "Laukti kliento pasiūlymo patvirtinimo";
  request.nextActionAt = new Date(now.getTime() + Math.min(3, expiryDays) * 24 * 60 * 60 * 1000);
  request.contactHistory.push({
    type: "proposal",
    note: `Išsiųstas ${proposalPrice} € pasiūlymas; avansas ${depositPercent}%.`,
    happenedAt: now,
  });

  await request.save();

  let emailResult;
  try {
    emailResult = await sendWebServiceProposalEmail({ request, proposalUrl });
  } catch (error) {
    console.error(`[web-proposal] ${request.requestNumber} pasiūlymo laiško klaida: ${error.message}`);
    emailResult = { sent: false, error: error.message };
  }

  res.status(201).json({ request, proposalUrl, email: emailResult });
};

const getPublicWebServiceProposal = async (req, res) => {
  const { request } = await findProposalByToken(req.params.token);

  if (request.proposalStatus === "sent") {
    request.proposalStatus = "viewed";
    request.proposalViewedAt = request.proposalViewedAt || new Date();
    await request.save();
  }

  res.json(serializePublicProposal(request));
};

const acceptPublicWebServiceProposal = async (req, res) => {
  const { request } = await findProposalByToken(req.params.token);

  if (request.proposalStatus === "expired") {
    throw createHttpError("Pasiūlymo galiojimo laikas baigėsi.", 410);
  }
  if (request.proposalStatus === "declined") {
    throw createHttpError("Šis pasiūlymas buvo atmestas.", 409);
  }

  if (request.proposalStatus !== "accepted") {
    const acceptedName = cleanString(req.body?.acceptedName, 160);
    if (acceptedName.length < 2 || req.body?.acceptedTerms !== true) {
      throw createHttpError("Patvirtinkite vardą ir sutikimą su pasiūlymo sąlygomis.", 400);
    }

    const now = new Date();
    request.proposalStatus = "accepted";
    request.proposalAcceptedAt = now;
    request.proposalAcceptedName = acceptedName;
    request.status = "accepted";
    request.projectStage = "awaiting_deposit";
    request.nextAction = "Laukti projekto avanso apmokėjimo";
    request.nextActionAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    request.contactHistory.push({
      type: "proposal",
      note: `Klientas ${acceptedName} patvirtino pasiūlymą ir jo sąlygas.`,
      happenedAt: now,
    });
    await request.save();
  }

  res.json(serializePublicProposal(request));
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

const requestAdminWebServiceFinalPayment = async (req, res) => {
  const request = await WebServiceRequest.findById(req.params.id);
  if (!request) throw createHttpError("Web užsakymas nerastas.", 404);
  if (request.proposalStatus !== "accepted" || request.depositStatus !== "paid") {
    throw createHttpError("Likusios sumos galima prašyti tik po patvirtinto pasiūlymo ir gauto avanso.", 409);
  }
  if (request.finalPaymentStatus === "paid") throw createHttpError("Projektas jau apmokėtas pilnai.", 409);

  const amount = Math.round((Number(request.proposalPrice || 0) - Number(request.depositAmount || 0)) * 100) / 100;
  if (amount <= 0) throw createHttpError("Likusios mokėti sumos nėra.", 409);

  const token = buildProposalToken();
  const now = new Date();
  const proposalUrl = `${getWebPublicUrl()}/pasiulymas/${token}`;
  request.proposalTokenHash = hashProposalToken(token);
  request.finalPaymentAmount = amount;
  request.finalPaymentStatus = "requested";
  request.projectStage = "awaiting_final_payment";
  request.finalPaymentRequestedAt = now;
  request.finalPaymentPaidAt = null;
  request.stripeFinalCheckoutSessionId = "";
  request.stripeFinalPaymentIntentId = "";
  request.finalTestInvoiceNumber = "";
  request.finalTestInvoiceStatus = "not_created";
  request.finalTestInvoiceSentAt = null;
  request.nextAction = "Laukti likusios projekto sumos apmokėjimo";
  request.nextActionAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  request.contactHistory.push({ type: "email", note: `Paprašyta apmokėti likusią ${amount} € projekto sumą.`, happenedAt: now });
  await request.save();

  let emailResult;
  try {
    emailResult = await sendWebServiceFinalPaymentEmail({ request, proposalUrl });
  } catch (error) {
    console.error(`[web-final-payment] ${request.requestNumber} laiško klaida: ${error.message}`);
    emailResult = { sent: false, error: error.message };
  }
  res.status(201).json({ request, proposalUrl, email: emailResult });
};

const createPublicWebServiceFinalPaymentSession = async (req, res) => {
  const { request, token } = await findProposalByToken(req.params.token);
  if (!request.finalPaymentRequestedAt || !["requested", "pending", "paid"].includes(request.finalPaymentStatus)) {
    throw createHttpError("Galutinis mokėjimas dar neparuoštas.", 409);
  }
  if (request.finalPaymentStatus === "paid") return res.json({ alreadyPaid: true, proposal: serializePublicProposal(request) });
  const stripe = getWebServiceStripeClient();
  const publicUrl = getWebPublicUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: request.email,
    success_url: `${publicUrl}/pasiulymas/${token}?payment=final-success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicUrl}/pasiulymas/${token}?payment=final-cancel`,
    metadata: { checkoutType: "web_service_final_payment", requestId: request._id.toString(), requestNumber: request.requestNumber },
    payment_intent_data: { metadata: { checkoutType: "web_service_final_payment", requestId: request._id.toString(), requestNumber: request.requestNumber } },
    line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: Math.round(request.finalPaymentAmount * 100), product_data: { name: `Stilloak Web projekto likutis — ${request.requestNumber}`, description: `Galutinis atsiskaitymas už ${request.packageName}` } } }],
  }, { idempotencyKey: buildIdempotencyKey("web-service-final-payment", [request._id, request.finalPaymentRequestedAt?.toISOString(), request.finalPaymentAmount], req.headers["idempotency-key"]) });
  request.finalPaymentStatus = "pending";
  request.stripeFinalCheckoutSessionId = session.id;
  await request.save();
  res.status(201).json({ url: session.url, sessionId: session.id });
};

const confirmPublicWebServiceFinalPayment = async (req, res) => {
  const { request } = await findProposalByToken(req.params.token);
  const sessionId = cleanString(req.body?.sessionId, 255);
  if (!sessionId || sessionId !== request.stripeFinalCheckoutSessionId) throw createHttpError("Stripe apmokėjimo sesija neatitinka šio projekto.", 400);
  const session = await getWebServiceStripeClient().checkout.sessions.retrieve(sessionId);
  if (session.metadata?.checkoutType !== "web_service_final_payment" || session.metadata?.requestId !== request._id.toString() || session.metadata?.requestNumber !== request.requestNumber) {
    throw createHttpError("Stripe sesijos duomenys neatitinka projekto.", 400);
  }
  await syncWebServiceFinalPaymentFromSession(session);
  res.json(serializePublicProposal(await WebServiceRequest.findById(request._id)));
};

module.exports = {
  acceptPublicWebServiceProposal,
  confirmPublicWebServiceDeposit,
  createPublicWebServiceDepositSession,
  createWebServiceRequest,
  getAdminWebServiceRequests,
  getPublicWebServiceProposal,
  sendAdminWebServiceProposal,
  syncAdminWebServiceDeposit,
  updateAdminWebServiceRequest,
  requestAdminWebServiceFinalPayment,
  createPublicWebServiceFinalPaymentSession,
  confirmPublicWebServiceFinalPayment,
};
