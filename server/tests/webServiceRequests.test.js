const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  WEB_SERVICE_PLANS,
  WEB_SERVICE_PLAN_IDS,
  getWebServicePlan,
} = require("../config/webServicePlans");

const readRepoFile = (...parts) =>
  fs.readFileSync(path.resolve(__dirname, "..", "..", ...parts), "utf8");

test("Web service packages use the approved server-side prices", () => {
  assert.deepEqual(WEB_SERVICE_PLAN_IDS, ["start", "business", "pro", "custom"]);
  assert.equal(WEB_SERVICE_PLANS.start.basePrice, 299);
  assert.equal(WEB_SERVICE_PLANS.business.basePrice, 599);
  assert.equal(WEB_SERVICE_PLANS.pro.basePrice, 999);
  assert.equal(WEB_SERVICE_PLANS.custom.basePrice, null);
  assert.equal(getWebServicePlan(" BUSINESS ").id, "business");
  assert.equal(getWebServicePlan("unknown"), null);
});

test("Public Web order route can create requests but admin access protects reads and updates", () => {
  const routesSource = readRepoFile("server", "routes", "webServiceRequestRoutes.js");

  assert.match(routesSource, /router\.post\("\/", publicRequestLimiter, asyncHandler\(createWebServiceRequest\)\)/);
  assert.match(routesSource, /router\.get\("\/", protect, adminOnly, asyncHandler\(getAdminWebServiceRequests\)\)/);
  assert.match(routesSource, /protect,\s*adminOnly,\s*validateObjectId\("id"\)/s);
  assert.match(routesSource, /max:\s*5/);
  assert.match(routesSource, /15 \* 60 \* 1000/);
});

test("Web order price is sourced from the server plan instead of client payload", () => {
  const controllerSource = readRepoFile("server", "controllers", "webServiceRequestController.js");

  assert.match(controllerSource, /const plan = getWebServicePlan\(packageId\)/);
  assert.match(controllerSource, /basePrice: plan\.basePrice/);
  assert.doesNotMatch(controllerSource, /basePrice:\s*req\.body/);
  assert.match(controllerSource, /source: "stilloak-web-services"/);
});

test("Stilloak Web and admin UI expose the new order flow", () => {
  const pricingSource = readRepoFile("web-services", "src", "data", "pricing.ts");
  const webAppSource = readRepoFile("web-services", "src", "App.tsx");
  const adminAppSource = readRepoFile("client", "src", "App.jsx");
  const adminShellSource = readRepoFile("client", "src", "components", "admin-dashboard", "AdminShell.jsx");

  assert.match(pricingSource, /priceLabel: "299 €"/);
  assert.match(pricingSource, /priceLabel: "599 €"/);
  assert.match(pricingSource, /priceLabel: "999 €"/);
  assert.match(pricingSource, /name: "Pagal poreikius"/);
  assert.match(webAppSource, /packageId: form\.packageId/);
  assert.match(webAppSource, /requestNumber/);
  assert.match(adminAppSource, /path="web-orders"/);
  assert.match(adminShellSource, /label: "Web užsakymai"/);
});
