const assert = require("node:assert/strict");
const test = require("node:test");

const { adminOnly, hasActiveMembership, memberOnly } = require("../middleware/authMiddleware");

const runGuard = (middleware, user) =>
  new Promise((resolve) => {
    const req = { user };
    middleware(req, {}, (error) => resolve(error));
  });

test("adminOnly allows admins and rejects customers", async () => {
  assert.equal(await runGuard(adminOnly, { role: "admin" }), undefined);
  assert.equal(await runGuard(adminOnly, { role: "Admin" }), undefined);
  assert.equal(await runGuard(adminOnly, { role: "customer", isAdmin: true }), undefined);

  const error = await runGuard(adminOnly, { role: "customer" });
  assert.equal(error.statusCode, 403);
});

test("memberOnly requires a known active or trialing membership plan", async () => {
  assert.equal(
    hasActiveMembership({
      role: "customer",
      subscription: { plan: "personal", status: "active" },
    }),
    true
  );
  assert.equal(
    hasActiveMembership({
      role: "Admin",
      subscription: { plan: "free", status: "inactive" },
    }),
    true
  );
  assert.equal(
    hasActiveMembership({
      role: "customer",
      subscription: { plan: "personal", status: "past_due" },
    }),
    false
  );
  assert.equal(
    hasActiveMembership({
      role: "customer",
      subscription: { plan: "circle", status: "active" },
    }),
    false
  );

  const error = await runGuard(memberOnly, {
    role: "customer",
    subscription: { plan: "free", status: "active" },
  });
  assert.equal(error.statusCode, 403);
});
