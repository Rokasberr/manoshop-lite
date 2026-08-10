const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

test("client protected routes require membership, business, and admin gates", () => {
  const appSource = fs.readFileSync(path.join(root, "client", "src", "App.jsx"), "utf8");

  assert.match(appSource, /<ProtectedRoute requireMembership \/>[\s\S]*path="\/members\/savings-studio"/);
  assert.match(appSource, /<ProtectedRoute requireBusinessPlan \/>[\s\S]*path="\/business"/);
  assert.match(appSource, /<ProtectedRoute requireAdmin \/>[\s\S]*path="\/admin"/);
});

test("client redirects guests back to the original protected URL after login", () => {
  const protectedRouteSource = fs.readFileSync(
    path.join(root, "client", "src", "components", "ProtectedRoute.jsx"),
    "utf8"
  );
  const loginSource = fs.readFileSync(path.join(root, "client", "src", "pages", "LoginPage.jsx"), "utf8");

  assert.match(protectedRouteSource, /state=\{\{ from: `\$\{location\.pathname\}\$\{location\.search\}` \}\}/);
  assert.match(loginSource, /navigate\(location\.state\.from, \{ replace: true \}\)/);
});

test("client clears stale auth state on API 401 responses", () => {
  const apiSource = fs.readFileSync(path.join(root, "client", "src", "services", "api.js"), "utf8");
  const authContextSource = fs.readFileSync(path.join(root, "client", "src", "context", "AuthContext.jsx"), "utf8");

  assert.match(apiSource, /error\.response\?\.status === 401/);
  assert.match(apiSource, /manoshop:auth-expired/);
  assert.match(authContextSource, /addEventListener\("manoshop:auth-expired"/);
});
