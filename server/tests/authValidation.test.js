const assert = require("node:assert/strict");
const test = require("node:test");

const {
  validateLoginInput,
  validateRegisterInput,
} = require("../middleware/authValidation");

const runMiddleware = (middleware, body) =>
  new Promise((resolve) => {
    const req = { body: { ...body } };
    middleware(req, {}, (error) => resolve({ error, req }));
  });

test("register validation normalizes safe input", async () => {
  const result = await runMiddleware(validateRegisterInput, {
    name: "  Ona Oak  ",
    email: "  ONA@example.COM ",
    password: "secret123",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.req.body.name, "Ona Oak");
  assert.equal(result.req.body.email, "ona@example.com");
});

test("register validation rejects weak passwords", async () => {
  const result = await runMiddleware(validateRegisterInput, {
    name: "Ona Oak",
    email: "ona@example.com",
    password: "123",
  });

  assert.equal(result.error.statusCode, 400);
});

test("login validation rejects malformed email", async () => {
  const result = await runMiddleware(validateLoginInput, {
    email: "not-an-email",
    password: "secret123",
  });

  assert.equal(result.error.statusCode, 400);
});
