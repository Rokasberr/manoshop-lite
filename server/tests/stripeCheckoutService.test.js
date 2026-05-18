const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildIdempotencyKey,
  buildOrderLineItems,
  buildSubscriptionLineItem,
} = require("../services/stripeCheckoutService");

test("subscription checkout uses configured Stripe price IDs", () => {
  const originalValue = process.env.STRIPE_PRICE_BAZINIS;
  process.env.STRIPE_PRICE_BAZINIS = "price_test_bazinis";

  const lineItem = buildSubscriptionLineItem({
    id: "bazinis",
    name: "Demo versija",
    price: 5.99,
    currency: "eur",
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_BAZINIS",
  });

  assert.deepEqual(lineItem, { price: "price_test_bazinis", quantity: 1 });
  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_BAZINIS;
  } else {
    process.env.STRIPE_PRICE_BAZINIS = originalValue;
  }
});

test("subscription checkout uses selected plan Stripe price ID", () => {
  const originalValue = process.env.STRIPE_PRICE_PRIVATUS_VERSLAS;
  process.env.STRIPE_PRICE_PRIVATUS_VERSLAS = "price_test_privatus_verslas";

  const lineItem = buildSubscriptionLineItem({
    id: "privatus_verslas",
    name: "Verslas",
    price: 44.99,
    currency: "eur",
    interval: "month",
    description: "Plan",
    stripePriceEnv: "STRIPE_PRICE_PRIVATUS_VERSLAS",
  });

  assert.deepEqual(lineItem, { price: "price_test_privatus_verslas", quantity: 1 });
  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_PRIVATUS_VERSLAS;
  } else {
    process.env.STRIPE_PRICE_PRIVATUS_VERSLAS = originalValue;
  }
});

test("order checkout line items preserve product totals", () => {
  const items = buildOrderLineItems({
    items: [
      { name: "Guide", price: 16, quantity: 2, image: "" },
      { name: "Poster", price: 24.5, quantity: 1, image: "https://example.test/poster.png" },
    ],
  });

  assert.equal(items[0].price_data.unit_amount, 1600);
  assert.equal(items[1].price_data.unit_amount, 2450);
  assert.equal(items[1].price_data.product_data.images[0], "https://example.test/poster.png");
});

test("idempotency key accepts caller-provided keys", () => {
  assert.equal(buildIdempotencyKey("order", ["a"], "provided-key"), "provided-key");
});
