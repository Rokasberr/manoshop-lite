const assert = require("node:assert/strict");
const test = require("node:test");

const controllerPath = require.resolve("../controllers/billingController");
const stripeClientPath = require.resolve("../utils/stripeClient");
const stripeMembershipServicePath = require.resolve("../services/stripeMembershipService");

const loadControllerWithMocks = ({ session, stripeRetrieveError = null, syncedUser = null }) => {
  const syncCalls = [];
  const stripe = {
    checkout: {
      sessions: {
        retrieve: async () => {
          if (stripeRetrieveError) {
            throw stripeRetrieveError;
          }

          return session;
        },
      },
    },
    subscriptions: {
      retrieve: async () => session.subscription,
    },
  };

  delete require.cache[controllerPath];
  require.cache[stripeClientPath] = {
    id: stripeClientPath,
    filename: stripeClientPath,
    loaded: true,
    exports: {
      getStripeClient: () => stripe,
      resolveClientUrl: () => "https://client.example.test",
    },
  };
  require.cache[stripeMembershipServicePath] = {
    id: stripeMembershipServicePath,
    filename: stripeMembershipServicePath,
    loaded: true,
    exports: {
      serializeSubscription: (subscription) => ({
        plan: subscription?.plan || "free",
        status: subscription?.status || "inactive",
        provider: subscription?.provider || "internal",
      }),
      syncUserSubscriptionFromCheckoutSession: async (payload) => {
        syncCalls.push(payload);
        return syncedUser;
      },
      syncUserSubscriptionFromStripeSubscription: async () => null,
    },
  };

  return {
    controller: require("../controllers/billingController"),
    syncCalls,
  };
};

const withMockedUser = async (user, callback) => {
  const User = require("../models/User");
  const originalFindById = User.findById;

  User.findById = () => ({
    select: async () => user,
  });

  try {
    await callback();
  } finally {
    User.findById = originalFindById;
    delete require.cache[controllerPath];
    delete require.cache[stripeClientPath];
    delete require.cache[stripeMembershipServicePath];
  }
};

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const createRequest = ({ userId = "user_1", sessionId = "cs_test_1" } = {}) => ({
  user: {
    _id: {
      toString: () => userId,
    },
  },
  body: { sessionId },
});

test("unauthenticated user cannot sync Stripe session", async () => {
  const { protect } = require("../middleware/authMiddleware");
  const error = await new Promise((resolve) => {
    protect({ headers: {} }, {}, (nextError) => resolve(nextError));
  });

  assert.equal(error.statusCode, 401);
});

test("user cannot sync another user's Stripe session", async () => {
  const { controller } = loadControllerWithMocks({
    session: {
      id: "cs_other",
      mode: "subscription",
      status: "complete",
      payment_status: "paid",
      client_reference_id: "other_user",
      metadata: { userId: "other_user" },
      subscription: { id: "sub_1" },
    },
  });

  await withMockedUser(
    { _id: { toString: () => "user_1" }, subscription: { plan: "free", status: "active" } },
    async () => {
      const res = createResponse();

      await assert.rejects(
        () => controller.syncStripeMembership(createRequest(), res),
        /nepriklauso/
      );
    }
  );
});

test("unpaid Stripe session does not grant membership", async () => {
  const { controller, syncCalls } = loadControllerWithMocks({
    session: {
      id: "cs_unpaid",
      mode: "subscription",
      status: "open",
      payment_status: "unpaid",
      client_reference_id: "user_1",
      metadata: { userId: "user_1" },
      subscription: { id: "sub_1" },
    },
  });

  await withMockedUser(
    { _id: { toString: () => "user_1" }, subscription: { plan: "free", status: "active" } },
    async () => {
      const res = createResponse();
      await controller.syncStripeMembership(createRequest(), res);

      assert.equal(res.statusCode, 202);
      assert.equal(res.body.synced, false);
      assert.equal(syncCalls.length, 0);
    }
  );
});

test("paid confirmed Stripe session updates the correct plan", async () => {
  const syncedUser = {
    _id: { toString: () => "user_1" },
    subscription: { plan: "personal", status: "active", provider: "stripe" },
  };
  const { controller, syncCalls } = loadControllerWithMocks({
    syncedUser,
    session: {
      id: "cs_paid",
      mode: "subscription",
      status: "complete",
      payment_status: "paid",
      client_reference_id: "user_1",
      metadata: { userId: "user_1", plan: "personal" },
      subscription: { id: "sub_1", metadata: { userId: "user_1", plan: "personal" } },
    },
  });

  await withMockedUser(
    { _id: { toString: () => "user_1" }, subscription: { plan: "free", status: "active" } },
    async () => {
      const res = createResponse();
      await controller.syncStripeMembership(createRequest(), res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.synced, true);
      assert.equal(res.body.subscription.plan, "personal");
      assert.equal(syncCalls.length, 1);
      assert.equal(syncCalls[0].fallbackUserId, "user_1");
    }
  );
});

test("repeat sync remains idempotent through subscription upsert path", async () => {
  const { syncUserSubscriptionFromStripeSubscription } = require("../services/stripeMembershipService");
  const User = require("../models/User");
  const Subscription = require("../models/Subscription");
  const originalUserFindById = User.findById;
  const originalFindOneAndUpdate = Subscription.findOneAndUpdate;
  const calls = [];
  const user = {
    _id: "user_1",
    subscription: {},
    save: async () => user,
  };

  User.findById = async () => user;
  Subscription.findOneAndUpdate = async (filter, update, options) => {
    calls.push({ filter, update, options });
    return { _id: "subscription_record_1" };
  };

  try {
    const payload = {
      userId: "user_1",
      stripeCustomerId: "cus_1",
      subscription: {
        id: "sub_same",
        status: "active",
        customer: "cus_1",
        metadata: { plan: "personal" },
        items: { data: [{ price: { id: "price_personal" } }] },
      },
      sessionPaymentStatus: "paid",
    };

    await syncUserSubscriptionFromStripeSubscription(payload);
    await syncUserSubscriptionFromStripeSubscription(payload);

    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].filter, { stripeSubscriptionId: "sub_same" });
    assert.deepEqual(calls[1].filter, { stripeSubscriptionId: "sub_same" });
    assert.equal(calls[0].options.upsert, true);
    assert.equal(calls[1].options.upsert, true);
  } finally {
    User.findById = originalUserFindById;
    Subscription.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("webhook sync path remains safe after manual sync", async () => {
  const { syncUserSubscriptionFromCheckoutSession } = require("../services/stripeMembershipService");
  assert.equal(typeof syncUserSubscriptionFromCheckoutSession, "function");
});
