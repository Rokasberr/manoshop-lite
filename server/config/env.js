const requiredInAllEnvironments = ["MONGO_URI", "JWT_SECRET"];
const requiredPaidStripePriceKeys = [
  "STRIPE_PRICE_ASMENINIS",
  "STRIPE_PRICE_PRIVATUS_VERSLAS",
];
const requiredInProduction = [
  "CLIENT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const { isBrevoEmailConfigured } = require("../utils/brevoEmail");
const { isFullEmailTransportConfigured } = require("../utils/emailTransport");

const getMissingKeys = (keys) => keys.filter((key) => !process.env[key]);

const validateEnvironment = () => {
  const missing = getMissingKeys(requiredInAllEnvironments);
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    missing.push(...getMissingKeys(requiredInProduction));
  }
  const missingPaidStripePrices = isProduction ? getMissingKeys(requiredPaidStripePriceKeys) : [];

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && isProduction) {
    missing.push("JWT_SECRET_MIN_32_CHARS");
  }

  if (missing.length) {
    throw new Error(`Truksta privalomu aplinkos kintamuju: ${missing.join(", ")}`);
  }

  if (missingPaidStripePrices.length) {
    throw new Error(
      `Truksta mokamu planu Stripe Price ID kintamuju: ${missingPaidStripePrices.join(", ")}`
    );
  }

  if (isProduction) {
    if (!process.env.EMAIL_FROM?.trim()) {
      throw new Error("Truksta privalomu aplinkos kintamuju: EMAIL_FROM");
    }

    if (!isBrevoEmailConfigured() && !isFullEmailTransportConfigured()) {
      throw new Error(
        "Truksta el. pasto siuntimo konfiguracijos: reikia BREVO_API_KEY arba pilno SMTP kelio SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER ir SMTP_PASS"
      );
    }
  }

  if (!isProduction) {
    const optionalWarnings = getMissingKeys(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);

    if (optionalWarnings.length) {
      console.warn(`Stripe funkcijos neveiks be: ${optionalWarnings.join(", ")}`);
    }
  }
};

module.exports = {
  requiredPaidStripePriceKeys,
  validateEnvironment,
};
