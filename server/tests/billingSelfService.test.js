const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const controllerPath = require.resolve("../controllers/billingController");
const stripeClientPath = require.resolve("../utils/stripeClient");

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

const createRequest = (overrides = {}) => ({
  user: {
    _id: {
      toString: () => "user_1",
    },
  },
  headers: {
    origin: "https://evil.example.test",
    ...(overrides.headers || {}),
  },
  body: overrides.body || {},
});

const withControllerMocks = async ({ user, stripe }, callback) => {
  const User = require("../models/User");
  const originalFindById = User.findById;

  User.findById = () => ({
    select: async () => user,
  });

  delete require.cache[controllerPath];
  require.cache[stripeClientPath] = {
    id: stripeClientPath,
    filename: stripeClientPath,
    loaded: true,
    exports: {
      getStripeClient: () => stripe,
      resolveClientUrl: (origin) =>
        origin === "https://app.example.test" ? "https://app.example.test" : "https://client.example.test",
    },
  };

  try {
    await callback(require("../controllers/billingController"));
  } finally {
    User.findById = originalFindById;
    delete require.cache[controllerPath];
    delete require.cache[stripeClientPath];
  }
};

test("Customer Portal session uses only authenticated user's Stripe customer", async () => {
  const calls = [];
  const stripe = {
    billingPortal: {
      sessions: {
        create: async (payload, options) => {
          calls.push({ payload, options });
          return { url: "https://billing.stripe.test/session" };
        },
      },
    },
  };

  await withControllerMocks(
    {
      user: {
        _id: { toString: () => "user_1" },
        subscription: {
          plan: "personal",
          status: "active",
          provider: "stripe",
          stripeCustomerId: "cus_real_user",
          stripeSubscriptionId: "sub_real_user",
        },
      },
      stripe,
    },
    async (controller) => {
      const res = createResponse();
      await controller.createCustomerPortalSession(
        createRequest({ body: { customerId: "cus_attacker", stripeCustomerId: "cus_attacker" } }),
        res
      );

      assert.equal(res.statusCode, 201);
      assert.deepEqual(res.body, { url: "https://billing.stripe.test/session" });
      assert.equal(calls[0].payload.customer, "cus_real_user");
      assert.equal(calls[0].payload.return_url, "https://client.example.test/profile");
      assert.match(calls[0].options.idempotencyKey, /^billing-portal:/);
    }
  );
});

test("Customer Portal is not created for Demo user without Stripe subscription", async () => {
  const stripe = {
    billingPortal: {
      sessions: {
        create: async () => {
          throw new Error("should not create portal");
        },
      },
    },
  };

  await withControllerMocks(
    {
      user: {
        _id: { toString: () => "user_1" },
        subscription: { plan: "basic", status: "active", provider: "internal" },
      },
      stripe,
    },
    async (controller) => {
      await assert.rejects(
        () => controller.createCustomerPortalSession(createRequest(), createResponse()),
        (error) => error.statusCode === 409
      );
    }
  );
});

test("subscription invoices are scoped to authenticated user's Stripe customer and serialized safely", async () => {
  const invoiceCalls = [];
  const stripe = {
    invoices: {
      list: async (payload) => {
        invoiceCalls.push(payload);
        return {
          data: [
            {
              id: "in_1",
              created: 1787500000,
              amount_paid: 1499,
              currency: "eur",
              status: "paid",
              number: "INV-001",
              hosted_invoice_url: "https://invoice.stripe.test/in_1",
              invoice_pdf: "https://invoice.stripe.test/in_1.pdf",
              customer: "cus_real_user",
              metadata: { secret: "hidden" },
            },
          ],
        };
      },
    },
  };

  await withControllerMocks(
    {
      user: {
        _id: { toString: () => "user_1" },
        subscription: {
          plan: "personal",
          status: "active",
          provider: "stripe",
          stripeCustomerId: "cus_real_user",
          stripeSubscriptionId: "sub_real_user",
        },
      },
      stripe,
    },
    async (controller) => {
      const res = createResponse();
      await controller.listSubscriptionInvoices(createRequest({ body: { customerId: "cus_attacker" } }), res);

      assert.deepEqual(invoiceCalls, [{ customer: "cus_real_user", limit: 10 }]);
      assert.equal(res.body.invoices.length, 1);
      assert.deepEqual(Object.keys(res.body.invoices[0]).sort(), [
        "amount",
        "currency",
        "date",
        "hostedInvoiceUrl",
        "invoicePdf",
        "number",
        "status",
      ]);
      assert.equal(res.body.invoices[0].id, undefined);
      assert.equal(res.body.invoices[0].customer, undefined);
      assert.equal(res.body.invoices[0].metadata, undefined);
    }
  );
});

test("frontend billing service does not expose Stripe customer override fields", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "client", "src", "services", "billingService.js"), "utf8");

  assert.match(source, /createPortalSession = async \(\) =>/);
  assert.match(source, /getSubscriptionInvoices = async \(\) =>/);
  assert.doesNotMatch(source, /customerId|stripeCustomerId|stripeSubscriptionId/);
});

test("billing routes rate-limit portal, sync, and subscription invoice endpoints", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "routes", "billingRoutes.js"), "utf8");

  assert.match(source, /billingPortalLimiter = createWindowRateLimiter/);
  assert.match(source, /billingSyncLimiter = createWindowRateLimiter/);
  assert.match(source, /billingInvoicesLimiter = createWindowRateLimiter/);
  assert.match(source, /router\.post\("\/create-portal-session", protect, requireVerifiedEmail, billingPortalLimiter/);
  assert.match(source, /router\.post\("\/sync-stripe-membership", protect, requireVerifiedEmail, billingSyncLimiter/);
  assert.match(source, /router\.get\("\/subscription-invoices", protect, requireVerifiedEmail, billingInvoicesLimiter/);
  assert.match(source, /Per daug prenumeratos savitarnos užklausų/);
  assert.match(source, /Per daug narystės sinchronizavimo užklausų/);
  assert.match(source, /Per daug prenumeratos sąskaitų užklausų/);
});
