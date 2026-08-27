const crypto = require("crypto");

const { getWebServicePlan } = require("../config/webServicePlans");
const WebServiceRequest = require("../models/WebServiceRequest");
const { STATUS_OPTIONS } = require("../models/WebServiceRequest");
const { sendWebServiceRequestEmails } = require("../services/webServiceRequestEmailService");
const { createHttpError } = require("../utils/httpError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const buildRequestNumber = () => {
  const year = new Date().getFullYear();
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `WEB-${year}-${token}`;
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

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "finalPrice")) {
    const rawPrice = req.body.finalPrice;
    if (rawPrice === null || rawPrice === "") {
      request.finalPrice = null;
    } else {
      const finalPrice = Number(rawPrice);
      if (!Number.isFinite(finalPrice) || finalPrice < 0 || finalPrice > 1_000_000) {
        throw createHttpError("Netinkama galutinė projekto kaina.", 400);
      }
      request.finalPrice = Math.round(finalPrice * 100) / 100;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "internalNotes")) {
    request.internalNotes = cleanString(req.body.internalNotes, 5000);
  }

  await request.save();
  res.json(request);
};

module.exports = {
  createWebServiceRequest,
  getAdminWebServiceRequests,
  updateAdminWebServiceRequest,
};
