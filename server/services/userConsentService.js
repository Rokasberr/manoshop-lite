const crypto = require("crypto");

const UserConsent = require("../models/UserConsent");
const { LEGAL_DOCUMENT_VERSION } = require("../config/legalDocuments");

const MAX_CHECKOUT_ATTEMPT_KEY_LENGTH = 128;
const CHECKOUT_ATTEMPT_KEY_PATTERN = /^[a-zA-Z0-9._:-]{8,128}$/;

const normalizeKeyPart = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "_");

const buildConsentKey = (...parts) => {
  const normalizedParts = parts.map(normalizeKeyPart).filter(Boolean);
  const digest = crypto.createHash("sha256").update(normalizedParts.join("\n")).digest("hex");
  const prefix = normalizedParts.slice(0, 2).join(":") || "consent";

  return `${prefix}:${digest}`;
};

const validateCheckoutAttemptKey = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();

  if (
    normalized.length < 8 ||
    normalized.length > MAX_CHECKOUT_ATTEMPT_KEY_LENGTH ||
    !CHECKOUT_ATTEMPT_KEY_PATTERN.test(normalized)
  ) {
    return "";
  }

  return normalized;
};

const reserveUserConsent = async ({
  userId,
  type,
  consentKey,
  productId = "",
  subscriptionPlan = "",
  purchase = null,
}) => {
  try {
    return await UserConsent.findOneAndUpdate(
      { consentKey },
      {
        $setOnInsert: {
          user: userId,
          type,
          consentKey,
          documentVersion: LEGAL_DOCUMENT_VERSION,
          acceptedAt: new Date(),
          productId,
          subscriptionPlan,
          purchase,
          status: "accepted",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return UserConsent.findOne({ consentKey });
    }

    throw error;
  }
};

const attachStripeSessionToConsent = async ({ consentId, stripeSessionId, purchase = null }) =>
  UserConsent.findOneAndUpdate(
    { _id: consentId },
    {
      $set: {
        stripeSessionId,
        purchase,
        status: "checkout_created",
      },
    },
    { new: true }
  );

const markConsentCheckoutFailed = async ({ consentId }) =>
  UserConsent.updateOne(
    { _id: consentId, status: { $ne: "checkout_created" } },
    {
      $set: {
        status: "checkout_failed",
      },
    }
  );

module.exports = {
  attachStripeSessionToConsent,
  buildConsentKey,
  markConsentCheckoutFailed,
  reserveUserConsent,
  validateCheckoutAttemptKey,
};
