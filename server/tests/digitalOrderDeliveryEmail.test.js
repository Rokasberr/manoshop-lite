const assert = require("node:assert/strict");
const test = require("node:test");

const EmailDelivery = require("../models/EmailDelivery");
const User = require("../models/User");
const { ensureDigitalDeliveryEmail } = require("../services/digitalDeliveryEmailService");

const withStubs = async ({ user, deliveries = new Map() }, callback) => {
  const originals = {
    emailFindOne: EmailDelivery.findOne,
    emailFindOneAndUpdate: EmailDelivery.findOneAndUpdate,
    userFindById: User.findById,
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
    const matchesRetry =
      existing &&
      filter.status?.$ne === "sent" &&
      existing.status !== "sent" &&
      (existing.status === "failed" ||
        (existing.status === "processing" && existing.updatedAt <= filter.$or?.[1]?.updatedAt?.$lte));

    if (matchesRetry) {
      Object.assign(existing, update.$set || {});
      if (update.$inc?.attempts) {
        existing.attempts += update.$inc.attempts;
      }
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
  User.findById = () => ({
    select: async () => user,
  });

  try {
    await callback({ deliveries });
  } finally {
    EmailDelivery.findOne = originals.emailFindOne;
    EmailDelivery.findOneAndUpdate = originals.emailFindOneAndUpdate;
    User.findById = originals.userFindById;
  }
};

const makeUser = (overrides = {}) => ({
  _id: { toString: () => "user_1" },
  email: "ona@example.test",
  isDeleted: false,
  ...overrides,
});

const makeOrder = (overrides = {}) => ({
  _id: { toString: () => "order_1" },
  user: { toString: () => "user_1" },
  customerEmail: "buyer@example.test",
  containsDigitalProducts: true,
  paymentStatus: "paid",
  items: [
    {
      name: "StillOak Savings Tracker",
      quantity: 1,
      productType: "digital",
      digitalAsset: { storagePath: "protected/secret.xlsx" },
    },
  ],
  invoice: { number: "INV-20260824-001" },
  digitalDeliveryEmail: { status: "pending", sentAt: null, lastAttemptAt: null, error: "" },
  saveCount: 0,
  async save() {
    this.saveCount += 1;
    return this;
  },
  ...overrides,
});

test("paid digital order with a valid owner sends one account-zone email", async () => {
  const sent = [];
  const order = makeOrder();

  await withStubs({ user: makeUser() }, async () => {
    await ensureDigitalDeliveryEmail(order, {
      emailSender: async (payload) => {
        sent.push(payload);
        return { sent: true, provider: "test" };
      },
    });

    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, "ona@example.test");
    assert.equal(order.digitalDeliveryEmail.status, "sent");
    assert.doesNotMatch(sent[0].email.html, /storagePath|protected\/secret|attachments|download token/i);
  });
});

test("repeat and concurrent digital order delivery calls do not duplicate email", async () => {
  const sent = [];
  let releaseSender = null;
  const senderGate = new Promise((resolve) => {
    releaseSender = resolve;
  });

  await withStubs({ user: makeUser() }, async () => {
    const firstOrder = makeOrder();
    const first = ensureDigitalDeliveryEmail(firstOrder, {
      emailSender: async (payload) => {
        sent.push(payload);
        await senderGate;
        return { sent: true, provider: "test" };
      },
    }).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    );
    const second = ensureDigitalDeliveryEmail(makeOrder(), {
      emailSender: async (payload) => {
        sent.push(payload);
        return { sent: true, provider: "test" };
      },
    }).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    );

    await new Promise((resolve) => setImmediate(resolve));
    releaseSender();
    const results = await Promise.all([first, second]);

    assert.equal(sent.length, 1);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected" && result.reason.retryable).length, 1);

    await ensureDigitalDeliveryEmail(firstOrder, {
      emailSender: async (payload) => {
        sent.push(payload);
        return { sent: true, provider: "test" };
      },
    });
    assert.equal(sent.length, 1);
  });
});

test("digital order delivery skips deleted, missing, invalid, or unowned users", async () => {
  const cases = [
    { user: makeUser({ isDeleted: true }), order: makeOrder(), reason: /ištrintas|istrintas/i },
    { user: null, order: makeOrder(), reason: /nerastas/i },
    { user: makeUser(), order: makeOrder({ user: null }), reason: /nuosavyb/i },
    { user: makeUser({ email: "bad-email" }), order: makeOrder(), reason: /paštas|pastas/i },
  ];

  for (const entry of cases) {
    const order = entry.order;
    let sent = 0;

    await withStubs({ user: entry.user }, async () => {
      await ensureDigitalDeliveryEmail(order, {
        emailSender: async () => {
          sent += 1;
          return { sent: true, provider: "test" };
        },
      });
    });

    assert.equal(sent, 0);
    assert.equal(order.digitalDeliveryEmail.status, "failed");
    assert.match(order.digitalDeliveryEmail.error, entry.reason);
  }
});

test("digital order delivery stores only sanitized provider errors", async () => {
  const order = makeOrder();

  await withStubs({ user: makeUser() }, async () => {
    await ensureDigitalDeliveryEmail(order, {
      emailSender: async () => {
        throw new Error(
          "provider failed for ona@example.test pi_123 sk_test_secret C:\\secret\\file.xlsx /srv/app/private/file.xlsx ?token=abc&signature=sig"
        );
      },
    });

    assert.equal(order.digitalDeliveryEmail.status, "failed");
    assert.doesNotMatch(
      order.digitalDeliveryEmail.error,
      /ona@example\.test|pi_123|sk_test_secret|C:\\secret|\/srv\/app|token=abc|signature=sig/
    );
  });
});
