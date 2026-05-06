const assert = require("node:assert/strict");
const test = require("node:test");

const {
  inferPlanIdFromStripeSubscription,
  normalizeStripeSubscriptionStatus,
} = require("../services/stripeMembershipService");

test("infers plan from subscription metadata first", () => {
  assert.equal(
    inferPlanIdFromStripeSubscription({
      metadata: { planId: "private" },
      items: { data: [] },
    }),
    "private"
  );
});

test("infers plan from configured Stripe price ID", () => {
  const originalValue = process.env.STRIPE_PRICE_CIRCLE;
  process.env.STRIPE_PRICE_CIRCLE = "price_circle_real";

  assert.equal(
    inferPlanIdFromStripeSubscription({
      metadata: {},
      items: { data: [{ price: { id: "price_circle_real", currency: "eur", recurring: { interval: "month" } } }] },
    }),
    "circle"
  );

  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_CIRCLE;
  } else {
    process.env.STRIPE_PRICE_CIRCLE = originalValue;
  }
});

test("normalizes confirmed incomplete checkout to active", () => {
  assert.equal(
    normalizeStripeSubscriptionStatus(
      {
        status: "incomplete",
        latest_invoice: { status: "paid" },
      },
      { sessionPaymentStatus: "paid" }
    ),
    "active"
  );
});
