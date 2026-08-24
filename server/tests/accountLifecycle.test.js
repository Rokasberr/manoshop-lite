const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  buildEmailVerificationUrl,
  getEmailVerificationDto,
  hashEmailVerificationToken,
  sendVerificationForUser,
  verifyEmailToken,
} = require("../services/emailVerificationService");
const {
  BUSINESS_OWNERSHIP_BLOCK_MESSAGE,
  deleteCurrentUserAccount,
} = require("../services/accountLifecycleService");
const { buildVerificationEmail } = require("../services/emailVerificationEmailService");
const { requireVerifiedEmail } = require("../middleware/authMiddleware");
const {
  validateDeleteAccountInput,
  validateVerifyEmailInput,
} = require("../middleware/authValidation");
const RecurringExpense = require("../models/RecurringExpense");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const Store = require("../models/Store");
const Product = require("../models/Product");
const User = require("../models/User");

const root = path.resolve(__dirname, "..", "..");

const runMiddleware = (middleware, { body = {}, user = null } = {}) =>
  new Promise((resolve) => {
    const req = { body: { ...body }, user, headers: {}, ip: "127.0.0.1" };
    const res = { statusCode: 200, status(code) { this.statusCode = code; return this; } };
    middleware(req, res, (error) => resolve({ error, req, res }));
  });

const withModelStubs = async (stubs, callback) => {
  const originals = [];

  for (const [model, methods] of stubs) {
    for (const [key, value] of Object.entries(methods)) {
      originals.push([model, key, model[key]]);
      model[key] = value;
    }
  }

  try {
    return await callback();
  } finally {
    for (const [model, key, value] of originals.reverse()) {
      model[key] = value;
    }
  }
};

const makeDeletionUser = (overrides = {}) => ({
  _id: { toString: () => "user-delete-1" },
  name: "Ona",
  email: "ona@example.test",
  role: "customer",
  authVersion: 2,
  subscription: { provider: "internal", plan: "personal", status: "active" },
  isDeleted: false,
  comparePassword: async (password) => password === "secret123",
  async save() {
    this.saveCount = Number(this.saveCount || 0) + 1;
    return this;
  },
  ...overrides,
});

const deletionModelStubs = ({ user, storeExists = false, productCount = 0, deleteCalls = [] }) => [
  [
    User,
    {
      findById: () => ({
        select: async () => user,
      }),
    },
  ],
  [Store, { exists: async () => storeExists }],
  [Product.collection, { countDocuments: async () => productCount }],
  [SavingsStudioProfile, { deleteMany: async (query) => deleteCalls.push(["profile", query]) }],
  [SavingsEntry, { deleteMany: async (query) => deleteCalls.push(["entry", query]) }],
  [SavingsBudget, { deleteMany: async (query) => deleteCalls.push(["budget", query]) }],
  [SavingsGoal, { deleteMany: async (query) => deleteCalls.push(["goal", query]) }],
  [RecurringExpense, { deleteMany: async (query) => deleteCalls.push(["recurring", query]) }],
  [SavingsStudioAuditLog, { deleteMany: async (query) => deleteCalls.push(["audit", query]) }],
];

test("email verification creates only hashed one-time token state and safe DTO", async () => {
  process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS = "24";
  process.env.EMAIL_VERIFICATION_BASE_URL = "http://localhost:5174";
  const user = {
    _id: "user-1",
    name: "Ona <Oak>",
    email: "ona@example.test",
    emailVerificationRequired: true,
    async save() {
      this.saveCount = Number(this.saveCount || 0) + 1;
    },
  };
  let sentPayload = null;

  const result = await sendVerificationForUser({
    user,
    now: () => new Date("2026-08-24T10:00:00.000Z"),
    tokenFactory: () => "a".repeat(64),
    emailSender: async (payload) => {
      sentPayload = payload;
      return { sent: true };
    },
  });

  assert.equal(result.sent, true);
  assert.equal(user.saveCount, 1);
  assert.equal(user.emailVerificationTokenHash, hashEmailVerificationToken("a".repeat(64)));
  assert.notEqual(user.emailVerificationTokenHash, "a".repeat(64));
  assert.equal(user.emailVerificationExpiresAt.toISOString(), "2026-08-25T10:00:00.000Z");
  assert.match(sentPayload.verificationUrl, /^http:\/\/localhost:5174\/verify-email\?token=/);
  assert.equal(JSON.stringify(getEmailVerificationDto(user)).includes("Token"), false);
});

test("verification email includes escaped HTML, button text, URL, TTL, and ignore notice", () => {
  const email = buildVerificationEmail({
    verificationUrl: "https://example.test/verify-email?token=secret&x=<tag>",
    userName: "Ona <script>",
    ttlHours: 24,
  });

  assert.match(email.subject, /Stilloak Studio/);
  assert.match(email.html, /Patvirtinti el\. paštą/);
  assert.match(email.html, /Ona &lt;script&gt;/);
  assert.doesNotMatch(email.html, /Ona <script>/);
  assert.match(email.html, /24 val/);
  assert.match(email.text, /ignoruoti/);
  assert.match(email.html, /token=secret/);
});

test("verify email token is atomic: valid succeeds once, reused expired invalid fail safely", async () => {
  const token = "b".repeat(64);
  const tokenHash = hashEmailVerificationToken(token);
  const users = [
    {
      _id: "user-1",
      name: "Ona",
      email: "ona@example.test",
      subscription: { plan: "free", status: "active" },
      role: "customer",
      emailVerificationRequired: true,
      emailVerifiedAt: null,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: new Date("2026-08-25T10:00:00.000Z"),
    },
  ];
  const userModel = {
    async findOneAndUpdate(filter, update) {
      const now = filter.emailVerificationExpiresAt.$gt;
      const user = users.find(
        (entry) =>
          entry.emailVerificationTokenHash === filter.emailVerificationTokenHash &&
          entry.emailVerificationExpiresAt > now &&
          entry.isDeleted !== true &&
          entry.emailVerifiedAt === null
      );

      if (!user) {
        return null;
      }

      Object.assign(user, update.$set);
      return user;
    },
  };

  const result = await verifyEmailToken({
    token,
    userModel,
    now: () => new Date("2026-08-24T10:00:00.000Z"),
  });

  assert.equal(result.user.emailVerifiedAt.toISOString(), "2026-08-24T10:00:00.000Z");
  assert.equal(users[0].emailVerificationTokenHash, "");
  await assert.rejects(
    () => verifyEmailToken({ token, userModel, now: () => new Date("2026-08-24T10:00:01.000Z") }),
    /neteisinga arba pasibaigusi/
  );
  await assert.rejects(
    () => verifyEmailToken({ token: "c".repeat(64), userModel, now: () => new Date("2026-08-26T10:00:00.000Z") }),
    /neteisinga arba pasibaigusi/
  );
});

test("legacy users are treated as verified while new required users are blocked by sensitive guard", async () => {
  assert.equal(getEmailVerificationDto({}).emailVerified, true);
  assert.equal(getEmailVerificationDto({ emailVerificationRequired: false }).emailVerified, true);
  assert.equal(getEmailVerificationDto({ emailVerificationRequired: true, emailVerifiedAt: null }).emailVerified, false);

  const allowed = await runMiddleware(requireVerifiedEmail, {
    user: { _id: "legacy", emailVerificationRequired: false },
  });
  assert.equal(allowed.error, undefined);

  const blocked = await runMiddleware(requireVerifiedEmail, {
    user: { _id: "new", emailVerificationRequired: true, emailVerifiedAt: null },
  });
  assert.equal(blocked.error.statusCode, 403);
});

test("auth lifecycle routes are POST/DELETE, rate limited, user-scoped, and protect sensitive payment actions", () => {
  const authRoutes = fs.readFileSync(path.join(root, "server", "routes", "authRoutes.js"), "utf8");
  const billingRoutes = fs.readFileSync(path.join(root, "server", "routes", "billingRoutes.js"), "utf8");
  const digitalRoutes = fs.readFileSync(path.join(root, "server", "routes", "digitalProductRoutes.js"), "utf8");
  const appSource = fs.readFileSync(path.join(root, "client", "src", "App.jsx"), "utf8");

  assert.match(authRoutes, /router\.post\("\/verify-email"/);
  assert.doesNotMatch(authRoutes, /router\.get\("\/verify-email"/);
  assert.match(authRoutes, /keyPrefix: "auth:resend-verification"/);
  assert.match(authRoutes, /router\.post\("\/resend-verification", protect/);
  assert.match(authRoutes, /router\.get\("\/export-data", protect, requireVerifiedEmail/);
  assert.match(authRoutes, /router\.delete\(\s*"\/account"/);
  assert.match(billingRoutes, /create-payment-session"[\s\S]*requireVerifiedEmail/);
  assert.match(billingRoutes, /sync-stripe-membership"[\s\S]*requireVerifiedEmail/);
  assert.match(digitalRoutes, /"\/checkout", protect, requireVerifiedEmail/);
  assert.match(appSource, /path="\/verify-email"/);
});

test("verification and delete validators reject missing token, missing password, and wrong confirmation text", async () => {
  const missingToken = await runMiddleware(validateVerifyEmailInput, { body: { token: "" } });
  assert.equal(missingToken.error.statusCode, 400);

  const validToken = await runMiddleware(validateVerifyEmailInput, { body: { token: "a".repeat(64) } });
  assert.equal(validToken.error, undefined);

  const missingPassword = await runMiddleware(validateDeleteAccountInput, {
    body: { currentPassword: "", confirmationText: "IŠTRINTI PASKYRĄ" },
  });
  assert.equal(missingPassword.error.statusCode, 400);

  const wrongText = await runMiddleware(validateDeleteAccountInput, {
    body: { currentPassword: "secret123", confirmationText: "delete" },
  });
  assert.equal(wrongText.error.statusCode, 400);
});

test("user data export and account deletion services whitelist data and retain financial records", () => {
  const exportSource = fs.readFileSync(path.join(root, "server", "services", "accountLifecycleService.js"), "utf8");
  const userModel = fs.readFileSync(path.join(root, "server", "models", "User.js"), "utf8");
  const profileSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ProfilePage.jsx"), "utf8");

  assert.match(exportSource, /schemaVersion: "2026-08-account-export-v1"/);
  assert.match(exportSource, /exportGeneratedAt/);
  assert.match(exportSource, /passwordResetTokenHash/);
  assert.doesNotMatch(exportSource, /stripeCustomerId: payment\.stripeCustomerId|stripeSubscriptionId: subscription\.stripeSubscriptionId/);
  assert.match(exportSource, /SavingsEntry\.deleteMany\(\{ user: userId \}/);
  assert.match(exportSource, /SavingsStudioAuditLog\.deleteMany\(\{ user: userId \}/);
  assert.doesNotMatch(exportSource, /Order\.deleteMany|Payment\.deleteMany|Subscription\.deleteMany|DigitalProductPurchase\.deleteMany/);
  assert.match(exportSource, /Store\.exists\(\{ owner: userId \}\)/);
  assert.match(exportSource, /Product\.collection\.countDocuments/);
  assert.match(exportSource, /sellerId/);
  assert.match(exportSource, /Verslo nuosavybes patikros nepavyko/);
  assert.match(exportSource, /BLOCKING_STRIPE_STATUSES/);
  assert.match(exportSource, /getStripeClient\(\)\.subscriptions\.retrieve\(stripeSubscriptionId\)/);
  assert.match(userModel, /isDeleted/);
  assert.match(userModel, /deletedAt/);
  assert.match(profileSource, /Pavojinga zona/);
  assert.match(profileSource, /Atsisiųsti mano duomenis/);
  assert.match(profileSource, /Siųsti patvirtinimo laišką dar kartą/);
  assert.doesNotMatch(profileSource, /window\.confirm/);
});

test("Store owner cannot self-delete account", async () => {
  const user = makeDeletionUser();

  await withModelStubs(deletionModelStubs({ user, storeExists: true }), async () => {
    await assert.rejects(
      () =>
        deleteCurrentUserAccount({
          userId: "user-delete-1",
          currentPassword: "secret123",
          confirmationText: "IŠTRINTI PASKYRĄ",
        }),
      (error) => error.statusCode === 409 && error.message === BUSINESS_OWNERSHIP_BLOCK_MESSAGE
    );
    assert.equal(user.saveCount, undefined);
  });
});

test("Product or future seller-owned business object blocks self-delete fail-closed path", async () => {
  const user = makeDeletionUser();

  await withModelStubs(deletionModelStubs({ user, productCount: 1 }), async () => {
    await assert.rejects(
      () =>
        deleteCurrentUserAccount({
          userId: "user-delete-1",
          currentPassword: "secret123",
          confirmationText: "IŠTRINTI PASKYRĄ",
        }),
      (error) => error.statusCode === 409 && error.message === BUSINESS_OWNERSHIP_BLOCK_MESSAGE
    );
    assert.equal(user.saveCount, undefined);
  });

  await withModelStubs(
    deletionModelStubs({ user }).map(([model, methods]) =>
      model === Product.collection
        ? [model, { countDocuments: async () => { throw new Error("db unavailable"); } }]
        : [model, methods]
    ),
    async () => {
      await assert.rejects(
        () =>
          deleteCurrentUserAccount({
            userId: "user-delete-1",
            currentPassword: "secret123",
            confirmationText: "IŠTRINTI PASKYRĄ",
          }),
        (error) => error.statusCode === 503 && /nepavyko/.test(error.message)
      );
    }
  );
});

test("Personal user without business ownership can self-delete when Stripe does not block", async () => {
  const deleteCalls = [];
  const user = makeDeletionUser();

  await withModelStubs(deletionModelStubs({ user, deleteCalls }), async () => {
    const result = await deleteCurrentUserAccount({
      userId: "user-delete-1",
      currentPassword: "secret123",
      confirmationText: "IŠTRINTI PASKYRĄ",
    });

    assert.match(result.message, /Paskyra istrinta/);
    assert.equal(user.isDeleted, true);
    assert.equal(user.authVersion, 3);
    assert.equal(user.emailVerificationTokenHash, "");
    assert.equal(user.passwordResetTokenHash, "");
    assert.equal(user.subscription.status, "inactive");
    assert.equal(deleteCalls.length, 6);
    assert.equal(deleteCalls.every(([, query]) => query.user === user._id), true);
  });
});

test("verify page does not render or persist token and Profile guards double submit buttons", () => {
  const verifyPage = fs.readFileSync(path.join(root, "client", "src", "pages", "VerifyEmailPage.jsx"), "utf8");
  const profileSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ProfilePage.jsx"), "utf8");
  const authService = fs.readFileSync(path.join(root, "client", "src", "services", "authService.js"), "utf8");

  assert.match(verifyPage, /searchParams\.get\("token"\)/);
  assert.match(verifyPage, /authService\.verifyEmail\(token\)/);
  assert.doesNotMatch(verifyPage, /localStorage/);
  assert.doesNotMatch(verifyPage, /\{token\}/);
  assert.match(profileSource, /if \(resendingVerification\) \{\s*return;/);
  assert.match(profileSource, /if \(exportingData\) \{\s*return;/);
  assert.match(profileSource, /if \(deletingAccount\) \{\s*return;/);
  assert.match(authService, /responseType: "blob"/);
  assert.match(authService, /api\.delete\("\/auth\/account", \{ data: payload \}\)/);
});

test("email verification URL uses configured base and never logs raw token in source", () => {
  process.env.EMAIL_VERIFICATION_BASE_URL = "https://www.stilloak-studio.com";
  const url = buildEmailVerificationUrl("secret-token");
  const serviceSource = fs.readFileSync(path.join(root, "server", "services", "emailVerificationService.js"), "utf8");

  assert.equal(url, "https://www.stilloak-studio.com/verify-email?token=secret-token");
  assert.doesNotMatch(serviceSource, /console\.(log|warn|error)\([^)]*rawToken/);
});
