const {
  getConfiguredOrigins,
  getPrimaryClientUrl,
  isAllowedOrigin,
} = require("./originMatcher");

const getStripeClient = () => {
  let Stripe;

  try {
    Stripe = require("stripe");
  } catch (_error) {
    const error = new Error("Stripe paketas neįdiegtas šiame projekte. Paleisk npm install root kataloge.");
    error.statusCode = 503;
    throw error;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY nerastas. Patikrink server/.env failą.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
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
  resolveClientUrl,
};
