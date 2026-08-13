const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildIdempotencyKey,
  buildOrderLineItems,
  buildSubscriptionLineItem,
} = require("../services/stripeCheckoutService");
const { getPlanById, normalizePlanId } = require("../config/subscriptionPlans");
const { validateBillingSessionPayload } = require("../middleware/requestValidation");

const runMiddleware = (middleware, body) =>
  new Promise((resolve) => {
    const req = { body: { ...body } };
    middleware(req, {}, (error) => resolve({ error, req }));
  });

test("Demo plan is internal and does not require a Stripe price ID", () => {
  const originalValue = process.env.STRIPE_PRICE_BAZINIS;
  delete process.env.STRIPE_PRICE_BAZINIS;

  const plan = getPlanById("basic");

  assert.equal(plan.provider, "internal");
  assert.equal(plan.price, 0);
  assert.equal(plan.priceId, "");
  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_BAZINIS;
  } else {
    process.env.STRIPE_PRICE_BAZINIS = originalValue;
  }
});

test("Demo plan cannot create a Stripe subscription checkout", async () => {
  const result = await runMiddleware(validateBillingSessionPayload, {
    planId: "basic",
    provider: "stripe",
  });

  assert.equal(result.error.statusCode, 400);
});

test("subscription checkout uses selected plan Stripe price ID", () => {
  const originalValue = process.env.STRIPE_PRICE_PRIVATUS_VERSLAS;
  process.env.STRIPE_PRICE_PRIVATUS_VERSLAS = "price_test_privatus_verslas";

  const lineItem = buildSubscriptionLineItem({
    id: "privatus_verslas",
    name: "Privatus verslas",
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

test("legacy plan aliases normalize to current plan IDs", () => {
  assert.equal(normalizePlanId("bazinis"), "basic");
  assert.equal(normalizePlanId("asmeninis"), "personal");
  assert.equal(normalizePlanId("privatus_verslas"), "private_business");
});

test("paid plan prices remain unchanged", () => {
  assert.equal(getPlanById("personal").price, 14.99);
  assert.equal(getPlanById("private_business").price, 44.99);
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
