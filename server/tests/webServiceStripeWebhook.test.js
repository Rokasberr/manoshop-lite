const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const controllerSource = fs.readFileSync(
  path.join(__dirname, "..", "controllers", "webServiceStripeWebhookController.js"),
  "utf8"
);

test("Stilloak Web Stripe webhook is registered with raw body before JSON parsing", () => {
  const webhookIndex = serverSource.indexOf('"/api/web-service-stripe/webhook"');
  const jsonParserIndex = serverSource.indexOf("app.use(express.json())");

  assert.notEqual(webhookIndex, -1);
  assert.notEqual(jsonParserIndex, -1);
  assert.ok(webhookIndex < jsonParserIndex);
  assert.match(serverSource, /express\.raw\(\{ type: "application\/json" \}\)/);
  assert.match(serverSource, /handleWebServiceStripeWebhook/);
});

test("Stilloak Web Stripe webhook uses its own signing secret", () => {
  assert.match(controllerSource, /STRIPE_WEB_SERVICE_WEBHOOK_SECRET/);
  assert.match(controllerSource, /stripe\.webhooks\.constructEvent/);
});

test("Stilloak Web Stripe webhook syncs paid, expired and refunded deposits", () => {
  assert.match(controllerSource, /checkout\.session\.completed/);
  assert.match(controllerSource, /checkout\.session\.expired/);
  assert.match(controllerSource, /charge\.refunded/);
  assert.match(controllerSource, /refund\.updated/);
  assert.match(controllerSource, /checkoutType === "web_service_deposit"/);
  assert.match(controllerSource, /syncWebServiceDepositFromSession\(session\)/);
  assert.match(controllerSource, /syncWebServiceDepositFromSession\(session, \{ expired: true \}\)/);
  assert.match(controllerSource, /syncWebServiceDepositRefund\(\{ paymentIntentId \}\)/);
});

test("Stilloak Web Stripe webhook keeps event processing idempotent", () => {
  assert.match(controllerSource, /beginStripeWebhookEvent\(event\)/);
  assert.match(controllerSource, /duplicate: true/);
  assert.match(controllerSource, /markStripeWebhookEventProcessed\(webhookRecord\)/);
  assert.match(controllerSource, /markStripeWebhookEventFailed\(webhookRecord, error\)/);
});

test("Stilloak Web Stripe webhook syncs the final payment and sends the configured invoice", () => {
  assert.match(controllerSource, /checkoutType === "web_service_final_payment"/);
  assert.match(controllerSource, /syncWebServiceFinalPaymentFromSession\(session\)/);
  assert.match(controllerSource, /sendInvoiceOnce\(request, "final"\)/);
  assert.match(controllerSource, /areOfficialWebServiceDocumentsEnabled/);
  assert.match(controllerSource, /syncWebServiceFinalPaymentFromSession\(session, \{ expired: true \}\)/);
});
