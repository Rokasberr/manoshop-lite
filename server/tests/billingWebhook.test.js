const assert = require("node:assert/strict");
const test = require("node:test");

const controllerPath = require.resolve("../controllers/billingController");
const stripeClientPath = require.resolve("../utils/stripeClient");
const webhookEventServicePath = require.resolve("../services/webhookEventService");
const stripeMembershipServicePath = require.resolve("../services/stripeMembershipService");
const transactionalEmailServicePath = require.resolve("../services/transactionalEmailService");
const digitalProductPurchaseServicePath = require.resolve("../services/digitalProductPurchaseService");

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

const loadController = ({
  event,
  shouldProcess = true,
  syncError = null,
  emailError = null,
  digitalPurchase = null,
  stripeOverrides = {},
}) => {
  const webhookCalls = [];
  const syncCalls = [];
  const emailCalls = [];
  const digitalPurchaseCalls = [];
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
  require.cache[transactionalEmailServicePath] = {
    id: transactionalEmailServicePath,
    filename: transactionalEmailServicePath,
    loaded: true,
    exports: {
      sendDigitalProductPurchaseEmail: async (payload) => {
        emailCalls.push(["digital-product", payload]);
        if (emailError) {
          throw emailError;
        }
        return { sent: true };
      },
      sendSubscriptionCancellationEmail: async (payload) => {
        emailCalls.push(["subscription-cancellation", payload]);
        if (emailError) {
          throw emailError;
        }
        return { sent: true };
      },
      sendSubscriptionPaymentIssueEmail: async (payload) => {
        if (!["failed", "pending"].includes(payload.payment?.status)) {
          return { sent: false, skipped: true };
        }
        emailCalls.push(["subscription-payment-issue", payload]);
        if (emailError) {
          throw emailError;
        }
        return { sent: true };
      },
      sendSubscriptionPaymentSucceededEmail: async (payload) => {
        emailCalls.push(["subscription-payment-succeeded", payload]);
        if (emailError) {
          throw emailError;
        }
        return { sent: true };
      },
    },
  };
  require.cache[digitalProductPurchaseServicePath] = {
    id: digitalProductPurchaseServicePath,
    filename: digitalProductPurchaseServicePath,
    loaded: true,
    exports: {
      syncDigitalProductPurchaseFromSession: async (session) => {
        digitalPurchaseCalls.push(session);
        return digitalPurchase;
      },
    },
  };

  return {
    controller: require("../controllers/billingController"),
    digitalPurchaseCalls,
    emailCalls,
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
    paymentFindOne: Payment.findOne,
    paymentFindOneAndUpdate: Payment.findOneAndUpdate,
  };
  const paymentCalls = [];
  const payments = new Map();

  User.findById = async (id) => ({
    _id: { toString: () => id },
    subscription: { stripeCustomerId: "cus_user" },
  });
  User.findOne = async (filter) =>
    filter?.["subscription.stripeCustomerId"] === "cus_user"
      ? { _id: { toString: () => "user_1" }, subscription: { stripeCustomerId: "cus_user" } }
      : null;
  Subscription.findOne = async () => ({ _id: "subscription_record_1", user: { toString: () => "user_1" } });
  Payment.findOne = async (filter) => payments.get(`${filter.stripeInvoiceId}:${filter.type}`) || null;
  Payment.findOneAndUpdate = async (filter, update, options) => {
    paymentCalls.push({ filter, update, options });
    const key = `${filter.stripeInvoiceId}:${filter.type}`;
    const existing = payments.get(key) || { _id: `payment_${payments.size + 1}` };
    const next = {
      ...existing,
      ...update.$set,
    };
    payments.set(key, next);
    return next;
  };

  try {
    await callback({ paymentCalls, payments });
  } finally {
    User.findById = originals.userFindById;
    User.findOne = originals.userFindOne;
    Subscription.findOne = originals.subscriptionFindOne;
    Payment.findOne = originals.paymentFindOne;
    Payment.findOneAndUpdate = originals.paymentFindOneAndUpdate;
    delete require.cache[controllerPath];
    delete require.cache[stripeClientPath];
    delete require.cache[webhookEventServicePath];
    delete require.cache[stripeMembershipServicePath];
    delete require.cache[transactionalEmailServicePath];
    delete require.cache[digitalProductPurchaseServicePath];
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
      const { controller, emailCalls } = loadController({
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
      assert.equal(emailCalls.length, 1);
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

test("subscription email transport failure keeps payment sync and leaves webhook retryable", async () => {
  await withModelMocks(async ({ paymentCalls }) => {
    const { controller, emailCalls, webhookCalls } = loadController({
      emailError: new Error("SMTP unavailable"),
      event: {
        id: "evt_email_fail",
        type: "invoice.paid",
        data: {
          object: {
            id: "in_1",
            customer: "cus_user",
            subscription: "sub_1",
            amount_paid: 1499,
            currency: "eur",
            status: "paid",
            payment_intent: "pi_1",
          },
        },
      },
    });
    const res = await runWebhook(controller);

    assert.equal(res.statusCode, 500);
    assert.equal(paymentCalls.length, 1);
    assert.equal(paymentCalls[0].update.$set.status, "succeeded");
    assert.equal(emailCalls.length, 1);
    assert.ok(webhookCalls.some((call) => call[0] === "failed"));
  });
});

test("late payment_failed for an already succeeded invoice does not downgrade payment or send issue email", async () => {
  await withModelMocks(async ({ paymentCalls, payments }) => {
    const paid = loadController({
      event: {
        id: "evt_paid_first",
        type: "invoice.paid",
        data: {
          object: {
            id: "in_same",
            customer: "cus_user",
            subscription: "sub_1",
            amount_paid: 1499,
            currency: "eur",
            status: "paid",
            payment_intent: "pi_1",
          },
        },
      },
    });
    const paidRes = await runWebhook(paid.controller);
    const failed = loadController({
      event: {
        id: "evt_failed_late",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "in_same",
            customer: "cus_user",
            subscription: "sub_1",
            amount_due: 1499,
            currency: "eur",
            status: "open",
            payment_intent: "pi_1",
          },
        },
      },
    });
    const failedRes = await runWebhook(failed.controller);

    assert.deepEqual(paidRes.body, { received: true });
    assert.deepEqual(failedRes.body, { received: true });
    assert.equal(paymentCalls.length, 1);
    assert.equal(payments.get("in_same:subscription_invoice").status, "succeeded");
    assert.equal(paid.emailCalls.length, 1);
    assert.equal(paid.emailCalls[0][0], "subscription-payment-succeeded");
    assert.equal(failed.emailCalls.length, 0);
  });
});

test("failed invoice can later be upgraded to succeeded and sends final success email", async () => {
  await withModelMocks(async ({ paymentCalls, payments }) => {
    const failed = loadController({
      event: {
        id: "evt_failed_first",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "in_later_paid",
            customer: "cus_user",
            subscription: "sub_1",
            amount_due: 1499,
            currency: "eur",
            status: "open",
            payment_intent: "pi_1",
          },
        },
      },
    });
    const failedRes = await runWebhook(failed.controller);
    const paid = loadController({
      event: {
        id: "evt_paid_later",
        type: "invoice.paid",
        data: {
          object: {
            id: "in_later_paid",
            customer: "cus_user",
            subscription: "sub_1",
            amount_paid: 1499,
            currency: "eur",
            status: "paid",
            payment_intent: "pi_1",
          },
        },
      },
    });
    const paidRes = await runWebhook(paid.controller);

    assert.deepEqual(failedRes.body, { received: true });
    assert.deepEqual(paidRes.body, { received: true });
    assert.equal(paymentCalls.length, 2);
    assert.equal(payments.get("in_later_paid:subscription_invoice").status, "succeeded");
    assert.equal(failed.emailCalls.length, 1);
    assert.equal(failed.emailCalls[0][0], "subscription-payment-issue");
    assert.equal(paid.emailCalls.length, 1);
    assert.equal(paid.emailCalls[0][0], "subscription-payment-succeeded");
  });
});

test("digital product email transport failure keeps paid purchase sync and leaves webhook retryable", async () => {
  await withModelMocks(async () => {
    const { controller, digitalPurchaseCalls, emailCalls, webhookCalls } = loadController({
      emailError: new Error("Brevo unavailable"),
      digitalPurchase: {
        _id: "purchase_1",
        user: "user_1",
        productId: "12-month-savings-tracker",
        status: "paid",
      },
      event: {
        id: "evt_digital_email_fail",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_1",
            mode: "payment",
            payment_status: "paid",
            metadata: { type: "digital_product", userId: "user_1", productId: "12-month-savings-tracker" },
          },
        },
      },
    });
    const res = await runWebhook(controller);

    assert.equal(res.statusCode, 500);
    assert.equal(digitalPurchaseCalls.length, 1);
    assert.equal(emailCalls.length, 1);
    assert.ok(webhookCalls.some((call) => call[0] === "failed"));
  });
});
