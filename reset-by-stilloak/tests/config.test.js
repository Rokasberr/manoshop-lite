import assert from "node:assert/strict";
import test from "node:test";
import { validateRuntimeConfig } from "../server/config.js";

const managedKeys = [
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
  "RESET_APP_URL",
  "RESET_MONGO_URI",
  "RESET_JWT_SECRET",
  "RESET_COOKIE_NAME",
  "RESET_STRIPE_SECRET_KEY",
  "RESET_STRIPE_WEBHOOK_SECRET",
  "RESET_STRIPE_LIFETIME_PRICE_ID",
  "RESET_STRIPE_LIVE_ENABLED",
  "CRON_SECRET",
  "EMAIL_FROM",
  "RESET_ADMIN_EMAIL",
  "BREVO_API_KEY",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS"
];

const withEnvironment = (values, callback) => {
  const previous = Object.fromEntries(managedKeys.map((key) => [key, process.env[key]]));
  for (const key of managedKeys) delete process.env[key];
  Object.assign(process.env, values);
  try {
    return callback();
  } finally {
    for (const key of managedKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
};

const base = {
  NODE_ENV: "production",
  VERCEL: "1",
  RESET_APP_URL: "https://preview.example.com",
  RESET_MONGO_URI: "mongodb://example.invalid/reset_preview",
  RESET_JWT_SECRET: "preview-secret-with-at-least-32-characters"
};

test("Preview rejects live Stripe credentials", () => {
  withEnvironment(
    {
      ...base,
      VERCEL_ENV: "preview",
      RESET_STRIPE_SECRET_KEY: "rk_live_example"
    },
    () => assert.throws(validateRuntimeConfig, /Live Stripe keys are blocked/)
  );
});

test("Production requires a host-only cookie and explicit live mode", () => {
  const production = {
    ...base,
    VERCEL_ENV: "production",
    RESET_APP_URL: "https://reset.example.com",
    RESET_COOKIE_NAME: "reset_session",
    RESET_STRIPE_SECRET_KEY: "rk_live_example",
    RESET_STRIPE_WEBHOOK_SECRET: "whsec_example",
    RESET_STRIPE_LIFETIME_PRICE_ID: "price_example",
    RESET_STRIPE_LIVE_ENABLED: "true",
    CRON_SECRET: "cron-secret",
    EMAIL_FROM: "RESET <hello@example.com>",
    RESET_ADMIN_EMAIL: "admin@example.com",
    BREVO_API_KEY: "email-provider-key"
  };
  withEnvironment(production, () => assert.throws(validateRuntimeConfig, /__Host-/));
  withEnvironment({ ...production, RESET_COOKIE_NAME: "__Host-reset_session", RESET_STRIPE_LIVE_ENABLED: "false" }, () => {
    assert.throws(validateRuntimeConfig, /explicitly enabled live Stripe key/);
  });
  withEnvironment({ ...production, RESET_COOKIE_NAME: "__Host-reset_session" }, () => {
    assert.equal(validateRuntimeConfig().isProductionRelease, true);
  });
});
