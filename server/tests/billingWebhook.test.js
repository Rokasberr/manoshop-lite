const assert = require("node:assert/strict");
const test = require("node:test");

const controllerPath = require.resolve("../controllers/billingController");
const stripeClientPath = require.resolve("../utils/stripeClient");
const webhookEventServicePath = require.resolve("../services/webhookEventService");
const stripeMembershipServicePath = require.resolve("../services/stripeMembershipService");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  text: "",
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  send(payload) {
    this.text = payload;
    return this;
  },
});

const loadController = ({ event, shouldProcess = true, syncError = null, stripeOverrides = {} }) => {
  const webhookCalls = [];
  const syncCalls = [];
  const stripe = {
    webhooks: {
      constructEvent: () => {
        if (event instanceof Error) {
          throw event;
        }

        return event;
      },
    },
    subscriptions: {
      retrieve: async (id) => ({
        id,
        customer: "cus_user",
        status: "active",
        metadata: { userId: "user_1", plan: "personal" },
        items: { data: [{ price: { id: "price_personal" } }] },
      }),
    },
    ...stripeOverrides,
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
  require.cache[webhookEventServicePath] = {
    id: webhookEventServicePath,
    filename: webhookEventServicePath,
    loaded: true,
    exports: {
      beginStripeWebhookEvent: async (stripeEvent) => {
        webhookCalls.push(["begin", stripeEvent.id]);
        return { shouldProcess, record: { id: "wh_1" } };
      },
      markStripeWebhookEventFailed: async (_record, error) => {
        webhookCalls.push(["failed", error.message]);
      },
      markStripeWebhookEventProcessed: async () => {
        webhookCalls.push(["processed"]);
      },
    },
  };
  require.cache[stripeMembershipServicePath] = {
    id: stripeMembershipServicePath,
    filename: stripeMembershipServicePath,
    loaded: true,
    exports: {
      serializeSubscription: (subscription) => subscription || {},
      findLatestStripeSubscriptionForUser: async () => null,
      syncUserSubscriptionFromCheckoutSession: async (payload) => {
        syncCalls.push(["checkout", payload]);
        if (syncError) {
          throw syncError;
        }
        return { _id: "user_1" };
      },
      syncUserSubscriptionFromStripeSubscription: async (payload) => {
        syncCalls.push(["subscription", payload]);
        if (syncError) {
          throw syncError;
        }
        return { _id: "user_1" };
      },
    },
  };

  return {
    controller: require("../controllers/billingController"),
    syncCalls,
    webhookCalls,
  };
};

const withModelMocks = async (callback) => {
  const User = require("../models/User");
  const Subscription = require("../models/Subscription");
  const Payment = require("../models/Payment");
  const originals = {
    userFindById: User.findById,
    userFindOne: User.findOne,
    subscriptionFindOne: Subscription.findOne,
    paymentFindOneAndUpdate: Payment.findOneAndUpdate,
  };
  const paymentCalls = [];

  User.findById = async (id) => ({
    _id: { toString: () => id },
    subscription: { stripeCustomerId: "cus_user" },
  });
  User.findOne = async (filter) =>
    filter?.["subscription.stripeCustomerId"] === "cus_user"
      ? { _id: { toString: () => "user_1" }, subscription: { stripeCustomerId: "cus_user" } }
      : null;
  Subscription.findOne = async () => ({ _id: "subscription_record_1", user: { toString: () => "user_1" } });
  Payment.findOneAndUpdate = async (filter, update, options) => {
    paymentCalls.push({ filter, update, options });
    return { _id: "payment_1" };
  };

  try {
    await callback({ paymentCalls });
  } finally {
    User.findById = originals.userFindById;
    User.findOne = originals.userFindOne;
    Subscription.findOne = originals.subscriptionFindOne;
    Payment.findOneAndUpdate = originals.paymentFindOneAndUpdate;
    delete require.cache[controllerPath];
    delete require.cache[stripeClientPath];
    delete require.cache[webhookEventServicePath];
    delete require.cache[stripeMembershipServicePath];
  }
};

const runWebhook = async (controller) => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  const res = createResponse();
  await controller.handleStripeWebhook({ body: Buffer.from("{}"), headers: { "stripe-signature": "sig" } }, res);
  return res;
};

test("webhook rejects Stripe signature errors", async () => {
  const { controller } = loadController({ event: new Error("bad signature") });
  const res = await runWebhook(controller);

  assert.equal(res.statusCode, 400);
  assert.match(res.text, /Webhook Error/);
});

test("webhook duplicate event ID is acknowledged without reprocessing", async () => {
  const { controller, syncCalls } = loadController({
    shouldProcess: false,
    event: { id: "evt_duplicate", type: "customer.subscription.updated", data: { object: {} } },
  });
  const res = await runWebhook(controller);

  assert.deepEqual(res.body, { received: true, duplicate: true });
  assert.equal(syncCalls.length, 0);
});

test("checkout.session.completed syncs membership subscriptions through trusted metadata", async () => {
  await withModelMocks(async () => {
    const { controller, syncCalls } = loadController({
      event: {
        id: "evt_checkout",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_1",
            mode: "subscription",
            payment_status: "paid",
            customer: "cus_user",
            client_reference_id: "user_1",
            metadata: { userId: "user_1", plan: "personal" },
            subscription: "sub_1",
          },
        },
      },
    });
    const res = await runWebhook(controller);

    assert.deepEqual(res.body, { received: true });
    assert.equal(syncCalls.length, 1);
    assert.equal(syncCalls[0][0], "checkout");
    assert.equal(syncCalls[0][1].fallbackUserId, "user_1");
  });
});

test("subscription created, updated and deleted webhook events sync the matching user", async () => {
  for (const type of ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"]) {
    await withModelMocks(async () => {
      const { controller, syncCalls } = loadController({
        event: {
          id: `evt_${type}`,
          type,
          data: {
            object: {
              id: "sub_1",
              customer: "cus_user",
              status: type.endsWith("deleted") ? "canceled" : "active",
              metadata: { userId: "user_1", plan: "personal" },
            },
          },
        },
      });
      const res = await runWebhook(controller);

      assert.deepEqual(res.body, { received: true });
      assert.equal(syncCalls.length, 1);
      assert.equal(syncCalls[0][0], "subscription");
    });
  }
});

test("invoice paid, failed and action required write safe subscription payment states", async () => {
  const cases = [
    ["invoice.paid", "succeeded"],
    ["invoice.payment_succeeded", "succeeded"],
    ["invoice.payment_failed", "failed"],
    ["invoice.payment_action_required", "pending"],
  ];

  for (const [type, expectedStatus] of cases) {
    await withModelMocks(async ({ paymentCalls }) => {
      const { controller } = loadController({
        event: {
          id: `evt_${type}`,
          type,
          data: {
            object: {
              id: "in_1",
              customer: "cus_user",
              subscription: "sub_1",
              amount_paid: 1499,
              currency: "eur",
              status: expectedStatus,
              payment_intent: "pi_1",
            },
          },
        },
      });
      const res = await runWebhook(controller);

      assert.deepEqual(res.body, { received: true });
      assert.equal(paymentCalls.length, 1);
      assert.equal(paymentCalls[0].update.$set.status, expectedStatus);
      assert.equal(paymentCalls[0].update.$set.user, "user_1");
      assert.equal(paymentCalls[0].update.$set.stripeCustomerId, "cus_user");
    });
  }
});

test("webhook processing errors are marked failed and return a generic retry-safe response", async () => {
  await withModelMocks(async () => {
    const { controller, webhookCalls } = loadController({
      syncError: new Error("secret internal stripe detail"),
      event: {
        id: "evt_fail",
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_1",
            customer: "cus_user",
            status: "active",
            metadata: { userId: "user_1", plan: "personal" },
          },
        },
      },
    });
    const res = await runWebhook(controller);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message.includes("secret internal"), false);
    assert.ok(webhookCalls.some((call) => call[0] === "failed"));
  });
});
