const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  adminOnly,
  hasActiveMembership,
  memberOnly,
  protect,
  requireBusinessPlan,
  requireSavingsStudioPro,
} = require("../middleware/authMiddleware");
const { downloadMemberResource } = require("../controllers/memberResourceController");
const {
  canUserAccessBusinessStudio,
  canUserAccessSavingStudioPro,
  hasActivePlanStatus,
  normalizePlan,
} = require("../config/planAccess");
const {
  getMemberResourceFile,
  memberResources,
  resolvePrivateResourcePath,
} = require("../config/memberResources");
const { hasRequiredPlan } = require("../controllers/memberResourceController");
const { hasPurchasedProduct } = require("../services/digitalProductPurchaseService");
const { canAccessOrder } = require("../services/orderCheckoutService");

const root = path.resolve(__dirname, "..", "..");

const runGuard = (middleware, user) =>
  new Promise((resolve) => {
    const req = { headers: {}, user };
    middleware(req, {}, (error) => resolve(error));
  });

const makeUser = (plan, status = "active", overrides = {}) => ({
  _id: overrides._id || "user-1",
  role: overrides.role || "customer",
  isAdmin: overrides.isAdmin,
  subscription: { plan, status },
});

const runDownload = (user, resourceId, format) =>
  new Promise((resolve) => {
    const req = { user, params: { resourceId, format } };
    const res = {
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      download(filePath, fileName) {
        resolve({ filePath, fileName, headers: this.headers });
      },
    };

    Promise.resolve(downloadMemberResource(req, res)).catch((error) => resolve({ error }));
  });

test("member-only files are no longer stored under client/public/resources", () => {
  const publicResourcesPath = path.join(root, "client", "public", "resources");
  const remainingFiles = fs.existsSync(publicResourcesPath)
    ? fs.readdirSync(publicResourcesPath, { recursive: true }).filter((entry) => /\.[a-z0-9]+$/i.test(entry))
    : [];

  assert.deepEqual(remainingFiles, []);
});

test("client source does not link directly to moved member-only resources", () => {
  const clientSourceRoot = path.join(root, "client", "src");
  const sourceFiles = fs
    .readdirSync(clientSourceRoot, { recursive: true })
    .filter((entry) => /\.(jsx?|tsx?)$/i.test(entry));
  const directResourceLinks = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(path.join(clientSourceRoot, file), "utf8");

    if (/\/resources|public\/resources|client\/public\/resources/.test(content)) {
      directResourceLinks.push(file);
    }
  }

  assert.deepEqual(directResourceLinks, []);
});

test("guest cannot access private API guarded by protect", async () => {
  const error = await runGuard(protect, null);

  assert.equal(error.statusCode, 401);
});

test("Demo/basic can access member resources but not full Saving Studio or Business Studio API", async () => {
  const demoUser = makeUser("basic");

  assert.equal(hasActiveMembership(demoUser), true);
  assert.equal(hasRequiredPlan(demoUser, "basic"), true);

  const savingsError = await runGuard(requireSavingsStudioPro, demoUser);
  const businessError = await runGuard(requireBusinessPlan, demoUser);

  assert.equal(savingsError.statusCode, 403);
  assert.equal(businessError.statusCode, 403);
});

test("Personal can use full Saving Studio but not Business Studio API", async () => {
  const personalUser = makeUser("personal");

  assert.equal(canUserAccessSavingStudioPro(personalUser), true);
  assert.equal(await runGuard(requireSavingsStudioPro, personalUser), undefined);

  const businessError = await runGuard(requireBusinessPlan, personalUser);
  assert.equal(businessError.statusCode, 403);
});

test("Business can use Business Studio API", async () => {
  const businessUser = makeUser("private_business");

  assert.equal(canUserAccessBusinessStudio(businessUser), true);
  assert.equal(await runGuard(requireBusinessPlan, businessUser), undefined);
});

test("admin API requires a server-verified admin role", async () => {
  const customerError = await runGuard(adminOnly, makeUser("private_business"));
  assert.equal(customerError.statusCode, 403);

  assert.equal(await runGuard(adminOnly, makeUser("free", "inactive", { role: "admin" })), undefined);
});

test("inactive paid statuses and unknown subscription statuses do not grant paid access", async () => {
  for (const status of ["canceled", "inactive", "unpaid", "incomplete_expired", "incomplete", "paused", "mystery"]) {
    const user = makeUser("personal", status);

    assert.equal(hasActivePlanStatus(user), false);
    assert.equal(canUserAccessSavingStudioPro(user), false);
    assert.equal(canUserAccessBusinessStudio(user), false);
  }
});

test("active and trialing grant plan access, while past_due follows current server policy and is denied", () => {
  assert.equal(hasActivePlanStatus(makeUser("personal", "active")), true);
  assert.equal(hasActivePlanStatus(makeUser("personal", "trialing")), true);
  assert.equal(hasActivePlanStatus(makeUser("personal", "past_due")), false);
});

test("legacy plan aliases map to the same access levels as current plan IDs", () => {
  assert.equal(normalizePlan("bazinis"), "basic");
  assert.equal(normalizePlan("asmeninis"), "personal");
  assert.equal(normalizePlan("privatus_verslas"), "private_business");

  assert.equal(hasRequiredPlan(makeUser("bazinis"), "basic"), true);
  assert.equal(canUserAccessSavingStudioPro(makeUser("asmeninis")), true);
  assert.equal(canUserAccessBusinessStudio(makeUser("privatus_verslas")), true);
});

test("unknown plan IDs do not become paid member access", async () => {
  const unknownPlanUser = makeUser("circle", "active");

  assert.equal(hasActiveMembership(unknownPlanUser), false);
  assert.equal(canUserAccessSavingStudioPro(unknownPlanUser), false);
  assert.equal(canUserAccessBusinessStudio(unknownPlanUser), false);

  const memberError = await runGuard(memberOnly, unknownPlanUser);
  assert.equal(memberError.statusCode, 403);
});

test("users cannot access another user's order resource by changing URL IDs", () => {
  const owner = makeUser("basic", "active", { _id: "owner-1" });
  const otherUser = makeUser("basic", "active", { _id: "other-1" });
  const seller = makeUser("private_business", "active", { _id: "seller-1" });
  const admin = makeUser("free", "inactive", { _id: "admin-1", role: "admin" });
  const order = {
    user: owner._id,
    storeOwner: seller._id,
  };

  assert.equal(canAccessOrder(order, owner), true);
  assert.equal(canAccessOrder(order, seller), true);
  assert.equal(canAccessOrder(order, admin), true);
  assert.equal(canAccessOrder(order, otherUser), false);
});

test("member-only resources require auth plan access", () => {
  assert.equal(hasRequiredPlan(makeUser("basic"), "basic"), true);
  assert.equal(hasRequiredPlan(makeUser("basic"), "personal"), false);
  assert.equal(hasRequiredPlan(makeUser("personal"), "personal"), true);
  assert.equal(hasRequiredPlan(makeUser("personal"), "private_business"), false);
  assert.equal(hasRequiredPlan(makeUser("private_business"), "private_business"), true);
  assert.equal(hasRequiredPlan(makeUser("personal", "canceled"), "personal"), false);
});

test("member resource downloads enforce plan, status, ID, and format rules", async () => {
  const basicResult = await runDownload(makeUser("basic"), "finansu-aiskumo-starter-kit", "pdf");
  assert.equal(basicResult.fileName, "stilloak-finansu-aiskumo-starter-kit.pdf");
  assert.equal(basicResult.headers["Content-Type"], "application/pdf");
  assert.equal(basicResult.filePath.includes(`${path.sep}server${path.sep}private-resources${path.sep}`), true);

  assert.equal((await runDownload(null, "finansu-aiskumo-starter-kit", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("basic"), "premium-finansiniu-tikslu-sistema", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("basic"), "digital-product-launch-kit", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("personal"), "finansu-aiskumo-starter-kit", "pdf")).fileName, "stilloak-finansu-aiskumo-starter-kit.pdf");
  assert.equal((await runDownload(makeUser("personal"), "premium-finansiniu-tikslu-sistema", "pdf")).fileName, "stilloak-premium-finansiniu-tikslu-sistema.pdf");
  assert.equal((await runDownload(makeUser("personal"), "digital-product-launch-kit", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("private_business"), "digital-product-launch-kit", "pdf")).fileName, "stilloak-digital-product-launch-kit.pdf");
  assert.equal((await runDownload(makeUser("personal", "canceled"), "premium-finansiniu-tikslu-sistema", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("personal", "past_due"), "premium-finansiniu-tikslu-sistema", "pdf")).error.statusCode, 403);
  assert.equal((await runDownload(makeUser("private_business"), "missing-resource", "pdf")).error.statusCode, 404);
  assert.equal((await runDownload(makeUser("private_business"), "digital-product-launch-kit", "zip")).error.statusCode, 404);
  assert.equal((await runDownload(makeUser("private_business"), "digital-product-launch-kit", "xlsx")).error.statusCode, 404);
});

test("guest receives 401 before member resource controller access", async () => {
  const error = await runGuard(protect, null);

  assert.equal(error.statusCode, 401);
});

test("member resource config prevents path traversal and uses private file IDs only", () => {
  assert.equal(getMemberResourceFile("../digital-product-launch-kit", "pdf"), null);
  assert.equal(getMemberResourceFile("digital-product-launch-kit", "../pdf"), null);
  assert.equal(resolvePrivateResourcePath(path.join("..", "..", "client", "public", "favicon.svg")), null);

  for (const resource of Object.values(memberResources)) {
    for (const file of Object.values(resource.files)) {
      assert.equal(path.isAbsolute(file.relativePath), false);
      assert.equal(file.relativePath.includes(".."), false);
      assert.match(file.fileName, /^[\w.-]+\.pdf$/);
    }
  }
});

test("paid digital products stay locked without a paid purchase record", async () => {
  assert.equal(await hasPurchasedProduct(null, "personal-budget-system"), false);
  assert.equal(await hasPurchasedProduct("user-1", ""), false);
});
