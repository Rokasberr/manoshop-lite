const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const {
  changeUserPassword,
  formatAuthResponse,
  formatProfileResponse,
  loginUser,
  logoutUser,
  registerUser,
  signToken,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateChangePasswordInput,
  validateRegisterInput,
} = require("../middleware/authValidation");
const { createWindowRateLimiter } = require("../middleware/rateLimit");

const root = path.resolve(__dirname, "..", "..");

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const runMiddleware = (middleware, body) =>
  new Promise((resolve) => {
    const req = { body: { ...body } };
    middleware(req, {}, (error) => resolve({ error, req }));
  });

const withUserStubs = async (stubs, callback) => {
  const originals = {};

  for (const [key, value] of Object.entries(stubs)) {
    originals[key] = User[key];
    User[key] = value;
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      User[key] = value;
    }
  }
};

test("registration validation trims name, lowercases email, enforces password bounds, and ignores privileged fields", async () => {
  const result = await runMiddleware(validateRegisterInput, {
    name: "  Ona Oak  ",
    email: "  ONA@example.COM ",
    password: "a".repeat(128),
    role: "admin",
    isAdmin: true,
    subscription: { plan: "private_business" },
    stripeCustomerId: "cus_secret",
    authVersion: 99,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.req.body.name, "Ona Oak");
  assert.equal(result.req.body.email, "ona@example.com");
  assert.equal(result.req.body.role, "admin");

  const tooLong = await runMiddleware(validateRegisterInput, {
    name: "Ona Oak",
    email: "ona@example.com",
    password: "a".repeat(129),
  });
  assert.equal(tooLong.error.statusCode, 400);
});

test("register assigns server role, returns safe DTO, and converts duplicate email races to 409", async () => {
  await withUserStubs(
    {
      findOne: async () => null,
      create: async (payload) => ({
        _id: "user-1",
        ...payload,
        password: "$2a$hash",
        passwordResetTokenHash: "reset",
        passwordResetExpiresAt: new Date(),
        subscription: {
          plan: "personal",
          status: "active",
          stripeCustomerId: "cus_internal",
          stripeSubscriptionId: "sub_internal",
          stripePriceId: "price_internal",
        },
        authVersion: 0,
      }),
    },
    async () => {
      process.env.JWT_SECRET = "test-secret";
      const req = {
        body: {
          name: "Ona",
          email: "ona@example.com",
          password: "secret123",
          role: "admin",
          subscription: { plan: "private_business" },
        },
      };
      const res = makeResponse();

      await registerUser(req, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.user.role, "customer");
      assert.equal(res.body.user.password, undefined);
      assert.equal(res.body.user.passwordResetTokenHash, undefined);
      assert.equal(res.body.user.subscription.stripeCustomerId, undefined);

      const decoded = jwt.verify(res.body.token, "test-secret");
      assert.deepEqual(Object.keys(decoded).sort(), ["authVersion", "exp", "iat", "id", "role"].sort());
      assert.equal(decoded.email, undefined);
      assert.equal(decoded.subscription, undefined);
    }
  );

  await withUserStubs(
    {
      findOne: async () => null,
      create: async () => {
        const error = new Error("E11000 duplicate key error collection users");
        error.code = 11000;
        throw error;
      },
    },
    async () => {
      await assert.rejects(
        () => registerUser({ body: { name: "Ona", email: "ona@example.com", password: "secret123" } }, makeResponse()),
        (error) => error.statusCode === 409 && !/E11000|collection/.test(error.message)
      );
    }
  );
});

test("login uses one safe failure for missing and wrong-password users and returns a safe DTO", async () => {
  await withUserStubs(
    {
      findOne: async () => null,
    },
    async () => {
      await assert.rejects(
        () => loginUser({ body: { email: "missing@example.com", password: "secret123" } }, makeResponse()),
        (error) => error.statusCode === 401 && error.message === "Neteisingi prisijungimo duomenys."
      );
    }
  );

  await withUserStubs(
    {
      findOne: async () => ({
        comparePassword: async () => false,
      }),
    },
    async () => {
      await assert.rejects(
        () => loginUser({ body: { email: "ona@example.com", password: "bad" } }, makeResponse()),
        (error) => error.statusCode === 401 && error.message === "Neteisingi prisijungimo duomenys."
      );
    }
  );

  const dto = formatAuthResponse({
    _id: "user-1",
    name: "Ona",
    email: "ona@example.com",
    password: "$2a$hash",
    role: "customer",
    subscription: { plan: "personal", status: "active", stripeCustomerId: "cus_internal" },
  });

  assert.equal(dto.user.password, undefined);
  assert.equal(dto.user.subscription.stripeCustomerId, undefined);
});

test("JWT protect accepts valid tokens and rejects expired, corrupt, missing-user, and authVersion-mismatch tokens", async () => {
  process.env.JWT_SECRET = "middleware-secret";
  const dbUser = { _id: "user-1", role: "customer", authVersion: 2 };
  const runProtect = (token, user = dbUser) =>
    withUserStubs(
      {
        findById: () => ({
          select: async () => user,
        }),
      },
      () =>
        new Promise((resolve) => {
          const req = { headers: { authorization: `Bearer ${token}` }, body: { role: "admin" } };
          protect(req, {}, (error) => resolve({ error, req }));
        })
    );

  const validToken = jwt.sign({ id: "user-1", role: "admin", authVersion: 2 }, "middleware-secret", {
    expiresIn: "1h",
  });
  const valid = await runProtect(validToken);
  assert.equal(valid.error, undefined);
  assert.equal(valid.req.user, dbUser);
  assert.equal(valid.req.userRole, "customer");

  const expiredToken = jwt.sign({ id: "user-1", role: "customer", authVersion: 2 }, "middleware-secret", {
    expiresIn: "-1s",
  });
  assert.equal((await runProtect(expiredToken)).error.statusCode, 401);
  assert.equal((await runProtect("not-a-jwt")).error.statusCode, 401);
  assert.equal((await runProtect(validToken, null)).error.statusCode, 401);

  const mismatchToken = jwt.sign({ id: "user-1", role: "customer", authVersion: 1 }, "middleware-secret", {
    expiresIn: "1h",
  });
  assert.equal((await runProtect(mismatchToken)).error.statusCode, 401);
});

test("profile DTO excludes password, reset tokens, and internal Stripe identifiers", () => {
  const dto = formatProfileResponse({
    _id: "user-1",
    name: "Ona",
    email: "ona@example.com",
    password: "$2a$hash",
    passwordResetTokenHash: "reset",
    role: "customer",
    subscription: {
      plan: "personal",
      status: "active",
      stripeCustomerId: "cus_internal",
      stripeSubscriptionId: "sub_internal",
      stripePriceId: "price_internal",
    },
  });

  assert.equal(dto.password, undefined);
  assert.equal(dto.passwordResetTokenHash, undefined);
  assert.equal(dto.subscription.stripeCustomerId, undefined);
  assert.equal(dto.subscription.stripeSubscriptionId, undefined);
  assert.equal(dto.subscription.stripePriceId, undefined);
});

test("logout updates only req.user._id and invalidates old authVersion tokens", async () => {
  const updates = [];

  await withUserStubs(
    {
      updateOne: async (filter, update) => {
        updates.push({ filter, update });
        return { matchedCount: 1, modifiedCount: 1 };
      },
    },
    async () => {
      const res = makeResponse();
      await logoutUser({ user: { _id: "user-1" }, body: { _id: "attacker" } }, res);
      assert.deepEqual(updates[0], {
        filter: { _id: "user-1" },
        update: { $inc: { authVersion: 1 } },
      });
      assert.match(res.body.message, /visų aktyvių sesijų/);
    }
  );
});

test("change password requires current password, validates bounds, clears reset tokens, and preserves role/subscription", async () => {
  const validation = await runMiddleware(validateChangePasswordInput, {
    currentPassword: "",
    newPassword: "secret123",
  });
  assert.equal(validation.error.statusCode, 400);

  const tooLong = await runMiddleware(validateChangePasswordInput, {
    currentPassword: "oldsecret",
    newPassword: "a".repeat(129),
  });
  assert.equal(tooLong.error.statusCode, 400);

  const user = {
    _id: "user-1",
    role: "admin",
    subscription: { plan: "private_business", status: "active" },
    authVersion: 4,
    passwordResetTokenHash: "reset",
    passwordResetExpiresAt: new Date(),
    comparePassword: async (password) => password === "oldsecret",
    async save() {
      this.saveCount = Number(this.saveCount || 0) + 1;
    },
  };

  await withUserStubs(
    {
      findById: (id) => ({
        select: async (projection) => {
          assert.equal(id, "user-1");
          assert.match(projection, /\+password/);
          return user;
        },
      }),
    },
    async () => {
      const res = makeResponse();
      await changeUserPassword(
        {
          user: { _id: "user-1" },
          body: { currentPassword: "oldsecret", newPassword: "newsecret" },
        },
        res
      );

      assert.equal(user.password, "newsecret");
      assert.equal(user.passwordResetTokenHash, "");
      assert.equal(user.passwordResetExpiresAt, null);
      assert.equal(user.authVersion, 5);
      assert.equal(user.saveCount, 1);
      assert.equal(user.role, "admin");
      assert.deepEqual(user.subscription, { plan: "private_business", status: "active" });
      assert.equal(res.body.token, undefined);
    }
  );
});

test("auth rate limiters exist for register, login, password reset, and change password without real waiting", async () => {
  const routeSource = fs.readFileSync(path.join(root, "server", "routes", "authRoutes.js"), "utf8");

  assert.match(routeSource, /const registerLimiter = createWindowRateLimiter\(\{/);
  assert.match(routeSource, /keyPrefix: "auth:register"/);
  assert.match(routeSource, /const loginLimiter = createWindowRateLimiter\(\{/);
  assert.match(routeSource, /keyPrefix: "auth:login"/);
  assert.match(routeSource, /keyPrefix: "auth:change-password"/);

  const limiter = createWindowRateLimiter({
    keyPrefix: `test-auth-security-${Date.now()}`,
    max: 1,
    windowMs: 60_000,
    message: "limited",
  });
  const run = () =>
    new Promise((resolve) => {
      const req = { ip: "127.0.0.9", headers: {} };
      const res = { statusCode: 200, status(code) { this.statusCode = code; } };
      limiter(req, res, (error) => resolve({ error, res }));
    });

  assert.equal((await run()).error, undefined);
  const blocked = await run();
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.error.message, "limited");
});

test("client auth behavior cleans 401 state, uses server logout, guards double submit, and keeps redirects internal", () => {
  const authServiceSource = fs.readFileSync(path.join(root, "client", "src", "services", "authService.js"), "utf8");
  const authContextSource = fs.readFileSync(path.join(root, "client", "src", "context", "AuthContext.jsx"), "utf8");
  const loginSource = fs.readFileSync(path.join(root, "client", "src", "pages", "LoginPage.jsx"), "utf8");
  const registerSource = fs.readFileSync(path.join(root, "client", "src", "pages", "RegisterPage.jsx"), "utf8");
  const profileSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ProfilePage.jsx"), "utf8");

  assert.match(authServiceSource, /api\.post\("\/auth\/logout"\)/);
  assert.match(authServiceSource, /api\.post\("\/auth\/change-password"/);
  assert.doesNotMatch(authServiceSource, /api\.post\("\/login"|api\.post\("\/register"|api\.get\("\/profile"/);
  assert.match(authContextSource, /finally \{\s*clearAuthState\(\);/);
  assert.match(authContextSource, /manoshop:auth-expired/);
  assert.match(loginSource, /isSafeInternalRedirect/);
  assert.match(loginSource, /!value\.startsWith\("\/\/"\)/);
  assert.match(loginSource, /if \(loading\) \{\s*return;/);
  assert.match(registerSource, /if \(loading\) \{\s*return;/);
  assert.match(profileSource, /if \(changingPassword\) \{\s*return;/);
  assert.match(profileSource, /logout\(\{ skipServer: true \}\)/);
  assert.match(profileSource, /navigate\("\/login", \{ replace: true, state: \{ message \} \}\)/);
});

test("auth forms expose labels, names, autocomplete, required fields, and alert live regions", () => {
  const files = [
    "LoginPage.jsx",
    "RegisterPage.jsx",
    "ForgotPasswordPage.jsx",
    "ResetPasswordPage.jsx",
    "ProfilePage.jsx",
  ];

  for (const file of files) {
    const source = fs.readFileSync(path.join(root, "client", "src", "pages", file), "utf8");
    assert.match(source, /htmlFor=/, file);
    assert.match(source, /name=/, file);
    assert.match(source, /required/, file);
    assert.match(source, /autoComplete=/, file);
    assert.match(source, /role="alert"|aria-live="polite"/, file);
  }

  const profileSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ProfilePage.jsx"), "utf8");
  assert.match(profileSource, /autoComplete="current-password"/);
  assert.match(profileSource, /autoComplete="new-password"/);
  assert.match(profileSource, /max-w-full/);
});

