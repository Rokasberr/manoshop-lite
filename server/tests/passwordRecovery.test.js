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
  assert.equal(expiredUser.passwordResetTokenHash, "");
  assert.equal(expiredUser.passwordResetExpiresAt, null);

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
