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
  assert.match(email.html, /text-align:center/);
  assert.match(email.html, /word-break:break-word/);
  assert.match(email.html, /@media only screen and \(max-width:480px\)/);
  assert.match(email.html, /email-card/);
  assert.match(email.html, /Stilloak Web pranešimas/);
  assert.match(email.html, /Kilo klausimų\?/);
  assert.match(email.html, /\[if mso\]/);
  assert.doesNotMatch(email.html, /text-align:justify/);
  assert.doesNotMatch(email.html, /text-align:left/);
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
  const clientRoutes = readRepoFile("client", "src", "App.jsx");
  const webFooter = readRepoFile("web-services", "src", "components", "FooterLinksPortal.tsx");
  const proposal = readRepoFile("web-services", "src", "ProposalPage.tsx");
  const proposalEmail = readRepoFile("server", "services", "webServiceProposalEmailService.js");
  const requestEmail = readRepoFile("server", "services", "webServiceRequestEmailService.js");
  const webIndex = readRepoFile("web-services", "index.html");
  const webApp = readRepoFile("web-services", "src", "App.tsx");
  const webStyles = readRepoFile("web-services", "src", "styles", "main.css");
  const webManifest = readRepoFile("web-services", "public", "site.webmanifest");
  const webMain = readRepoFile("web-services", "src", "main.tsx");
  assert.match(routes, /\/operations\/backup/);
  assert.match(backup, /aes-256-gcm/);
  assert.match(backup, /DATABASE_BACKUP_UPLOAD_URL/);
  assert.match(errors, /recordOperationalEvent/);
  assert.match(legal, /webServicesPrivacy/);
  assert.match(legal, /webServicesTerms/);
  assert.match(legal, /webServicesRefunds/);
  assert.match(legal, /webServicesDetails/);
  assert.match(legal, /\+370 638 43445/);
  assert.match(legal, /LT100020711618/);
  assert.match(legal, /hello@stilloak-studio\.com/);
  assert.doesNotMatch(legal, /rokas@stilloak-studio\.com/);
  assert.doesNotMatch(legal, /smulkiojo verslo schema/i);
  assert.doesNotMatch(legal, /Rokas Bernotas/);
  assert.doesNotMatch(legal, /VITE_WEB_SERVICE_BUSINESS_ADDRESS/);
  assert.doesNotMatch(legal, /VITE_WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER/);
  assert.match(clientRoutes, /\/web-services-details/);
  assert.match(webFooter, /Rekvizitai/);
  assert.match(webFooter, /web-services-details/);
  assert.match(proposal, /web-services-terms/);
  assert.match(proposalEmail, /buildWebServiceEmail/);
  assert.match(proposalEmail, /Peržiūrėti ir patvirtinti pasiūlymą/);
  assert.match(requestEmail, /text-align:left/);
  assert.match(webIndex, /favicon-48\.png/);
  assert.match(webIndex, /apple-touch-icon\.png/);
  assert.match(webIndex, /site\.webmanifest/);
  assert.match(webIndex, /icon-512\.png/);
  assert.match(webIndex, /rel="preload" as="image"/);
  assert.match(webManifest, /"purpose": "any maskable"/);
  assert.match(webApp, /loading=\{index === 0 \? "eager" : "lazy"\}/);
  assert.match(webApp, /fetchPriority=\{index === 0 \? "high" : "low"\}/);
  assert.doesNotMatch(webStyles, /fonts\.googleapis\.com/);
  assert.match(webMain, /lazy\(\(\) => import\("\.\/ProposalPage"\)\)/);
  assert.doesNotMatch(webMain, /import ProposalPage from/);
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
