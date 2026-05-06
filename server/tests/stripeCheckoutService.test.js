const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildIdempotencyKey,
  buildOrderLineItems,
  buildSubscriptionLineItem,
} = require("../services/stripeCheckoutService");

test("subscription checkout uses configured Stripe price IDs", () => {
  const originalValue = process.env.STRIPE_PRICE_CIRCLE;
  process.env.STRIPE_PRICE_CIRCLE = "price_test_circle";

  const lineItem = buildSubscriptionLineItem({
    id: "circle",
    name: "Asmeninis",
    price: 15.99,
    currency: "eur",
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_CIRCLE",
  });

  assert.deepEqual(lineItem, { price: "price_test_circle", quantity: 1 });
  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_CIRCLE;
  } else {
    process.env.STRIPE_PRICE_CIRCLE = originalValue;
  }
});

test("subscription checkout can build development dynamic prices", () => {
  const originalValue = process.env.STRIPE_PRICE_PRIVATE;
  delete process.env.STRIPE_PRICE_PRIVATE;

  const lineItem = buildSubscriptionLineItem({
    id: "private",
    name: "Privatus verslas",
    price: 44.99,
    currency: "eur",
    interval: "month",
    description: "Plan",
    stripePriceEnv: "STRIPE_PRICE_PRIVATE",
  });

  assert.equal(lineItem.price_data.unit_amount, 4499);
  assert.equal(lineItem.price_data.recurring.interval, "month");
  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_PRIVATE;
  } else {
    process.env.STRIPE_PRICE_PRIVATE = originalValue;
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
