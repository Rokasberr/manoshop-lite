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
  assert.match(source, /event\.livemode/);
  assert.match(source, /stripeLiveEnabled/);
  assert.match(source, /eventId: event.id/);
  assert.match(source, /metadata\?\.userId/);
  assert.match(source, /lifetime\.active = true/);
});

test("Checkout is server-created with a short-lived idempotency key", async () => {
  const source = await read("../server/services/stripeService.js");
  assert.match(source, /mode: "payment"/);
  assert.match(source, /idempotencyKey/);
  assert.match(source, /Math\.floor\(Date\.now\(\) \/ 300_000\)/);
  assert.match(source, /mode === "test" && config\.isProductionRelease/);
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

test("Premium behavior tools, progress ranges, and emails are server-gated", async () => {
  const [today, progress, settings, cron] = await Promise.all([
    read("../server/routes/today.js"),
    read("../server/routes/progress.js"),
    read("../server/routes/settings.js"),
    read("../server/services/cronService.js")
  ]);
  assert.ok((today.match(/requireLifetime/g) || []).length >= 6);
  assert.match(progress, /requested !== 7 && !hasLifetimeAccess/);
  assert.match(progress, /averageCigarettes = null/);
  assert.match(settings, /enablesEmail && !hasLifetimeAccess/);
  assert.match(settings, /if \(hasLifetimeAccess\(request\.user\)\)/);
  assert.match(cron, /"lifetime\.active": true/);
});

test("Account export and deletion cover behavioral records", async () => {
  const source = await read("../server/routes/auth.js");
  for (const model of ["Habit", "DailyEntry", "Craving", "SmokingEvent", "EmailDelivery"]) {
    assert.match(source, new RegExp(`${model}\\.find\\(`));
    assert.match(source, new RegExp(`${model}\\.deleteMany\\(`));
  }
  assert.match(source, /confirmation !== "DELETE MY RESET"/);
});

test("Health response verifies storage without exposing configuration", async () => {
  const source = await read("../server/app.js");
  assert.match(source, /db\.admin\(\)\.ping\(\)/);
  assert.match(source, /status: "ok", service: "reset-by-stilloak"/);
  assert.doesNotMatch(source, /configured:/);
});

test("Cron checks due email windows every five minutes", async () => {
  const source = await read("../vercel.json");
  const config = JSON.parse(source);
  assert.equal(config.crons[0].schedule, "*/5 * * * *");
  assert.equal(config.functions["api/[...path].js"].maxDuration, 60);
});
