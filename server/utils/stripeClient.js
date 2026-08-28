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

const getWebServiceStripeClient = () =>
  createStripeClient(
    process.env.STRIPE_WEB_SERVICE_SECRET_KEY,
    "STRIPE_WEB_SERVICE_SECRET_KEY"
  );

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
