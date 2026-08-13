const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

test("owner recovery CLI rejects password arguments and requires email confirmation", () => {
  const source = fs.readFileSync(path.join(root, "scripts", "recover-owner-password.js"), "utf8");

  assert.match(source, /Password arguments are not supported/);
  assert.match(source, /--target-email/);
  assert.match(source, /--confirm-email/);
  assert.match(source, /confirmEmail !== targetEmail/);
  assert.match(source, /readHiddenLine\("New password: "\)/);
  assert.doesNotMatch(source, /args\["password"\]/);
  assert.doesNotMatch(source, /args\.password/);
});

test("owner recovery CLI refuses ambiguous database targets and preserves non-password fields", () => {
  const source = fs.readFileSync(path.join(root, "scripts", "recover-owner-password.js"), "utf8");

  assert.match(source, /Selected MongoDB database/);
  assert.match(source, /MONGO_DB_NAME and MONGO_URI path do not match/);
  assert.match(source, /set MONGO_DB_NAME or include a database name in MONGO_URI/);
  assert.match(source, /user\.password = newPassword/);
  assert.match(source, /user\.authVersion = Number\(user\.authVersion \|\| 0\) \+ 1/);
  assert.doesNotMatch(source, /user\.role =/);
  assert.doesNotMatch(source, /user\.subscription =/);
});
