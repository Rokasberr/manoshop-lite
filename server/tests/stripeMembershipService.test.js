const assert = require("node:assert/strict");
const test = require("node:test");

const {
  inferPlanIdFromStripeSubscription,
  normalizeStripeSubscriptionStatus,
} = require("../services/stripeMembershipService");

test("infers plan from subscription metadata first", () => {
  assert.equal(
    inferPlanIdFromStripeSubscription({
      metadata: { plan: "privatus_verslas" },
      items: { data: [] },
    }),
    "private_business"
  );
});

test("infers plan from configured Stripe price ID", () => {
  const originalValue = process.env.STRIPE_PRICE_ASMENINIS;
  process.env.STRIPE_PRICE_ASMENINIS = "price_asmeninis_real";

  assert.equal(
    inferPlanIdFromStripeSubscription({
      metadata: {},
      items: { data: [{ price: { id: "price_asmeninis_real", currency: "eur", recurring: { interval: "month" } } }] },
    }),
    "personal"
  );

  if (originalValue === undefined) {
    delete process.env.STRIPE_PRICE_ASMENINIS;
  } else {
    process.env.STRIPE_PRICE_ASMENINIS = originalValue;
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
