const assert = require("node:assert/strict");
const test = require("node:test");

const adminRoutes = require("../routes/adminRoutes");

test("admin payment routes are protected by auth and admin middleware", () => {
  const layerNames = adminRoutes.stack.map((layer) => layer.name);

  assert.equal(layerNames[0], "protect");
  assert.equal(layerNames[1], "adminOnly");
  assert.ok(adminRoutes.stack.some((layer) => layer.route?.path === "/payments"));
  assert.ok(adminRoutes.stack.some((layer) => layer.route?.path === "/subscriptions"));
  assert.ok(adminRoutes.stack.some((layer) => layer.route?.path === "/instagram-posts/generate"));
  assert.ok(adminRoutes.stack.some((layer) => layer.route?.path === "/instagram-posts/recent"));
  assert.ok(adminRoutes.stack.some((layer) => layer.route?.path === "/instagram-posts/download/:filename"));
});
