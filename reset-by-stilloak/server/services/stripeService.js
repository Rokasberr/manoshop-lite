import crypto from "node:crypto";
import Stripe from "stripe";
import { getConfig } from "../config.js";
import { httpError } from "../utils/http.js";

let stripeClient;

export const getStripe = () => {
  const config = getConfig();
  if (!config.stripeSecretKey) throw httpError("Stripe Checkout is not configured yet.", 503);
  if (config.stripeSecretKey.startsWith("sk_live_") && !config.stripeLiveEnabled) {
    throw httpError("Live Stripe payments are locked for this environment.", 503);
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey, {
      apiVersion: "2026-08-26.dahlia",
      maxNetworkRetries: 2
    });
  }
  return stripeClient;
};

export const createLifetimeCheckout = async ({ user }) => {
  const config = getConfig();
  const stripe = getStripe();
  const integrationSuffix = crypto.randomBytes(4).toString("hex");
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
  });
};
