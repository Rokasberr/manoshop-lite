const {
  getConfiguredOrigins,
  getPrimaryClientUrl,
  isAllowedOrigin,
} = require("./originMatcher");

const createStripeClient = (secretKey, envName) => {
  let Stripe;

  try {
    Stripe = require("stripe");
  } catch (_error) {
    const error = new Error("Stripe paketas neįdiegtas šiame projekte. Paleisk npm install root kataloge.");
    error.statusCode = 503;
    throw error;
  }

  if (!secretKey) {
    throw new Error(`${envName} nerastas. Patikrink serverio aplinkos kintamuosius.`);
  }

  return new Stripe(secretKey);
};

const getStripeClient = () => createStripeClient(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");

const getWebServiceStripeClient = () => {
  const secretKey = String(process.env.STRIPE_WEB_SERVICE_SECRET_KEY || "").trim();
  const liveEnabled = String(process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED || "").trim().toLowerCase() === "true";

  if (secretKey.startsWith("sk_live_") && !liveEnabled) {
    throw new Error(
      "Stilloak Web live Stripe mokėjimai užrakinti. Naudok sk_test_ raktą arba sąmoningai nustatyk WEB_SERVICE_STRIPE_LIVE_ENABLED=true."
    );
  }

  return createStripeClient(secretKey, "STRIPE_WEB_SERVICE_SECRET_KEY");
};

const resolveClientUrl = (preferredOrigin = "") => {
  const configuredOrigins = getConfiguredOrigins();

  if (preferredOrigin && isAllowedOrigin(preferredOrigin, configuredOrigins)) {
    return preferredOrigin;
  }

  return getPrimaryClientUrl(configuredOrigins);
};

module.exports = {
  getStripeClient,
  getWebServiceStripeClient,
  resolveClientUrl,
};
