const assert = require("node:assert/strict");
const test = require("node:test");

const {
  findLatestStripeSubscriptionForUser,
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

test("keeps exact inactive Stripe statuses instead of collapsing them to inactive", () => {
  for (const status of ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused", "inactive"]) {
    assert.equal(normalizeStripeSubscriptionStatus({ status }, { sessionPaymentStatus: "paid" }), status);
  }
});

test("active and trialing statuses remain eligible for paid access policy", () => {
  assert.equal(normalizeStripeSubscriptionStatus({ status: "active" }), "active");
  assert.equal(normalizeStripeSubscriptionStatus({ status: "trialing" }), "trialing");
});

test("unknown paid subscription status falls back to active only with confirmed Stripe payment", () => {
  assert.equal(
    normalizeStripeSubscriptionStatus(
      {
        status: "",
        latest_invoice: { status: "paid" },
      },
      { sessionPaymentStatus: "paid" }
    ),
    "active"
  );
});

test("latest Stripe subscription sync refuses foreign email-matched customer or subscription", async () => {
  const User = require("../models/User");
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const updates = [];
  const user = {
    _id: { toString: () => "user_current" },
    email: "same@example.test",
    subscription: {},
    save: async () => {
      updates.push(user.subscription);
      return user;
    },
  };

  User.findOne = async (filter) => {
    if (filter?.["subscription.stripeCustomerId"] === "cus_foreign") {
      return { _id: { toString: () => "user_other" } };
    }

    return null;
  };
  User.findById = async () => user;

  try {
    const foreignCustomerStripe = {
      customers: {
        list: async () => ({
          data: [{ id: "cus_foreign", email: "same@example.test", metadata: { userId: "user_other" } }],
        }),
      },
      subscriptions: {
        list: async () => {
          throw new Error("should not list subscriptions for a foreign customer");
        },
      },
    };

    assert.equal(await findLatestStripeSubscriptionForUser(foreignCustomerStripe, user), null);

    const foreignSubscriptionStripe = {
      customers: {
        list: async () => ({
          data: [{ id: "cus_current", email: "same@example.test", metadata: { userId: "user_current" } }],
        }),
      },
      subscriptions: {
        list: async () => ({
          data: [{ id: "sub_foreign", status: "active", metadata: { userId: "user_other" } }],
        }),
        retrieve: async () => {
          throw new Error("should not retrieve a foreign subscription");
        },
      },
    };

    assert.equal(await findLatestStripeSubscriptionForUser(foreignSubscriptionStripe, user), null);
    assert.deepEqual(updates, []);
  } finally {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
  }
});
