const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { buildWebServiceEmail } = require("../services/webServiceEmailTemplate");
const { isDatabaseBackupConfigured } = require("../services/databaseBackupService");

const readRepoFile = (...parts) => fs.readFileSync(path.resolve(__dirname, "..", "..", ...parts), "utf8");

test("Web service email template has branding, support contact and escaped customer content", () => {
  const email = buildWebServiceEmail({ subject: "Testas", name: "<Testas>", title: "Pasiūlymas", intro: "Paruošta", rows: [{ label: "Suma", value: "10 €" }] });
  assert.match(email.html, /stilloak-logo\.svg/);
  assert.match(email.html, /hello@stilloak-studio\.com/);
  assert.match(email.html, /&lt;Testas&gt;/);
  assert.doesNotMatch(email.html, /Sveiki, <Testas>/);
});

test("database backup fails closed without HTTPS destination and a 32-byte key", () => {
  const previousUrl = process.env.DATABASE_BACKUP_UPLOAD_URL;
  const previousKey = process.env.DATABASE_BACKUP_ENCRYPTION_KEY;
  const previousToken = process.env.DATABASE_BACKUP_UPLOAD_TOKEN;
  process.env.DATABASE_BACKUP_UPLOAD_URL = "http://unsafe.example.test";
  process.env.DATABASE_BACKUP_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");
  process.env.DATABASE_BACKUP_UPLOAD_TOKEN = "test-upload-token";
  assert.equal(isDatabaseBackupConfigured(), false);
  process.env.DATABASE_BACKUP_UPLOAD_URL = "https://backup.example.test/upload";
  assert.equal(isDatabaseBackupConfigured(), true);
  process.env.DATABASE_BACKUP_ENCRYPTION_KEY = "too-short";
  assert.equal(isDatabaseBackupConfigured(), false);
  if (previousUrl === undefined) delete process.env.DATABASE_BACKUP_UPLOAD_URL;
  else process.env.DATABASE_BACKUP_UPLOAD_URL = previousUrl;
  if (previousKey === undefined) delete process.env.DATABASE_BACKUP_ENCRYPTION_KEY;
  else process.env.DATABASE_BACKUP_ENCRYPTION_KEY = previousKey;
  if (previousToken === undefined) delete process.env.DATABASE_BACKUP_UPLOAD_TOKEN;
  else process.env.DATABASE_BACKUP_UPLOAD_TOKEN = previousToken;
});

test("operations routes, encrypted backups, error alerts and legal pages stay wired", () => {
  const routes = readRepoFile("server", "routes", "adminRoutes.js");
  const backup = readRepoFile("server", "services", "databaseBackupService.js");
  const errors = readRepoFile("server", "middleware", "errorMiddleware.js");
  const legal = readRepoFile("client", "src", "content", "infoPages.js");
  const proposal = readRepoFile("web-services", "src", "ProposalPage.tsx");
  assert.match(routes, /\/operations\/backup/);
  assert.match(backup, /aes-256-gcm/);
  assert.match(backup, /DATABASE_BACKUP_UPLOAD_URL/);
  assert.match(errors, /recordOperationalEvent/);
  assert.match(legal, /webServicesPrivacy/);
  assert.match(legal, /webServicesTerms/);
  assert.match(legal, /webServicesRefunds/);
  assert.match(proposal, /web-services-terms/);
});

test("both public sites keep their section and contact navigation wired", () => {
  const navbar = readRepoFile("client", "src", "components", "Navbar.jsx");
  const layout = readRepoFile("client", "src", "components", "Layout.jsx");
  const navigationEffects = readRepoFile("client", "src", "components", "NavigationEffects.jsx");
  const webApp = readRepoFile("web-services", "src", "App.tsx");

  assert.match(navbar, /copy\.nav\.contact, to: "\/contact"/);
  assert.match(navbar, /aria-label=\{copy\.mobileNavigationLabel/);
  assert.match(layout, /<NavigationEffects \/>/);
  assert.match(navigationEffects, /scrollIntoView/);
  assert.match(webApp, /\["Kontaktai", "#kontaktai"\]/);
  assert.match(webApp, /navigateToSection\(event, "#kontaktai"\)/);
  assert.doesNotMatch(webApp, /<button type="button">Susisiekti<\/button>/);
});
