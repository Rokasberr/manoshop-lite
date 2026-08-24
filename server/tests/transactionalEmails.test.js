const assert = require("node:assert/strict");
const test = require("node:test");

const EmailDelivery = require("../models/EmailDelivery");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const {
  buildDigitalProductDeliveredEmail,
  buildSubscriptionPaymentSucceededEmail,
} = require("../services/transactionalEmailTemplateService");
const {
  sendDigitalProductPurchaseEmail,
  sendSubscriptionCancellationEmail,
  sendSubscriptionPaymentIssueEmail,
  sendSubscriptionPaymentSucceededEmail,
} = require("../services/transactionalEmailService");
const { sanitizeErrorMessage } = require("../services/transactionalEmailDeliveryService");

const withModelStubs = async ({ user, subscription = null, deliveries = new Map() }, callback) => {
  const originals = {
    emailFindOne: EmailDelivery.findOne,
    emailFindOneAndUpdate: EmailDelivery.findOneAndUpdate,
    emailCreate: EmailDelivery.create,
    emailExists: EmailDelivery.exists,
    userFindById: User.findById,
    subscriptionFindById: Subscription.findById,
    subscriptionFindOne: Subscription.findOne,
  };

  const makeRecord = (data) => ({
    attempts: 1,
    provider: "",
    messageId: "",
    sentAt: null,
    error: "",
    updatedAt: new Date("2026-08-24T10:00:00.000Z"),
    ...data,
    async save() {
      this.updatedAt = new Date("2026-08-24T10:01:00.000Z");
      deliveries.set(this.deliveryKey, this);
      return this;
    },
  });

  EmailDelivery.findOne = async (filter) => deliveries.get(filter.deliveryKey) || null;
  EmailDelivery.findOneAndUpdate = async (filter, update, options = {}) => {
    const existing = deliveries.get(filter.deliveryKey);
    const now = new Date("2026-08-24T10:01:00.000Z");
    const matchesRetry =
      existing &&
      filter.status?.$ne === "sent" &&
      existing.status !== "sent" &&
      (existing.status === "failed" ||
        (existing.status === "processing" &&
          existing.updatedAt &&
          existing.updatedAt <= filter.$or?.[1]?.updatedAt?.$lte));

    if (matchesRetry) {
      if (update.$set) {
        Object.assign(existing, update.$set);
      }
      if (update.$inc?.attempts) {
        existing.attempts += update.$inc.attempts;
      }
      existing.updatedAt = now;
      deliveries.set(existing.deliveryKey, existing);
      return existing;
    }

    if (!existing && filter.status?.$exists === false && options.upsert) {
      const record = makeRecord(update.$setOnInsert);
      deliveries.set(record.deliveryKey, record);
      return record;
    }

    if (existing && filter.status?.$exists === false && options.upsert) {
      const error = new Error("duplicate key");
      error.code = 11000;
      throw error;
    }

    return null;
  };
  EmailDelivery.create = async (data) => {
    const record = makeRecord(data);
    deliveries.set(data.deliveryKey, record);
    return record;
  };
  EmailDelivery.exists = async (filter) => {
    const key = `${filter.type}:${filter.dedupeKey}`;
    const delivery = deliveries.get(key);
    return delivery?.status === filter.status ? { _id: "email_delivery_1" } : null;
  };
  User.findById = () => ({
    select: async () => user,
  });
  Subscription.findById = async () => subscription;
  Subscription.findOne = async () => subscription;

  try {
    return await callback({ deliveries });
  } finally {
    EmailDelivery.findOne = originals.emailFindOne;
    EmailDelivery.findOneAndUpdate = originals.emailFindOneAndUpdate;
    EmailDelivery.create = originals.emailCreate;
    EmailDelivery.exists = originals.emailExists;
    User.findById = originals.userFindById;
    Subscription.findById = originals.subscriptionFindById;
    Subscription.findOne = originals.subscriptionFindOne;
  }
};

const makeUser = (overrides = {}) => ({
  _id: "user_1",
  name: "Ona",
  email: "ona@example.test",
  isDeleted: false,
  ...overrides,
});

const makeSubscription = (overrides = {}) => ({
  _id: "subscription_record_1",
  user: "user_1",
  plan: "personal",
  planName: "Asmeninis",
  status: "active",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: new Date("2026-09-24T00:00:00.000Z"),
  canceledAt: null,
  stripeSubscriptionId: "sub_test_hidden",
  ...overrides,
});

const makeInvoice = (overrides = {}) => ({
  id: "in_test_hidden",
  subscription: "sub_test_hidden",
  customer: "cus_test_hidden",
  amount_paid: 1499,
  amount_due: 1499,
  currency: "eur",
  created: 1787575200,
  status_transitions: { paid_at: 1787575200 },
  metadata: {},
  ...overrides,
});

const makePayment = (overrides = {}) => ({
  _id: "payment_1",
  user: "user_1",
  subscription: "subscription_record_1",
  status: "succeeded",
  amount: 14.99,
  currency: "eur",
  ...overrides,
});

test("subscription payment succeeded email is sent once per invoice business key", async () => {
  const sent = [];

  await withModelStubs({ user: makeUser(), subscription: makeSubscription() }, async ({ deliveries }) => {
    const emailSender = async (payload) => {
      sent.push(payload);
      return { sent: true, provider: "test" };
    };
    const payload = {
      invoice: makeInvoice(),
      payment: makePayment(),
      subscriptionRecord: makeSubscription(),
      emailSender,
    };

    const first = await sendSubscriptionPaymentSucceededEmail(payload);
    const second = await sendSubscriptionPaymentSucceededEmail(payload);

    assert.equal(first.sent, true);
    assert.equal(second.skipped, true);
    assert.equal(sent.length, 1);
    assert.equal(deliveries.get("subscription-payment-succeeded:in_test_hidden").status, "sent");
  });
});

test("concurrent transactional email claims call the provider only once", async () => {
  const sent = [];
  let releaseSender = null;
  const senderGate = new Promise((resolve) => {
    releaseSender = resolve;
  });

  await withModelStubs({ user: makeUser(), subscription: makeSubscription() }, async () => {
    const emailSender = async (payload) => {
      sent.push(payload);
      await senderGate;
      return { sent: true, provider: "test" };
    };
    const payload = {
      invoice: makeInvoice(),
      payment: makePayment(),
      subscriptionRecord: makeSubscription(),
      emailSender,
    };

    const first = sendSubscriptionPaymentSucceededEmail(payload).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    );
    const second = sendSubscriptionPaymentSucceededEmail(payload).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    );
    await new Promise((resolve) => setImmediate(resolve));
    releaseSender();
    const results = await Promise.all([first, second]);

    assert.equal(sent.length, 1);
    assert.equal(results.filter((result) => result.status === "fulfilled" && result.value.sent).length, 1);
    assert.equal(results.filter((result) => result.status === "rejected" && result.reason.retryable).length, 1);
  });
});

test("invoice payment failed and action required emails use separate dedupe keys", async () => {
  const sent = [];

  await withModelStubs({ user: makeUser(), subscription: makeSubscription({ status: "past_due" }) }, async () => {
    const emailSender = async (payload) => {
      sent.push(payload.email.subject);
      return { sent: true, provider: "test" };
    };

    await sendSubscriptionPaymentIssueEmail({
      invoice: makeInvoice(),
      payment: makePayment({ status: "failed" }),
      subscriptionRecord: makeSubscription({ status: "past_due" }),
      actionRequired: false,
      emailSender,
    });
    await sendSubscriptionPaymentIssueEmail({
      invoice: makeInvoice(),
      payment: makePayment({ status: "pending" }),
      subscriptionRecord: makeSubscription({ status: "past_due" }),
      actionRequired: true,
      emailSender,
    });

    assert.equal(sent.length, 2);
    assert.match(sent[0], /nepavyko/);
    assert.match(sent[1], /patvirtinti/);
  });
});

test("scheduled and final cancellation emails are deduped independently", async () => {
  const sent = [];
  const emailSender = async (payload) => {
    sent.push(payload.email.subject);
    return { sent: true, provider: "test" };
  };

  await withModelStubs(
    {
      user: makeUser(),
      subscription: makeSubscription({
        status: "active",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date("2026-09-24T00:00:00.000Z"),
      }),
    },
    async () => {
      const scheduledPayload = {
        subscription: { id: "sub_test_hidden", status: "active", metadata: { plan: "personal" } },
        subscriptionRecord: makeSubscription({
          status: "active",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: new Date("2026-09-24T00:00:00.000Z"),
        }),
        eventType: "customer.subscription.updated",
        emailSender,
      };

      await sendSubscriptionCancellationEmail(scheduledPayload);
      await sendSubscriptionCancellationEmail(scheduledPayload);
      await sendSubscriptionCancellationEmail({
        subscription: { id: "sub_test_hidden", status: "canceled", metadata: { plan: "personal" } },
        subscriptionRecord: makeSubscription({ status: "canceled", canceledAt: new Date("2026-09-24T00:00:00.000Z") }),
        eventType: "customer.subscription.deleted",
        emailSender,
      });

      assert.equal(sent.length, 2);
      assert.match(sent[0], /suplanuotas/);
      assert.match(sent[1], /atšaukta/);
    }
  );
});

test("final cancellation has priority over cancelAtPeriodEnd scheduled notice", async () => {
  const sent = [];

  await withModelStubs({ user: makeUser() }, async () => {
    await sendSubscriptionCancellationEmail({
      subscription: { id: "sub_test_hidden", status: "canceled", metadata: { plan: "personal" } },
      subscriptionRecord: makeSubscription({
        status: "canceled",
        cancelAtPeriodEnd: true,
        canceledAt: new Date("2026-09-24T00:00:00.000Z"),
      }),
      eventType: "customer.subscription.updated",
      emailSender: async (payload) => {
        sent.push(payload.email.subject);
        return { sent: true, provider: "test" };
      },
    });

    assert.equal(sent.length, 1);
    assert.match(sent[0], /atšaukta/);
    assert.doesNotMatch(sent[0], /suplanuotas/);
  });
});

test("late canceled subscription update does not send a scheduled cancellation email", async () => {
  const sent = [];

  await withModelStubs({ user: makeUser() }, async () => {
    const emailSender = async (payload) => {
      sent.push(payload.email.subject);
      return { sent: true, provider: "test" };
    };
    const canceledPayload = {
      subscription: { id: "sub_test_hidden", status: "canceled", metadata: { plan: "personal" } },
      subscriptionRecord: makeSubscription({
        status: "canceled",
        cancelAtPeriodEnd: true,
        canceledAt: new Date("2026-09-24T00:00:00.000Z"),
      }),
      eventType: "customer.subscription.deleted",
      emailSender,
    };

    await sendSubscriptionCancellationEmail(canceledPayload);
    await sendSubscriptionCancellationEmail({
      ...canceledPayload,
      eventType: "customer.subscription.updated",
    });

    assert.equal(sent.length, 1);
    assert.match(sent[0], /atšaukta/);
  });
});

test("digital product email is sent only for a paid purchase and deduped by purchase record", async () => {
  const sent = [];

  await withModelStubs({ user: makeUser() }, async () => {
    const emailSender = async (payload) => {
      sent.push(payload.email);
      return { sent: true, provider: "test" };
    };
    const pending = await sendDigitalProductPurchaseEmail({
      purchase: {
        _id: "purchase_pending",
        user: "user_1",
        productId: "12-month-savings-tracker",
        status: "pending",
      },
      emailSender,
    });
    const paidPayload = {
      purchase: {
        _id: "purchase_paid",
        user: "user_1",
        productId: "12-month-savings-tracker",
        status: "paid",
        purchasedAt: new Date("2026-08-24T10:00:00.000Z"),
      },
      emailSender,
    };

    await sendDigitalProductPurchaseEmail(paidPayload);
    await sendDigitalProductPurchaseEmail(paidPayload);

    assert.equal(pending.skipped, true);
    assert.equal(sent.length, 1);
    assert.match(sent[0].text, /StillOak Savings Tracker/);
  });
});

test("failed email transport keeps delivery failed and does not mark it sent", async () => {
  const deliveries = new Map();

  await withModelStubs({ user: makeUser(), subscription: makeSubscription(), deliveries }, async () => {
    await assert.rejects(
      () =>
        sendSubscriptionPaymentSucceededEmail({
          invoice: makeInvoice(),
          payment: makePayment(),
          subscriptionRecord: makeSubscription(),
          emailSender: async () => {
            throw new Error("SMTP failed for pi_secret and C:\\protected\\file.xlsx");
          },
        }),
      /SMTP failed/
    );

    const delivery = deliveries.get("subscription-payment-succeeded:in_test_hidden");
    assert.equal(delivery.status, "failed");
    assert.equal(delivery.sentAt, null);
    assert.doesNotMatch(delivery.error, /pi_secret|file\.xlsx/);
  });
});

test("deleted users and invalid recipient emails do not send transactional email", async () => {
  for (const user of [makeUser({ isDeleted: true }), makeUser({ email: "" }), makeUser({ email: "bad-email" })]) {
    let sent = 0;

    await withModelStubs({ user, subscription: makeSubscription() }, async () => {
      const result = await sendSubscriptionPaymentSucceededEmail({
        invoice: makeInvoice(),
        payment: makePayment(),
        subscriptionRecord: makeSubscription(),
        emailSender: async () => {
          sent += 1;
          return { sent: true, provider: "test" };
        },
      });

      assert.equal(result.skipped, true);
      assert.equal(sent, 0);
    });
  }
});

test("transactional templates escape dynamic HTML and hide Stripe IDs, file paths, and secrets", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalClientUrl = process.env.CLIENT_URL;
  const originalLogoUrl = process.env.EMAIL_LOGO_URL;
  process.env.NODE_ENV = "production";
  process.env.CLIENT_URL = "https://evil.example.test";
  process.env.EMAIL_LOGO_URL = "javascript:alert(1)";

  try {
    const email = buildSubscriptionPaymentSucceededEmail({
      planName: "Asmeninis <script> sub_secret",
      amount: 14.99,
      currency: "eur",
      paidAt: new Date("2026-08-24T10:00:00.000Z"),
      status: "active",
    });
    const productEmail = buildDigitalProductDeliveredEmail({
      productName: "Produktas <b> C:\\protected\\file.xlsx pi_secret",
      purchasedAt: new Date("2026-08-24T10:00:00.000Z"),
    });

    assert.match(email.html, /Asmeninis &lt;script&gt;/);
    assert.doesNotMatch(email.html, /Asmeninis <script>/);
    assert.match(email.html, /https:\/\/www\.stilloak-studio\.com\/profile/);
    assert.doesNotMatch(email.html, /evil\.example|javascript:/);
    assert.doesNotMatch(productEmail.html, /C:\\protected\\file\.xlsx|pi_secret|in_test_hidden|cus_test_hidden/);
    assert.match(productEmail.text, /Saugumo sumetimais/);
    assert.match(email.text, /mokėjimas/);
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CLIENT_URL = originalClientUrl;
    process.env.EMAIL_LOGO_URL = originalLogoUrl;
  }
});

test("error sanitizer masks emails, Stripe data, paths, and sensitive URL query values", () => {
  const sanitized = sanitizeErrorMessage(
    "Failed for ona@example.test pi_123 sk_test_secret /srv/app/private/file.xlsx C:\\secret\\file.xlsx https://x.test/callback?token=abc&key=def&ok=1&signature=sig"
  );

  assert.doesNotMatch(sanitized, /ona@example\.test|pi_123|sk_test_secret|\/srv\/app|C:\\secret|token=abc|key=def|signature=sig/);
  assert.match(sanitized, /\[email\]/);
  assert.match(sanitized, /\[stripe-id\]/);
  assert.match(sanitized, /\[stripe-secret\]/);
});
