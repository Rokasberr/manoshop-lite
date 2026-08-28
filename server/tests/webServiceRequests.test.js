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

test("Admin Web CRM stores proposals, follow-ups, deadlines and contact history", () => {
  const modelSource = readRepoFile("server", "models", "WebServiceRequest.js");
  const controllerSource = readRepoFile("server", "controllers", "webServiceRequestController.js");
  const adminSource = readRepoFile("client", "src", "pages", "admin", "WebOrdersManagerPage.jsx");

  assert.match(modelSource, /proposalPrice:/);
  assert.match(modelSource, /nextAction:/);
  assert.match(modelSource, /nextActionAt:/);
  assert.match(modelSource, /dueDate:/);
  assert.match(modelSource, /contactHistory:/);
  assert.match(controllerSource, /contactEntry/);
  assert.match(controllerSource, /CONTACT_TYPE_OPTIONS/);
  assert.match(adminSource, /Pasiūlymo kaina/);
  assert.match(adminSource, /Follow-up data/);
  assert.match(adminSource, /Kontaktų istorija/);
  assert.match(adminSource, /Išsaugoti CRM/);
});

test("CRM V3 automatically schedules new leads and prioritizes the sales queue", () => {
  const controllerSource = readRepoFile("server", "controllers", "webServiceRequestController.js");
  const adminSource = readRepoFile("client", "src", "pages", "admin", "WebOrdersManagerPage.jsx");

  assert.match(controllerSource, /INITIAL_FOLLOW_UP_HOURS/);
  assert.match(controllerSource, /nextAction: "Susisiekti su klientu"/);
  assert.match(controllerSource, /nextActionAt: getInitialNextActionAt\(plan\.id\)/);
  assert.match(adminSource, /getLeadPriority/);
  assert.match(adminSource, /Reikia dėmesio/);
  assert.match(adminSource, /Pipeline vertė/);
  assert.match(adminSource, /Prioritetas:/);
  assert.match(adminSource, /Follow-up vėluoja/);
  assert.match(adminSource, /setQuickFollowUp/);
});

test("Web proposals use server-controlled pricing, tokenized acceptance and Stripe deposits", () => {
  const modelSource = readRepoFile("server", "models", "WebServiceRequest.js");
  const controllerSource = readRepoFile("server", "controllers", "webServiceRequestController.js");
  const routesSource = readRepoFile("server", "routes", "webServiceRequestRoutes.js");
  const proposalPageSource = readRepoFile("web-services", "src", "ProposalPage.tsx");
  const webMainSource = readRepoFile("web-services", "src", "main.tsx");
  const adminSource = readRepoFile("client", "src", "pages", "admin", "WebProposalsPage.jsx");
  const adminAppSource = readRepoFile("client", "src", "App.jsx");
  const adminShellSource = readRepoFile("client", "src", "components", "admin-dashboard", "AdminShell.jsx");

  assert.match(modelSource, /proposalTokenHash:/);
  assert.match(modelSource, /proposalAcceptedAt:/);
  assert.match(modelSource, /depositPercent:/);
  assert.match(modelSource, /depositStatus:/);
  assert.match(controllerSource, /hashProposalToken/);
  assert.match(controllerSource, /calculateDeposit\(proposalPrice, depositPercent\)/);
  assert.match(controllerSource, /checkoutType: "web_service_deposit"/);
  assert.match(controllerSource, /unit_amount: Math\.round\(request\.depositAmount \* 100\)/);
  assert.match(controllerSource, /acceptedTerms !== true/);
  assert.match(routesSource, /\/proposal\/:token\/accept/);
  assert.match(routesSource, /\/proposal\/:token\/deposit/);
  assert.match(routesSource, /\/:id\/proposal\/send/);
  assert.match(proposalPageSource, /Patvirtinti pasiūlymą/);
  assert.match(proposalPageSource, /Apmokėti .* avansą/);
  assert.match(webMainSource, /pasiulymas/);
  assert.match(adminSource, /Pasiūlymai ir avansai/);
  assert.match(adminSource, /Paruošti ir išsiųsti/);
  assert.match(adminAppSource, /path="web-proposals"/);
  assert.match(adminShellSource, /label: "Web pasiūlymai"/);
});

test("Web proposal admin supports payment history, final bank transfer and test invoice resend", () => {
  const routesSource = readRepoFile("server", "routes", "webServiceRequestRoutes.js");
  const modelSource = readRepoFile("server", "models", "WebServiceRequest.js");
  const adminSource = readRepoFile("client", "src", "pages", "admin", "WebProposalsPage.jsx");
  const invoiceController = readRepoFile("server", "controllers", "webServiceTestInvoiceController.js");

  assert.match(routesSource, /final-payment\/bank-transfer\/paid/);
  assert.match(routesSource, /test-invoice\/resend/);
  assert.match(modelSource, /finalPaymentMethod:/);
  assert.match(invoiceController, /depositStatus !== "paid"/);
  assert.match(invoiceController, /finalPaymentStatus !== "paid"/);
  assert.match(adminSource, /Mokėjimų istorija/);
  assert.match(adminSource, /Siųsti PDF dar kartą/);
  assert.match(adminSource, /Pažymėti likutį gautu pavedimu/);
});
