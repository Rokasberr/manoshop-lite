import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Stripe webhook receives raw body before JSON parsing", async () => {
  const source = await read("../server/app.js");
  assert.ok(source.indexOf("express.raw") < source.indexOf("express.json"));
  assert.match(source, /stripeWebhook/);
});

test("Lifetime fulfillment is server-side, signed, paid-only, and idempotent", async () => {
  const source = await read("../server/routes/billing.js");
  assert.match(source, /constructEvent/);
  assert.match(source, /payment_status === "unpaid"/);
  assert.match(source, /eventId: event.id/);
  assert.match(source, /metadata\?\.userId/);
  assert.match(source, /lifetime\.active = true/);
});

test("client success page only polls server billing status", async () => {
  const source = await read("../src/pages/PricingPage.tsx");
  assert.match(source, /\/billing\/status/);
  assert.doesNotMatch(source, /localStorage.*lifetime/i);
});

test("secrets remain environment-only", async () => {
  const files = [await read("../server/config.js"), await read("../server/services/stripeService.js"), await read("../.env.example")];
  for (const source of files) {
    assert.doesNotMatch(source, /sk_live_[A-Za-z0-9]/);
    assert.doesNotMatch(source, /whsec_[A-Za-z0-9]/);
  }
});
