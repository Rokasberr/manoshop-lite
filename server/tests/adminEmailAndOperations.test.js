const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { TEMPLATE_OPTIONS, buildTestEmail } = require("../controllers/adminEmailController");
const { REMINDER_DAYS, isDue } = require("../services/webServicePaymentReminderScheduler");

const readRepoFile = (...parts) => fs.readFileSync(path.resolve(__dirname, "..", "..", ...parts), "utf8");

test("admin can test every supported professional email template", () => {
  assert.deepEqual(TEMPLATE_OPTIONS, ["web_project", "email_verification", "password_reset", "subscription_paid", "subscription_failed", "subscription_cancel", "digital_product"]);
  for (const type of TEMPLATE_OPTIONS) {
    const email = buildTestEmail(type);
    assert.ok(email.subject);
    assert.match(email.html, /Stilloak/);
    assert.ok(email.text.length > 40);
  }
  const routes = readRepoFile("server", "routes", "adminRoutes.js");
  const page = readRepoFile("client", "src", "pages", "admin", "EmailTestingPage.jsx");
  assert.match(routes, /\/email-test/);
  assert.match(page, /Laiškų pristatymo būsena/);
  assert.match(page, /Pažymėtas kaip šlamštas/);
});

test("payment reminders follow the 2, 5 and 10 day schedule", () => {
  assert.deepEqual(REMINDER_DAYS, [2, 5, 10]);
  const startedAt = new Date("2026-08-01T00:00:00.000Z");
  assert.equal(isDue(startedAt, 0, new Date("2026-08-02T23:59:59.000Z")), false);
  assert.equal(isDue(startedAt, 0, new Date("2026-08-03T00:00:00.000Z")), true);
  assert.equal(isDue(startedAt, 1, new Date("2026-08-06T00:00:00.000Z")), true);
  assert.equal(isDue(startedAt, 2, new Date("2026-08-11T00:00:00.000Z")), true);
  assert.equal(isDue(startedAt, 3, new Date("2026-09-01T00:00:00.000Z")), false);
});

test("both websites render helpful 404 pages instead of redirecting silently", () => {
  const clientApp = readRepoFile("client", "src", "App.jsx");
  const clientPage = readRepoFile("client", "src", "pages", "NotFoundPage.jsx");
  const webMain = readRepoFile("web-services", "src", "main.tsx");
  const webPage = readRepoFile("web-services", "src", "NotFoundPage.tsx");
  assert.match(clientApp, /path="\*" element=\{<NotFoundPage/);
  assert.match(clientPage, /404 · Puslapis nerastas/);
  assert.match(webMain, /isHomePage \? <App \/> : <NotFoundPage/);
  assert.match(webPage, /Kontaktai/);
});

test("admin action history records the acting administrator", () => {
  const model = readRepoFile("server", "models", "WebServiceRequest.js");
  const controller = readRepoFile("server", "controllers", "webServiceRequestController.js");
  const historyUi = readRepoFile("client", "src", "pages", "admin", "WebOrdersManagerPage.jsx");
  assert.match(model, /actorName:/);
  assert.match(model, /actorEmail:/);
  assert.match(controller, /\.\.\.adminActor\(req\)/);
  assert.match(historyUi, /Atliko:/);
});

test("email delivery events are secret-protected and mapped to delivery states", () => {
  const webhook = readRepoFile("server", "controllers", "emailEventWebhookController.js");
  const model = readRepoFile("server", "models", "EmailDelivery.js");
  assert.match(webhook, /EMAIL_EVENT_WEBHOOK_SECRET/);
  assert.match(webhook, /timingSafeEqual/);
  assert.match(model, /"delivered", "bounced", "complained"/);
});
