const getWebServiceStripeClient = () => {
  let Stripe;

  try {
    Stripe = require("stripe");
  } catch (_error) {
    const error = new Error("Stripe paketas neįdiegtas šiame projekte. Paleisk npm install root kataloge.");
    error.statusCode = 503;
    throw error;
  }

  const secretKey = String(process.env.STRIPE_WEB_SERVICE_SECRET_KEY || "").trim();
  if (!secretKey) {
    throw new Error(
      "STRIPE_WEB_SERVICE_SECRET_KEY nerastas. Stilloak Web Stripe raktą sukonfigūruok Render Environment."
    );
  }

  return new Stripe(secretKey);
};

module.exports = {
  getWebServiceStripeClient,
};
