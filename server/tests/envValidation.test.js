const assert = require("node:assert/strict");
const test = require("node:test");

const { validateEnvironment } = require("../config/env");

const keys = [
  "NODE_ENV",
  "MONGO_URI",
  "JWT_SECRET",
  "CLIENT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BAZINIS",
  "STRIPE_PRICE_ASMENINIS",
  "STRIPE_PRICE_PRIVATUS_VERSLAS",
];

const snapshotEnv = () =>
  Object.fromEntries(keys.map((key) => [key, process.env[key]]));

const restoreEnv = (snapshot) => {
  for (const key of keys) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snapshot[key];
    }
  }
};

test("production environment does not require Demo Stripe price ID", () => {
  const snapshot = snapshotEnv();

  try {
    process.env.NODE_ENV = "production";
    process.env.MONGO_URI = "mongodb://127.0.0.1:27017/manoshop";
    process.env.JWT_SECRET = "x".repeat(32);
    process.env.CLIENT_URL = "https://example.test";
    process.env.STRIPE_SECRET_KEY = "sk_test_configured";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_configured";
    delete process.env.STRIPE_PRICE_BAZINIS;
    process.env.STRIPE_PRICE_ASMENINIS = "price_personal";
    process.env.STRIPE_PRICE_PRIVATUS_VERSLAS = "price_business";

    assert.doesNotThrow(() => validateEnvironment());
  } finally {
    restoreEnv(snapshot);
  }
});

test("production environment requires paid plan Stripe price IDs", () => {
  const snapshot = snapshotEnv();

  try {
    process.env.NODE_ENV = "production";
    process.env.MONGO_URI = "mongodb://127.0.0.1:27017/manoshop";
    process.env.JWT_SECRET = "x".repeat(32);
    process.env.CLIENT_URL = "https://example.test";
    process.env.STRIPE_SECRET_KEY = "sk_test_configured";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_configured";
    delete process.env.STRIPE_PRICE_BAZINIS;
    delete process.env.STRIPE_PRICE_ASMENINIS;
    delete process.env.STRIPE_PRICE_PRIVATUS_VERSLAS;

    assert.throws(
      () => validateEnvironment(),
      /STRIPE_PRICE_ASMENINIS.*STRIPE_PRICE_PRIVATUS_VERSLAS/
    );
  } finally {
    restoreEnv(snapshot);
  }
});
