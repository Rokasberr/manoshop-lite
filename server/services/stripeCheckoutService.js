const crypto = require("crypto");

const normalizeIdempotencyKey = (value = "") =>
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._:-]/g, "")
    .slice(0, 255);

const buildIdempotencyKey = (prefix, parts, providedKey = "") => {
  const provided = normalizeIdempotencyKey(providedKey);

  if (provided) {
    return provided;
  }

  const digest = crypto
    .createHash("sha256")
    .update(parts.map((part) => String(part || "")).join(":"))
    .digest("hex")
    .slice(0, 24);

  return `${prefix}:${digest}`;
};

const getPlanPriceId = (plan) => {
  if (!plan?.stripePriceEnv) {
    return "";
  }

  return process.env[plan.stripePriceEnv] || "";
};

const buildSubscriptionLineItem = (plan) => {
  const priceId = getPlanPriceId(plan);

  if (priceId) {
    return {
      price: priceId,
      quantity: 1,
    };
  }

  return {
    quantity: 1,
    price_data: {
      currency: plan.currency,
      recurring: {
        interval: plan.interval,
      },
      product_data: {
        name: `${plan.name} plan`,
        description: plan.description,
      },
      unit_amount: Math.round(plan.price * 100),
      tax_behavior: process.env.STRIPE_DYNAMIC_TAX_BEHAVIOR || "exclusive",
    },
  };
};

const buildOrderLineItems = (order) =>
  order.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
    },
  }));

module.exports = {
  buildIdempotencyKey,
  buildOrderLineItems,
  buildSubscriptionLineItem,
  getPlanPriceId,
};
