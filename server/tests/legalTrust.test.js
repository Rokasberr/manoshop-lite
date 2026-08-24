const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("all public legal routes exist in the client router", () => {
  const appSource = read("client", "src", "App.jsx");
  const routes = [
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/subscription-terms",
    "/subscription-cancellation",
    "/refund-policy",
    "/digital-content-terms",
    "/contact",
    "/data-rights",
  ];

  for (const route of routes) {
    assert.match(appSource, new RegExp(`path="${route.replaceAll("/", "\\/")}"`));
  }
});

test("footer exposes legal and contact links through centralized provider email", () => {
  const footerSource = read("client", "src", "components", "Footer.jsx");

  assert.match(footerSource, /serviceProvider\.supportEmail/);
  assert.match(footerSource, /\/subscription-terms/);
  assert.match(footerSource, /\/subscription-cancellation/);
  assert.match(footerSource, /\/refund-policy/);
  assert.match(footerSource, /\/data-rights/);
  assert.match(footerSource, /\/cookie-policy/);
});

test("legal pages use centralized provider data and avoid fake public rekvizitai", () => {
  const legalConfig = read("client", "src", "config", "legal.js");
  const infoPages = read("client", "src", "content", "infoPages.js");
  const publicLegalSources = `${legalConfig}\n${infoPages}\n${read("client", "src", "components", "Footer.jsx")}`;

  assert.match(legalConfig, /VITE_SERVICE_PROVIDER_NAME/);
  assert.match(legalConfig, /VITE_SERVICE_PROVIDER_CODE/);
  assert.match(infoPages, /missingRequiredProviderFields/);
  assert.doesNotMatch(publicLegalSources, /replace_me|TODO|123456789|Test Company|example address/i);
  assert.doesNotMatch(infoPages, /VITE_SERVICE_PROVIDER_NAME|VITE_SERVICE_PROVIDER_CODE|missingRequiredProviderFields\.join/);
  assert.doesNotMatch(infoPages, /galutinai paruo[sz]ta|100 % paruo[sz]ta/i);
});

test("client and server use the same canonical legal document version", () => {
  const sharedVersion = require("../../shared/legalDocuments.cjs").LEGAL_DOCUMENT_VERSION;
  const serverVersion = require("../config/legalDocuments").LEGAL_DOCUMENT_VERSION;
  const clientLegal = read("client", "src", "config", "legal.js");

  assert.equal(sharedVersion, "2026-08-24-personal-legal-trust");
  assert.equal(serverVersion, sharedVersion);
  assert.match(clientLegal, /shared\/legalDocuments\.cjs/);
  assert.match(clientLegal, /configuredLegalVersion && configuredLegalVersion !== canonicalLegalVersion/);
  assert.doesNotMatch(clientLegal, /LEGAL_DOCUMENT_VERSION\s*=\s*import\.meta\.env\.VITE_LEGAL_VERSION/);
});

test("checkout attempt keys are validated and hashed into bounded server consent keys", async () => {
  const {
    buildConsentKey,
    validateCheckoutAttemptKey,
  } = require("../services/userConsentService");
  const consentService = read("server", "services", "userConsentService.js");

  const sameAttemptA = buildConsentKey("subscription", "user-1", "personal", "2026-08-24-personal-legal-trust", "attempt-a");
  const sameAttemptB = buildConsentKey("subscription", "user-1", "personal", "2026-08-24-personal-legal-trust", "attempt-a");
  const newAttempt = buildConsentKey("subscription", "user-1", "personal", "2026-08-24-personal-legal-trust", "attempt-b");
  const otherUser = buildConsentKey("subscription", "user-2", "personal", "2026-08-24-personal-legal-trust", "attempt-a");

  assert.equal(sameAttemptA, sameAttemptB);
  assert.notEqual(sameAttemptA, newAttempt);
  assert.notEqual(sameAttemptA, otherUser);
  assert.equal(sameAttemptA.length < 100, true);
  assert.doesNotMatch(sameAttemptA, /attempt-a/);
  assert.equal(validateCheckoutAttemptKey("12345678"), "12345678");
  assert.equal(validateCheckoutAttemptKey("x".repeat(129)), "");
  assert.equal(validateCheckoutAttemptKey("bad key with spaces"), "");
  assert.equal(validateCheckoutAttemptKey({}), "");
  assert.match(consentService, /\$setOnInsert:[\s\S]*acceptedAt: new Date\(\)/);
});

test("registration requires terms and privacy consent and stores canonical server-side consent before verification", () => {
  const registerPage = read("client", "src", "pages", "RegisterPage.jsx");
  const authValidation = read("server", "middleware", "authValidation.js");
  const authController = read("server", "controllers", "authController.js");

  assert.match(registerPage, /acceptedTermsAndPrivacy/);
  assert.match(registerPage, /to="\/terms"[\s\S]*target="_blank"[\s\S]*to="\/privacy"/);
  assert.match(authValidation, /acceptedTermsAndPrivacy !== true|!acceptedTermsAndPrivacy/);
  assert.match(authController, /reserveUserConsent\(\{[\s\S]*REGISTRATION_TERMS_PRIVACY[\s\S]*consentKey: registrationConsentKey/);
  assert.match(authController, /buildConsentKey\([\s\S]*"registration"[\s\S]*userId\.toString\(\)[\s\S]*consentTypes\.REGISTRATION_TERMS_PRIVACY/);
  assert.ok(authController.indexOf("await reserveUserConsent") < authController.indexOf("await User.create"));
  assert.ok(authController.indexOf("await User.create") < authController.indexOf("await sendVerificationForUser"));
  assert.doesNotMatch(authController, /acceptedTermsAndPrivacy.*formatAuthResponse/);
});

test("paid subscription checkout requires explicit notice consent without changing plan prices", async () => {
  const originalPrice = process.env.STRIPE_PRICE_ASMENINIS;
  process.env.STRIPE_PRICE_ASMENINIS = "price_test_personal";

  const { createPaymentSession } = require("../controllers/billingController");
  const req = {
    body: { planId: "personal", provider: "stripe", acceptedSubscriptionTerms: false },
    user: { _id: { toString: () => "user_1" } },
    headers: { "idempotency-key": "attempt-12345678" },
  };
  const res = { status: () => res, json: () => res };

  await assert.rejects(() => createPaymentSession(req, res), /prenumeratos salygas/);

  const pricingSource = `${read("server", "config", "subscriptionPlans.js")}\n${read("client", "src", "constants", "subscriptionPlans.js")}`;
  assert.match(pricingSource, /id:\s*"personal"[\s\S]*price:\s*14\.99/);
  assert.match(pricingSource, /id:\s*"private_business"[\s\S]*price:\s*44\.99/);

  if (originalPrice === undefined) {
    delete process.env.STRIPE_PRICE_ASMENINIS;
  } else {
    process.env.STRIPE_PRICE_ASMENINIS = originalPrice;
  }
});

test("subscription consent is reserved before Stripe checkout and updated with the same session", () => {
  const billingController = read("server", "controllers", "billingController.js");

  assert.match(billingController, /reserveUserConsent\(\{[\s\S]*SUBSCRIPTION_CHECKOUT_NOTICE[\s\S]*subscriptionPlan: plan\.id/);
  assert.match(billingController, /validateCheckoutAttemptKey\(req\.headers\["idempotency-key"\]\)/);
  assert.match(billingController, /buildConsentKey\("subscription", req\.user\._id, plan\.id, LEGAL_DOCUMENT_VERSION, checkoutAttemptKey\)/);
  assert.ok(billingController.indexOf("await reserveUserConsent") < billingController.indexOf("getStripeClient()"));
  assert.ok(billingController.indexOf("await reserveUserConsent") < billingController.indexOf("stripe.checkout.sessions.create"));
  assert.match(billingController, /idempotencyKey: buildIdempotencyKey\([\s\S]*consent\.consentKey[\s\S]*consent\.consentKey/);
  assert.match(billingController, /markConsentCheckoutFailed\(\{ consentId: consent\._id \}\)/);
  assert.match(billingController, /attachStripeSessionToConsent\(\{[\s\S]*consentId: consent\._id,[\s\S]*stripeSessionId: session\.id/);
});

test("subscription checkout rejects invalid attempt key before Stripe", async () => {
  const originalPrice = process.env.STRIPE_PRICE_ASMENINIS;
  process.env.STRIPE_PRICE_ASMENINIS = "price_test_personal";

  const { createPaymentSession } = require("../controllers/billingController");

  try {
    await assert.rejects(
      () =>
        createPaymentSession(
          {
            body: { planId: "personal", provider: "stripe", acceptedSubscriptionTerms: true },
            user: { _id: { toString: () => "user_1" } },
            headers: { "idempotency-key": "x".repeat(129) },
          },
          { status: () => ({ json: () => null }) }
        ),
      (error) => error.statusCode === 400 && /bandymo raktas/.test(error.message)
    );
  } finally {
    if (originalPrice === undefined) {
      delete process.env.STRIPE_PRICE_ASMENINIS;
    } else {
      process.env.STRIPE_PRICE_ASMENINIS = originalPrice;
    }
  }
});

test("subscription checkout stops before Stripe when consent reservation fails", async () => {
  const UserConsent = require("../models/UserConsent");
  const originalFindOneAndUpdate = UserConsent.findOneAndUpdate;
  const originalPrice = process.env.STRIPE_PRICE_ASMENINIS;

  process.env.STRIPE_PRICE_ASMENINIS = "price_test_personal";
  UserConsent.findOneAndUpdate = async () => {
    throw new Error("internal consent db failure");
  };

  const { createPaymentSession } = require("../controllers/billingController");

  try {
    await assert.rejects(
      () =>
        createPaymentSession(
          {
            body: { planId: "personal", provider: "stripe", acceptedSubscriptionTerms: true },
            user: { _id: { toString: () => "user_1" } },
            headers: { "idempotency-key": "attempt-12345678" },
          },
          { status: () => ({ json: () => null }) }
        ),
      (error) =>
        error.statusCode === 503 &&
        /Checkout nesukurtas/.test(error.message) &&
        !/internal consent db failure/.test(error.message)
    );
  } finally {
    UserConsent.findOneAndUpdate = originalFindOneAndUpdate;
    if (originalPrice === undefined) {
      delete process.env.STRIPE_PRICE_ASMENINIS;
    } else {
      process.env.STRIPE_PRICE_ASMENINIS = originalPrice;
    }
  }
});

test("digital product checkout rejects missing immediate-access consent before Stripe session creation", async () => {
  const DigitalProductPurchase = require("../models/DigitalProductPurchase");
  const originalExists = DigitalProductPurchase.exists;
  DigitalProductPurchase.exists = async () => false;

  const { createDigitalProductCheckoutSession } = require("../services/digitalProductPurchaseService");

  await assert.rejects(
    () =>
      createDigitalProductCheckoutSession({
        user: { _id: { toString: () => "user_1" } },
        productId: "personal-budget-system",
        acceptedDigitalContentImmediateAccess: false,
      }),
    /skaitmeninio turinio teikimo/
  );

  DigitalProductPurchase.exists = originalExists;
});

test("digital product checkout stops before Stripe when consent reservation fails", async () => {
  const DigitalProductPurchase = require("../models/DigitalProductPurchase");
  const UserConsent = require("../models/UserConsent");
  const originalExists = DigitalProductPurchase.exists;
  const originalFindOneAndUpdate = UserConsent.findOneAndUpdate;

  DigitalProductPurchase.exists = async () => false;
  UserConsent.findOneAndUpdate = async () => {
    throw new Error("internal consent db failure");
  };

  const { createDigitalProductCheckoutSession } = require("../services/digitalProductPurchaseService");

  try {
    await assert.rejects(
      () =>
        createDigitalProductCheckoutSession({
          user: { _id: { toString: () => "user_1" } },
          productId: "personal-budget-system",
          acceptedDigitalContentImmediateAccess: true,
          idempotencyKey: "attempt-12345678",
        }),
      (error) =>
        error.statusCode === 503 &&
        /Checkout nesukurtas/.test(error.message) &&
        !/internal consent db failure/.test(error.message)
    );
  } finally {
    DigitalProductPurchase.exists = originalExists;
    UserConsent.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("digital product consent is reserved before Stripe and cannot alter ownership price or Price ID", () => {
  const pageSource = read("client", "src", "pages", "DigitalProductsPage.jsx");
  const clientService = read("client", "src", "services", "digitalProductService.js");
  const purchaseService = read("server", "services", "digitalProductPurchaseService.js");

  assert.match(pageSource, /acceptedImmediateAccess/);
  assert.match(pageSource, /Pirkti ir mok/);
  assert.match(clientService, /acceptedDigitalContentImmediateAccess/);
  assert.match(clientService, /"Idempotency-Key": options\.attemptKey/);
  assert.match(purchaseService, /getDigitalProductById\(productId\)/);
  assert.match(purchaseService, /hasPurchasedProduct\(user\._id, product\.id\)/);
  assert.match(purchaseService, /validateCheckoutAttemptKey\(idempotencyKey\)/);
  assert.match(purchaseService, /buildConsentKey\("digital-product", user\._id, product\.id, LEGAL_DOCUMENT_VERSION, checkoutAttemptKey\)/);
  assert.ok(purchaseService.indexOf("const alreadyPurchased") < purchaseService.indexOf("await reserveUserConsent"));
  assert.ok(purchaseService.indexOf("await reserveUserConsent") < purchaseService.indexOf("getStripeClient()"));
  assert.ok(purchaseService.indexOf("await reserveUserConsent") < purchaseService.indexOf("stripe.checkout.sessions.create"));
  assert.ok(purchaseService.indexOf("stripe.checkout.sessions.create") < purchaseService.indexOf("DigitalProductPurchase.findOneAndUpdate"));
  assert.match(purchaseService, /price_data:[\s\S]*unit_amount: product\.priceCents/);
  assert.match(purchaseService, /amount: product\.priceCents \/ 100/);
  assert.match(purchaseService, /markConsentCheckoutFailed\(\{ consentId: consent\._id \}\)/);
  assert.match(purchaseService, /idempotencyKey: buildIdempotencyKey\([\s\S]*consent\.consentKey[\s\S]*consent\.consentKey/);
  assert.match(purchaseService, /attachStripeSessionToConsent\(\{[\s\S]*consentId: consent\._id,[\s\S]*stripeSessionId: session\.id/);
  assert.doesNotMatch(clientService, /priceId|stripePriceId|priceCents/);
});

test("checkout clients create a new attempt per opened consent dialog without sending authoritative price fields", () => {
  const pricingPage = read("client", "src", "pages", "PricingPage.jsx");
  const digitalPage = read("client", "src", "pages", "DigitalProductsPage.jsx");
  const billingService = read("client", "src", "services", "billingService.js");
  const digitalService = read("client", "src", "services", "digitalProductService.js");
  const attemptUtil = read("client", "src", "utils", "checkoutAttempt.js");

  assert.match(attemptUtil, /globalThis\.crypto/);
  assert.match(attemptUtil, /secureCrypto\?\.randomUUID/);
  assert.match(attemptUtil, /secureCrypto\?\.getRandomValues/);
  assert.doesNotMatch(attemptUtil, /Math\.random/);
  assert.match(attemptUtil, /throw new Error\(/);
  assert.match(pricingPage, /const \[checkoutAttemptKey, setCheckoutAttemptKey\] = useState\(""\)/);
  assert.match(digitalPage, /const \[checkoutAttemptKey, setCheckoutAttemptKey\] = useState\(""\)/);
  assert.match(pricingPage, /const attemptKey = createCheckoutAttemptKey\(\);[\s\S]*setCheckoutAttemptKey\(attemptKey\);[\s\S]*setPendingPlan\(plan\)/);
  assert.match(digitalPage, /const attemptKey = createCheckoutAttemptKey\(\);[\s\S]*setCheckoutAttemptKey\(attemptKey\);[\s\S]*setPendingDigitalProduct\(product\)/);
  assert.match(pricingPage, /if \(!checkoutAttemptKey\) \{[\s\S]*return;[\s\S]*\}[\s\S]*billingService\.createPaymentSession/);
  assert.match(digitalPage, /if \(!checkoutAttemptKey\) \{[\s\S]*return;[\s\S]*\}[\s\S]*digitalProductService\.createCheckoutSession/);
  assert.match(pricingPage, /setPendingPlan\(null\); setCheckoutAttemptKey\(""\);/);
  assert.match(digitalPage, /setPendingDigitalProduct\(null\); setCheckoutAttemptKey\(""\);/);
  assert.match(pricingPage, /attemptKey: checkoutAttemptKey/);
  assert.match(digitalPage, /attemptKey: checkoutAttemptKey/);
  assert.match(digitalPage, /catch \(error\) \{\s*toast\.error\(error\.response\?\.data\?\.message \|\| t\("common\.toast\.purchaseReadyFailed"\)\);\s*\} finally/);
  assert.match(billingService, /"Idempotency-Key": options\.attemptKey/);
  assert.match(digitalService, /"Idempotency-Key": options\.attemptKey/);
  assert.doesNotMatch(`${billingService}\n${digitalService}`, /priceId|stripePriceId|priceCents|LEGAL_DOCUMENT_VERSION|userId/);
});

test("UserConsent reservation uses stable dedupe key and remains safe for retry or parallel requests", () => {
  const modelSource = read("server", "models", "UserConsent.js");
  const serviceSource = read("server", "services", "userConsentService.js");

  assert.match(modelSource, /consentKey:[\s\S]*required: true[\s\S]*unique: true/);
  assert.match(modelSource, /status:[\s\S]*checkout_created[\s\S]*checkout_failed/);
  assert.match(serviceSource, /buildConsentKey/);
  assert.match(serviceSource, /findOneAndUpdate\(\s*\{\s*consentKey\s*\}/);
  assert.match(serviceSource, /\$setOnInsert:[\s\S]*documentVersion: LEGAL_DOCUMENT_VERSION[\s\S]*acceptedAt: new Date\(\)/);
  assert.match(serviceSource, /upsert: true/);
  assert.match(serviceSource, /error\?\.code === 11000/);
  assert.match(serviceSource, /UserConsent\.findOne\(\{ consentKey \}\)/);
});

test("cookie and browser storage policy matches actual scripts", () => {
  const cookieUtil = read("client", "src", "utils", "cookieConsent.js");
  const cookieBanner = read("client", "src", "components", "CookieConsentBanner.jsx");
  const clientSource = read("client", "src", "main.jsx") + read("client", "src", "App.jsx");

  assert.match(cookieUtil, /HAS_NON_ESSENTIAL_COOKIE_SCRIPTS = false/);
  assert.match(cookieBanner, /HAS_NON_ESSENTIAL_COOKIE_SCRIPTS && !hasSavedConsent/);
  assert.doesNotMatch(clientSource, /gtag|GoogleAnalytics|MetaPixel|fbq|hotjar|plausible/i);
  assert.match(read("client", "src", "content", "infoPages.js"), /JWT localStorage/);
});

test("legal page layout keeps width-safe wrapping for long rekvizitai and URLs", () => {
  const infoPage = read("client", "src", "pages", "InfoPage.jsx");

  assert.match(infoPage, /break-words/);
  assert.match(infoPage, /min-w-0/);
  assert.match(infoPage, /max-w-3xl/);
});
