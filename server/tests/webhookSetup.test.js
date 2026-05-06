const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("Stripe webhook is mounted with raw body before JSON parsing", () => {
  const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  const webhookIndex = serverSource.indexOf('"/api/billing/webhook"');
  const rawIndex = serverSource.indexOf("express.raw", webhookIndex);
  const jsonIndex = serverSource.indexOf("express.json");

  assert.ok(webhookIndex > -1);
  assert.ok(rawIndex > webhookIndex);
  assert.ok(jsonIndex > rawIndex);
});
