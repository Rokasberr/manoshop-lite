const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const test = require("node:test");

const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
  PASSWORD_RESET_GENERIC_MESSAGE,
  PASSWORD_RESET_INVALID_MESSAGE,
  hashResetToken,
  requestPasswordReset,
  resetPassword,
} = require("../services/passwordRecoveryService");

class FakeUser {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || fields.id || `user-${Math.random().toString(16).slice(2)}`;
    this.saveCount = 0;
  }

  async save() {
    this.saveCount += 1;

    if (this.password && !this.password.startsWith("$2")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    return this;
  }
}

const matchesQuery = (entry, query) =>
  Object.entries(query).every(([key, value]) => {
    const actual = entry[key];

    if (value && typeof value === "object" && !(value instanceof Date)) {
      if (value.$ne !== undefined) {
        return actual !== value.$ne;
      }

      if (value.$gt !== undefined) {
        return actual instanceof Date && actual.getTime() > value.$gt.getTime();
      }

      return false;
    }

    if (actual instanceof Date && value instanceof Date) {
      return actual.getTime() === value.getTime();
    }

    return actual === value;
  });

const applyUpdate = (entry, update) => {
  for (const [key, value] of Object.entries(update.$set || {})) {
    entry[key] = value;
  }

  for (const [key, value] of Object.entries(update.$inc || {})) {
    entry[key] = Number(entry[key] || 0) + value;
  }
};

const makeUserModel = (users) => ({
  findOne(query) {
    const user =
      query.email !== undefined
        ? users.find((entry) => entry.email === query.email)
        : users.find((entry) => entry.passwordResetTokenHash === query.passwordResetTokenHash);

    return {
      async select() {
        return user || null;
      },
    };
  },
  async updateOne(query, update) {
    const user = users.find((entry) => matchesQuery(entry, query));

    if (!user) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    applyUpdate(user, update);
    return { matchedCount: 1, modifiedCount: 1 };
  },
  async findOneAndUpdate(query, update) {
    const user = users.find((entry) => matchesQuery(entry, query));

    if (!user) {
      return null;
    }

    applyUpdate(user, update);
    return user;
  },
});

test("forgot password returns the same generic response for present and absent accounts", async () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
  });
  const userModel = makeUserModel([user]);
  const emailCalls = [];

  const present = await requestPasswordReset({
    email: " OWNER@example.com ",
    userModel,
    now: () => now,
    tokenFactory: () => "a".repeat(64),
    emailSender: async (payload) => emailCalls.push(payload),
    logger: { warn() {} },
  });
  const absent = await requestPasswordReset({
    email: "missing@example.com",
    userModel,
    now: () => now,
    emailSender: async (payload) => emailCalls.push(payload),
    logger: { warn() {} },
  });

  assert.equal(present.message, PASSWORD_RESET_GENERIC_MESSAGE);
  assert.equal(absent.message, PASSWORD_RESET_GENERIC_MESSAGE);
  assert.equal(present.emailSent, true);
  assert.equal(absent.emailSent, false);
  assert.equal(emailCalls.length, 1);
});

test("forgot password stores only a hashed one-time token with a short expiry", async () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const rawToken = "b".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
  });
  const emailCalls = [];

  await requestPasswordReset({
    email: "owner@example.com",
    userModel: makeUserModel([user]),
    now: () => now,
    tokenFactory: () => rawToken,
    emailSender: async (payload) => emailCalls.push(payload),
    logger: { warn() {} },
  });

  assert.equal(user.passwordResetTokenHash, hashResetToken(rawToken));
  assert.notEqual(user.passwordResetTokenHash, rawToken);
  assert.match(user.passwordResetTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(user.passwordResetExpiresAt.getTime(), now.getTime() + 15 * 60_000);
  assert.match(emailCalls[0].resetUrl, /\/reset-password\?token=/);
  assert.match(emailCalls[0].resetUrl, new RegExp(rawToken));
});

test("forgot password clears the current token when delivery fails", async () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const rawToken = "f".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
  });
  const logs = [];

  const result = await requestPasswordReset({
    email: "owner@example.com",
    userModel: makeUserModel([user]),
    now: () => now,
    tokenFactory: () => rawToken,
    emailSender: async () => {
      const error = new Error("smtp outage for owner@example.com with reset-url-secret");
      error.code = "ETIMEDOUT";
      throw error;
    },
    logger: {
      error(message, meta) {
        logs.push({ message, meta });
      },
    },
  });

  assert.equal(result.message, PASSWORD_RESET_GENERIC_MESSAGE);
  assert.equal(result.emailSent, false);
  assert.equal(user.passwordResetTokenHash, "");
  assert.equal(user.passwordResetExpiresAt, null);
  assert.equal(logs.length, 1);
  assert.equal(logs[0].meta.reason, "ETIMEDOUT");
  assert.doesNotMatch(JSON.stringify(logs[0]), /owner@example\.com|reset-url-secret|f{16}/);
});

test("older password reset delivery failure cannot clear a newer token", async () => {
  const firstNow = new Date("2026-08-13T10:00:00.000Z");
  const secondNow = new Date("2026-08-13T10:01:00.000Z");
  const firstToken = "1".repeat(64);
  const secondToken = "2".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
  });
  const userModel = makeUserModel([user]);
  let releaseFirstSendFailure;
  let markFirstSendStarted;
  const firstSendCanFail = new Promise((resolve) => {
    releaseFirstSendFailure = resolve;
  });
  const firstSendStarted = new Promise((resolve) => {
    markFirstSendStarted = resolve;
  });

  const firstRequest = requestPasswordReset({
    email: "owner@example.com",
    userModel,
    now: () => firstNow,
    tokenFactory: () => firstToken,
    emailSender: async () => {
      markFirstSendStarted();
      await firstSendCanFail;
      throw Object.assign(new Error("smtp down"), { code: "ETIMEDOUT" });
    },
    logger: { error() {} },
  });

  await firstSendStarted;

  const secondRequest = await requestPasswordReset({
    email: "owner@example.com",
    userModel,
    now: () => secondNow,
    tokenFactory: () => secondToken,
    emailSender: async () => ({ sent: true, provider: "test" }),
    logger: { error() {} },
  });

  releaseFirstSendFailure();
  const firstResult = await firstRequest;

  assert.equal(firstResult.emailSent, false);
  assert.equal(secondRequest.emailSent, true);
  assert.equal(user.passwordResetTokenHash, hashResetToken(secondToken));
  assert.equal(user.passwordResetExpiresAt.getTime(), secondNow.getTime() + 15 * 60_000);
});

test("password reset delivery skipped result clears the current token", async () => {
  const now = new Date("2026-08-13T10:00:00.000Z");
  const rawToken = "3".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
  });

  const result = await requestPasswordReset({
    email: "owner@example.com",
    userModel: makeUserModel([user]),
    now: () => now,
    tokenFactory: () => rawToken,
    emailSender: async () => ({ sent: false, skipped: true, reason: "email-not-configured" }),
    logger: { error() {} },
  });

  assert.equal(result.emailSent, false);
  assert.equal(user.passwordResetTokenHash, "");
  assert.equal(user.passwordResetExpiresAt, null);
});

test("reset password rejects invalid, expired, and reused tokens", async () => {
  await assert.rejects(
    () => resetPassword({ token: "short", password: "NewPassword123" }),
    (error) => error.statusCode === 400 && error.message === PASSWORD_RESET_INVALID_MESSAGE
  );

  const expiredToken = "c".repeat(64);
  const expiredUser = new FakeUser({
    email: "owner@example.com",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
    passwordResetTokenHash: hashResetToken(expiredToken),
    passwordResetExpiresAt: new Date("2026-08-13T09:59:00.000Z"),
  });

  await assert.rejects(
    () =>
      resetPassword({
        token: expiredToken,
        password: "NewPassword123",
        userModel: makeUserModel([expiredUser]),
        now: () => new Date("2026-08-13T10:00:00.000Z"),
      }),
    (error) => error.statusCode === 400 && error.message === PASSWORD_RESET_INVALID_MESSAGE
  );
  assert.equal(expiredUser.passwordResetTokenHash, hashResetToken(expiredToken));
  assert.equal(expiredUser.passwordResetExpiresAt.getTime(), new Date("2026-08-13T09:59:00.000Z").getTime());

  const reusedToken = "d".repeat(64);
  const reusedUser = new FakeUser({
    email: "owner@example.com",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
    passwordResetTokenHash: hashResetToken(reusedToken),
    passwordResetExpiresAt: new Date("2026-08-13T10:10:00.000Z"),
  });
  const userModel = makeUserModel([reusedUser]);

  await resetPassword({
    token: reusedToken,
    password: "NewPassword123",
    userModel,
    now: () => new Date("2026-08-13T10:00:00.000Z"),
  });

  await assert.rejects(
    () =>
      resetPassword({
        token: reusedToken,
        password: "AnotherPassword123",
        userModel,
        now: () => new Date("2026-08-13T10:01:00.000Z"),
      }),
    (error) => error.statusCode === 400 && error.message === PASSWORD_RESET_INVALID_MESSAGE
  );
});

test("concurrent password resets with the same token allow only one success", async () => {
  const token = "9".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
    passwordResetTokenHash: hashResetToken(token),
    passwordResetExpiresAt: new Date("2026-08-13T10:10:00.000Z"),
  });
  const userModel = makeUserModel([user]);
  const attempts = await Promise.allSettled([
    resetPassword({
      token,
      password: "NewPassword123",
      userModel,
      now: () => new Date("2026-08-13T10:00:00.000Z"),
    }),
    resetPassword({
      token,
      password: "AnotherPassword123",
      userModel,
      now: () => new Date("2026-08-13T10:00:00.000Z"),
    }),
  ]);
  const fulfilled = attempts.filter((entry) => entry.status === "fulfilled");
  const rejected = attempts.filter((entry) => entry.status === "rejected");

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.statusCode, 400);
  assert.equal(rejected[0].reason.message, PASSWORD_RESET_INVALID_MESSAGE);
  assert.equal(user.passwordResetTokenHash, "");
  assert.equal(user.passwordResetExpiresAt, null);
});

test("reset password changes only auth secret state and increments auth version", async () => {
  const token = "e".repeat(64);
  const user = new FakeUser({
    email: "owner@example.com",
    name: "Owner",
    role: "admin",
    subscription: { plan: "private_business", status: "active" },
    password: "$2a$10$alreadyHashedPasswordValue123456789012345678901234567890",
    passwordResetTokenHash: hashResetToken(token),
    passwordResetExpiresAt: new Date("2026-08-13T10:10:00.000Z"),
    authVersion: 4,
  });

  const result = await resetPassword({
    token,
    password: "NewPassword123",
    userModel: makeUserModel([user]),
    now: () => new Date("2026-08-13T10:00:00.000Z"),
  });

  assert.equal(result.message, "Slaptažodis atnaujintas. Dabar gali prisijungti.");
  assert.equal(await bcrypt.compare("NewPassword123", user.password), true);
  assert.equal(user.passwordResetTokenHash, "");
  assert.equal(user.passwordResetExpiresAt, null);
  assert.equal(user.authVersion, 5);
  assert.equal(user.passwordChangedAt.getTime(), new Date("2026-08-13T10:00:00.000Z").getTime());
  assert.equal(user.role, "admin");
  assert.deepEqual(user.subscription, { plan: "private_business", status: "active" });
});

test("password recovery limiter blocks repeated attempts in the same window", async () => {
  const limiter = createWindowRateLimiter({
    keyPrefix: `test-password-recovery-${Date.now()}`,
    max: 2,
    windowMs: 60_000,
    message: "limited",
  });
  const run = () =>
    new Promise((resolve) => {
      const req = { ip: "127.0.0.2", headers: {} };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
        },
      };
      limiter(req, res, (error) => resolve({ error, res }));
    });

  assert.equal((await run()).error, undefined);
  assert.equal((await run()).error, undefined);
  const blocked = await run();
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.error.message, "limited");
});
