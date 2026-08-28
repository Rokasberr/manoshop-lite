const assert = require("node:assert/strict");
const test = require("node:test");

const {
  areWebStripeDepositsEnabled,
  getWebStripeDepositStatus,
  getWebStripeKeyMode,
} = require("../config/webServicePayments");

const ENV_KEYS = [
  "STRIPE_WEB_SERVICE_SECRET_KEY",
  "WEB_STRIPE_DEPOSITS_ENABLED",
  "WEB_SERVICE_STRIPE_LIVE_ENABLED",
];

const withPaymentEnv = (values, callback) => {
  const previous = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  try {
    for (const key of ENV_KEYS) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const value = values[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
    callback();
  } finally {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
};

test("Stilloak Web Stripe deposits stay off when the master switch is disabled", () => {
  withPaymentEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_test_example",
      WEB_STRIPE_DEPOSITS_ENABLED: "false",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "false",
    },
    () => {
      assert.equal(areWebStripeDepositsEnabled(), false);
      assert.equal(getWebStripeDepositStatus().reason, "deposits_disabled");
    }
  );
});

test("Stilloak Web can use Stripe test keys without unlocking live payments", () => {
  withPaymentEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_test_example",
      WEB_STRIPE_DEPOSITS_ENABLED: "true",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "false",
    },
    () => {
      assert.equal(getWebStripeKeyMode(), "test");
      assert.equal(areWebStripeDepositsEnabled(), true);
      assert.deepEqual(getWebStripeDepositStatus(), {
        enabled: true,
        mode: "test",
        liveEnabled: false,
        reason: "test_mode",
      });
    }
  );
});

test("Stilloak Web refuses a live Stripe key until the separate live safety flag is enabled", () => {
  withPaymentEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_live_example",
      WEB_STRIPE_DEPOSITS_ENABLED: "true",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "false",
    },
    () => {
      assert.equal(getWebStripeKeyMode(), "live");
      assert.equal(areWebStripeDepositsEnabled(), false);
      assert.equal(getWebStripeDepositStatus().reason, "live_locked");
    }
  );
});

test("Stilloak Web live Stripe requires both payment switches and a live key", () => {
  withPaymentEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_live_example",
      WEB_STRIPE_DEPOSITS_ENABLED: "true",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "true",
    },
    () => {
      assert.equal(areWebStripeDepositsEnabled(), true);
      assert.deepEqual(getWebStripeDepositStatus(), {
        enabled: true,
        mode: "live",
        liveEnabled: true,
        reason: "live_enabled",
      });
    }
  );
});

test("Stilloak Web fails closed for a missing or unknown Stripe secret key", () => {
  withPaymentEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: undefined,
      WEB_STRIPE_DEPOSITS_ENABLED: "true",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "true",
    },
    () => {
      assert.equal(getWebStripeKeyMode(), "unconfigured");
      assert.equal(areWebStripeDepositsEnabled(), false);
      assert.equal(getWebStripeDepositStatus().reason, "stripe_key_unconfigured");
    }
  );
});
