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

test("client exposes public password recovery routes and login link", () => {
  const appSource = fs.readFileSync(path.join(root, "client", "src", "App.jsx"), "utf8");
  const loginSource = fs.readFileSync(path.join(root, "client", "src", "pages", "LoginPage.jsx"), "utf8");
  const forgotSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ForgotPasswordPage.jsx"), "utf8");
  const resetSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ResetPasswordPage.jsx"), "utf8");
  const authServiceSource = fs.readFileSync(path.join(root, "client", "src", "services", "authService.js"), "utf8");

  assert.match(appSource, /path="\/forgot-password" element=\{<ForgotPasswordPage \/>}/);
  assert.match(appSource, /path="\/reset-password" element=\{<ResetPasswordPage \/>}/);
  assert.match(loginSource, /to="\/forgot-password"/);
  assert.match(loginSource, /copy\.forgotPassword/);
  assert.match(forgotSource, /authService\.forgotPassword/);
  assert.match(resetSource, /authService\.resetPassword/);
  assert.match(authServiceSource, /\/auth\/forgot-password/);
  assert.match(authServiceSource, /\/auth\/reset-password/);
});

test("client clears stale auth state on API 401 responses", () => {
  const apiSource = fs.readFileSync(path.join(root, "client", "src", "services", "api.js"), "utf8");
  const authContextSource = fs.readFileSync(path.join(root, "client", "src", "context", "AuthContext.jsx"), "utf8");

  assert.match(apiSource, /error\.response\?\.status === 401/);
  assert.match(apiSource, /manoshop:auth-expired/);
  assert.match(authContextSource, /addEventListener\("manoshop:auth-expired"/);
});

test("client layout keeps keyboard skip link to main content", () => {
  const layoutSource = fs.readFileSync(path.join(root, "client", "src", "components", "Layout.jsx"), "utf8");

  assert.match(layoutSource, /href="#main-content"/);
  assert.match(layoutSource, /focus:not-sr-only/);
  assert.match(layoutSource, /<main id="main-content"/);
});

test("Profile page exposes Stripe Portal and subscription invoice UI safely", () => {
  const profileSource = fs.readFileSync(path.join(root, "client", "src", "pages", "ProfilePage.jsx"), "utf8");
  const billingServiceSource = fs.readFileSync(path.join(root, "client", "src", "services", "billingService.js"), "utf8");

  assert.match(profileSource, /Valdyti prenumeratą ir sąskaitas/);
  assert.match(profileSource, /Sutvarkyti mokėjimą/);
  assert.match(profileSource, /Prenumeratos mokėjimai/);
  assert.match(profileSource, /Sąskaitų santrauka/);
  assert.match(profileSource, /openingPortal/);
  assert.match(profileSource, /if \(openingPortal\) \{/);
  assert.match(profileSource, /w-full max-w-full justify-center gap-2 whitespace-normal/);
  assert.match(profileSource, /Kortelės, plano ir pilnų sąskaitų valdymas vyksta per Stripe Customer Portal/);
  assert.doesNotMatch(profileSource, /backendRole}: \{normalizedRole}/);
  assert.match(billingServiceSource, /post\("\/billing\/create-portal-session"\)/);
  assert.match(billingServiceSource, /get\("\/billing\/subscription-invoices"\)/);
});

test("Billing success handles missing Stripe session ID without endless sync", () => {
  const successSource = fs.readFileSync(path.join(root, "client", "src", "pages", "BillingSuccessPage.jsx"), "utf8");

  assert.match(successSource, /if \(!sessionId\) \{/);
  assert.match(successSource, /Trūksta Stripe sesijos patvirtinimo/);
  assert.match(successSource, /attempts < 4/);
  assert.match(successSource, /cancelled = true/);
});
