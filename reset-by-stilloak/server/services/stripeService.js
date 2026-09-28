import crypto from "node:crypto";
import Stripe from "stripe";
import { getConfig } from "../config.js";
import { httpError } from "../utils/http.js";

let stripeClient;
let stripeClientKey = "";

const stripeMode = (value = "") => {
  if (/^[sr]k_live_/.test(value)) return "live";
  if (/^[sr]k_test_/.test(value)) return "test";
  return "unknown";
};

const randomLetters = (length) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return Array.from(crypto.randomBytes(length), (value) => alphabet[value % alphabet.length]).join("");
};

export const getStripe = () => {
  const config = getConfig();
  if (!config.stripeSecretKey) throw httpError("Stripe Checkout is not configured yet.", 503);
  const mode = stripeMode(config.stripeSecretKey);
  if (mode === "unknown") throw httpError("Stripe Checkout credentials are invalid.", 503);
  if (mode === "live" && !config.stripeLiveEnabled) {
    throw httpError("Live Stripe payments are locked for this environment.", 503);
  }
  if (mode === "test" && config.isProductionRelease) {
    throw httpError("Test Stripe payments are blocked in production.", 503);
  }
  if (!stripeClient || stripeClientKey !== config.stripeSecretKey) {
    stripeClient = new Stripe(config.stripeSecretKey, {
      apiVersion: "2026-08-26.dahlia",
      maxNetworkRetries: 2
    });
    stripeClientKey = config.stripeSecretKey;
  }
  return stripeClient;
};

export const createLifetimeCheckout = async ({ user }) => {
  const config = getConfig();
  const stripe = getStripe();
  const integrationSuffix = randomLetters(8);
  const lineItem = config.stripeLifetimePriceId
    ? { price: config.stripeLifetimePriceId, quantity: 1 }
    : {
        price_data: {
          currency: "eur",
          unit_amount: 1900,
          product_data: {
            name: "Founding Lifetime Access",
            description: "One-time access to RESET by Stilloak core features and future core updates."
          }
        },
        quantity: 1
      };

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: String(user._id),
    line_items: [lineItem],
    success_url: `${config.appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    integration_identifier: `reset_lifetime_${integrationSuffix}`,
    metadata: {
      product: "reset_founding_lifetime",
      userId: String(user._id),
      amountEur: "19"
    }
  }, {
    idempotencyKey: `reset-lifetime-${String(user._id)}-${Math.floor(Date.now() / 300_000)}`
  });
};
