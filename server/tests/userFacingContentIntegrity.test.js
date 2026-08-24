const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { getPlanById } = require("../config/subscriptionPlans");

const root = path.resolve(__dirname, "..", "..");
const readProjectFile = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const userFacingContentFiles = [
  ["client", "src", "i18n", "translations.js"],
  ["client", "src", "constants", "subscriptionPlans.js"],
  ["client", "src", "constants", "digitalProducts.js"],
  ["client", "src", "content", "infoPages.js"],
  ["client", "src", "components", "Footer.jsx"],
  ["client", "src", "pages", "BazinisMemberPage.jsx"],
  ["client", "src", "pages", "MemberAreaPage.jsx"],
  ["client", "src", "pages", "ProfilePage.jsx"],
  ["client", "src", "pages", "VerifyEmailPage.jsx"],
  ["client", "src", "pages", "SavingsStudioPage.jsx"],
  ["client", "src", "components", "MembershipPricingShowcase.jsx"],
  ["server", "controllers", "authController.js"],
  ["server", "middleware", "authMiddleware.js"],
  ["server", "middleware", "authValidation.js"],
  ["server", "services", "accountLifecycleService.js"],
  ["server", "services", "emailVerificationEmailService.js"],
  ["server", "services", "emailVerificationService.js"],
  ["server", "services", "savingsStudioSummaryEmailService.js"],
  ["server", "config", "subscriptionPlans.js"],
];

test("user-facing plan names and prices use the approved labels", () => {
  assert.equal(getPlanById("basic").name, "Demo");
  assert.equal(getPlanById("personal").name, "Asmeninis");
  assert.equal(getPlanById("private_business").name, "Verslas");
  assert.equal(getPlanById("basic").price, 0);
  assert.equal(getPlanById("personal").price, 14.99);
  assert.equal(getPlanById("private_business").price, 44.99);

  const planSource = readProjectFile("client", "src", "constants", "subscriptionPlans.js");
  const pricingSource = readProjectFile("client", "src", "components", "MembershipPricingShowcase.jsx");

  assert.match(planSource, /id:\s*"basic"[\s\S]*name:\s*"Demo"[\s\S]*price:\s*0/);
  assert.match(planSource, /id:\s*"personal"[\s\S]*name:\s*"Asmeninis"[\s\S]*price:\s*14\.99/);
  assert.match(planSource, /id:\s*"private_business"[\s\S]*name:\s*"Verslas"[\s\S]*price:\s*44\.99/);
  assert.match(pricingSource, /return "0 €"/);
  assert.match(pricingSource, /amount\.toFixed\(2\)\.replace\("\.", ","\)/);
  assert.match(pricingSource, /return `\$\{formattedAmount\} €\$\{formattedInterval\}`/);
});

test("active user-facing plan content does not use retired plan labels or old membership prices", () => {
  const retiredPlanPattern = /Demo versij|Privatus verslas|Private Business|Prywatny biznes/;
  const oldMembershipPricePattern =
    /(?:€\s*)?(?<![\d,.])(?:5\.99|15\.99|9|24|99)(?![\d,.])(?:\s*(?:€|EUR|eur))?\s*\/?\s*(?:mėn|men|month|mies|Monat|mois|mes|per month)/i;

  for (const file of userFacingContentFiles) {
    const source = readProjectFile(...file);
    assert.doesNotMatch(source, retiredPlanPattern, file.join("/"));
    assert.doesNotMatch(source, oldMembershipPricePattern, file.join("/"));
  }
});

test("user-facing content does not promise AI features that are not implemented", () => {
  const misleadingAiPattern =
    /AI (?:analiz|komentar|rekomendacij)|dirbtinio intelekto|automat(?:in(?:ė|es)|inės) AI|AI mėnesio|AI savaitės/i;

  for (const file of userFacingContentFiles) {
    assert.doesNotMatch(readProjectFile(...file), misleadingAiPattern, file.join("/"));
  }
});

test("main user-facing content files are free from common mojibake fragments", () => {
  const mojibakePattern = /Ã|Å|Ä|Æ|Ć|ā‚¬|â‚¬|ļæ½|�/;

  for (const file of userFacingContentFiles) {
    assert.doesNotMatch(readProjectFile(...file), mojibakePattern, file.join("/"));
  }
});

test("visible footer and contact content do not expose demo contact details", () => {
  const footerSource = readProjectFile("client", "src", "components", "Footer.jsx");
  const legalConfigSource = readProjectFile("client", "src", "config", "legal.js");
  const translationsSource = readProjectFile("client", "src", "i18n", "translations.js");
  const infoPagesSource = readProjectFile("client", "src", "content", "infoPages.js");
  const visibleContactSources = [footerSource, translationsSource, infoPagesSource].join("\n");

  assert.match(footerSource, /serviceProvider\.supportEmail/);
  assert.match(legalConfigSource, /hello@stilloak-studio\.com/);
  assert.match(footerSource, /copy\.links\.contactPrompt/);
  assert.match(translationsSource, /contactPrompt: "Susisiekite el\. paštu"/);
  assert.doesNotMatch(visibleContactSources, /\+370 600 12345/);
  assert.doesNotMatch(visibleContactSources, /Vilnius, Lietuva|Vilnius, Lithuania|Vilniaus, Lietuvoje/);
  assert.doesNotMatch(visibleContactSources, /I-V 9:00-18:00|9:00–18:00|9:00-18:00/);
});

test("account lifecycle user-facing Lithuanian messages keep UTF-8 diacritics", () => {
  const sources = [
    readProjectFile("server", "services", "accountLifecycleService.js"),
    readProjectFile("server", "services", "emailVerificationService.js"),
    readProjectFile("server", "services", "emailVerificationEmailService.js"),
    readProjectFile("server", "controllers", "authController.js"),
    readProjectFile("server", "middleware", "authMiddleware.js"),
    readProjectFile("server", "middleware", "authValidation.js"),
    readProjectFile("client", "src", "pages", "VerifyEmailPage.jsx"),
    readProjectFile("client", "src", "pages", "ProfilePage.jsx"),
  ].join("\n");

  assert.match(sources, /El\. pašto patvirtinimo nuoroda neteisinga arba pasibaigusi/);
  assert.match(sources, /Paskyra ištrinta/);
  assert.match(sources, /Verslo nuosavybės patikros nepavyko/);
  assert.match(sources, /pardavėjo objektų savininko paskyrai reikia rankinės pagalbos/);
  assert.doesNotMatch(sources, /El\. pasto|Paskyra istrinta|paskyra istrinta|neistrinta|nuosavybes|pardavejo|rankines/);
});

test("navigation keeps productivity resources inside digital products", () => {
  const navbarSource = readProjectFile("client", "src", "components", "Navbar.jsx");
  const memberAreaSource = readProjectFile("client", "src", "pages", "MemberAreaPage.jsx");

  assert.doesNotMatch(navbarSource, /Produktyvumas/);
  assert.doesNotMatch(memberAreaSource, /sections:\s*\{[\s\S]*productivity/i);
  assert.match(memberAreaSource, /Skaitmeninių produktų/);
});

test("Stilloak Studio remains the visible brand identity", () => {
  const sources = userFacingContentFiles.map((file) => readProjectFile(...file)).join("\n");

  assert.match(sources, /Stilloak Studio/);
  assert.doesNotMatch(sources, /ManoShop/);
});
