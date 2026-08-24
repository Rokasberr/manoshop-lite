const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

const controllerPath = require.resolve("../controllers/billingController");
const stripeClientPath = require.resolve("../utils/stripeClient");
const stripeCustomerServicePath = require.resolve("../services/stripeCustomerService");
const userConsentServicePath = require.resolve("../services/userConsentService");

const createResponse = () => ({
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

const createCheckoutRequest = (planId) => ({
  body: {
    planId,
    provider: "stripe",
    acceptedSubscriptionTerms: true,
  },
  headers: {
    origin: "https://client.example.test",
    "idempotency-key": "attempt-12345678",
  },
  user: {
    _id: {
      toString: () => "user_1",
    },
    email: "user@example.test",
    name: "User",
  },
});

const loadBillingControllerWithCheckoutMocks = () => {
  const calls = {
    attachConsent: 0,
    ensureCustomer: 0,
    getStripeClient: 0,
    reserveConsent: 0,
    stripeCheckout: 0,
  };
  const stripe = {
    checkout: {
      sessions: {
        create: async () => {
          calls.stripeCheckout += 1;
          return { id: "cs_test_personal", url: "https://stripe.example.test/checkout" };
        },
      },
    },
  };

  delete require.cache[controllerPath];
  require.cache[stripeClientPath] = {
    id: stripeClientPath,
    filename: stripeClientPath,
    loaded: true,
    exports: {
      getStripeClient: () => {
        calls.getStripeClient += 1;
        return stripe;
      },
      resolveClientUrl: () => "https://client.example.test",
    },
  };
  require.cache[stripeCustomerServicePath] = {
    id: stripeCustomerServicePath,
    filename: stripeCustomerServicePath,
    loaded: true,
    exports: {
      ensureStripeCustomerForUser: async () => {
        calls.ensureCustomer += 1;
        return "cus_test_user";
      },
    },
  };
  require.cache[userConsentServicePath] = {
    id: userConsentServicePath,
    filename: userConsentServicePath,
    loaded: true,
    exports: {
      attachStripeSessionToConsent: async () => {
        calls.attachConsent += 1;
      },
      buildConsentKey: (...parts) => `consent:${parts.join(":")}`,
      markConsentCheckoutFailed: async () => {},
      reserveUserConsent: async () => {
        calls.reserveConsent += 1;
        return { _id: "consent_1", consentKey: "consent_key_1" };
      },
      validateCheckoutAttemptKey: (value) => String(value || ""),
    },
  };

  return {
    calls,
    controller: require("../controllers/billingController"),
  };
};

const cleanupBillingControllerMocks = () => {
  delete require.cache[controllerPath];
  delete require.cache[stripeClientPath];
  delete require.cache[stripeCustomerServicePath];
  delete require.cache[userConsentServicePath];
};

test("business sales launch flag defaults to disabled and is shared by client and server", () => {
  const sharedFlag = require("../../shared/launchFeatures.cjs");
  const serverFlag = require("../config/launchFeatures");
  const pricingSource = read("client", "src", "pages", "PricingPage.jsx");
  const pricingShowcaseSource = read("client", "src", "components", "MembershipPricingShowcase.jsx");
  const billingControllerSource = read("server", "controllers", "billingController.js");

  assert.equal(sharedFlag.BUSINESS_PLAN_SALES_ENABLED, false);
  assert.equal(serverFlag.BUSINESS_PLAN_SALES_ENABLED, sharedFlag.BUSINESS_PLAN_SALES_ENABLED);
  assert.match(pricingSource, /shared\/launchFeatures\.cjs/);
  assert.match(pricingShowcaseSource, /shared\/launchFeatures\.cjs/);
  assert.match(billingControllerSource, /config\/launchFeatures/);
  assert.doesNotMatch(`${pricingSource}\n${billingControllerSource}`, /VITE_.*BUSINESS|process\.env\..*BUSINESS_PLAN_SALES/);
});

for (const blockedPlanId of ["private_business", "privatus_verslas"]) {
  test(`${blockedPlanId} checkout is rejected before consent, customer, or Stripe work`, async () => {
    const { controller, calls } = loadBillingControllerWithCheckoutMocks();

    try {
      await assert.rejects(
        () => controller.createPaymentSession(createCheckoutRequest(blockedPlanId), createResponse()),
        (error) => error.statusCode === 409 && error.message === "Verslo plano pardavimas dar nepradėtas."
      );

      assert.deepEqual(calls, {
        attachConsent: 0,
        ensureCustomer: 0,
        getStripeClient: 0,
        reserveConsent: 0,
        stripeCheckout: 0,
      });
    } finally {
      cleanupBillingControllerMocks();
    }
  });
}

test("personal checkout path still creates a Stripe session in the mocked flow", async () => {
  const originalPrice = process.env.STRIPE_PRICE_ASMENINIS;
  process.env.STRIPE_PRICE_ASMENINIS = "price_test_personal_1499";
  const { controller, calls } = loadBillingControllerWithCheckoutMocks();

  try {
    const res = createResponse();
    await controller.createPaymentSession(createCheckoutRequest("personal"), res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.url, "https://stripe.example.test/checkout");
    assert.equal(res.body.plan.id, "personal");
    assert.equal(res.body.plan.price, 14.99);
    assert.equal(calls.reserveConsent, 1);
    assert.equal(calls.getStripeClient, 1);
    assert.equal(calls.ensureCustomer, 1);
    assert.equal(calls.stripeCheckout, 1);
    assert.equal(calls.attachConsent, 1);
  } finally {
    cleanupBillingControllerMocks();
    if (originalPrice === undefined) {
      delete process.env.STRIPE_PRICE_ASMENINIS;
    } else {
      process.env.STRIPE_PRICE_ASMENINIS = originalPrice;
    }
  }
});

test("Demo activation remains an internal non-Stripe path", async () => {
  const User = require("../models/User");
  const originalFindById = User.findById;
  const saved = [];
  const user = {
    _id: "user_1",
    subscription: { plan: "free", status: "inactive", provider: "internal" },
    save: async () => {
      saved.push(user.subscription);
      return user;
    },
  };

  User.findById = () => ({ select: async () => user });

  try {
    const { activateDemoPlan } = require("../controllers/billingController");
    const res = createResponse();

    await activateDemoPlan({ user: { _id: "user_1" } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(saved.length, 1);
    assert.equal(user.subscription.plan, "basic");
    assert.equal(user.subscription.provider, "internal");
  } finally {
    User.findById = originalFindById;
  }
});

test("Pricing card keeps Business visible at 44,99 and routes CTA to launch soon", () => {
  const planSource = read("client", "src", "constants", "subscriptionPlans.js");
  const showcaseSource = read("client", "src", "components", "MembershipPricingShowcase.jsx");
  const pricingSource = read("client", "src", "pages", "PricingPage.jsx");

  assert.match(planSource, /id:\s*"private_business"[\s\S]*name:\s*"Verslas"[\s\S]*price:\s*44\.99/);
  assert.match(showcaseSource, /Paleidžiama netrukus/);
  assert.match(showcaseSource, /Pranešti apie startą/);
  assert.match(showcaseSource, /Business Studio ruošiama ribotai beta versijai\./);
  assert.match(showcaseSource, /to=\{isBusinessComingSoon \? "\/launch-soon\?focus=business" : "\/pricing"\}/);
  assert.match(pricingSource, /navigate\("\/launch-soon\?focus=business"/);
  assert.ok(pricingSource.indexOf('plan.id === "private_business"') < pricingSource.indexOf("billingService.createPaymentSession"));
});

test("Business CTA no longer calls billingService and remains mobile width-safe", () => {
  const showcaseSource = read("client", "src", "components", "MembershipPricingShowcase.jsx");
  const pricingSource = read("client", "src", "pages", "PricingPage.jsx");

  assert.doesNotMatch(showcaseSource, /billingService/);
  assert.match(showcaseSource, /inline-flex min-h-\[52px\] w-full items-center justify-center/);
  assert.match(showcaseSource, /rounded-lg px-5 py-3\.5 text-center text-sm/);
  assert.match(showcaseSource, /disabled:cursor-not-allowed disabled:opacity-60/);
  assert.match(pricingSource, /state: \{ email: user\?\.email \|\| "", focus: "business" \}/);
});

test("registration and Profile Business upgrade paths cannot create checkout", () => {
  const registerSource = read("client", "src", "pages", "RegisterPage.jsx");
  const profileSource = read("client", "src", "pages", "ProfilePage.jsx");

  assert.match(registerSource, /normalizePlan\(selectedPlan\) === "private_business"/);
  assert.match(registerSource, /navigate\("\/launch-soon\?focus=business"/);
  assert.ok(registerSource.indexOf('normalizePlan(selectedPlan) === "private_business"') < registerSource.indexOf("selectedPlan && selectedPlan !== \"basic\""));
  assert.doesNotMatch(profileSource, /createPaymentSession/);
  assert.match(profileSource, /hasBusinessPlanSelection/);
  assert.match(profileSource, /to="\/launch-soon\?focus=business"/);
  assert.match(profileSource, /Pranešti apie startą/);
});

test("launch-soon flow supports Business interest without duplicate submit", () => {
  const pageSource = read("client", "src", "pages", "LaunchSoonPage.jsx");
  const serviceSource = read("client", "src", "services", "launchSoonService.js");
  const controllerSource = read("server", "controllers", "launchSoonController.js");
  const waitlistSource = read("server", "services", "brevoWaitlistService.js");

  assert.match(pageSource, /key: "business"[\s\S]*status: "Paleidžiama netrukus"/);
  assert.match(pageSource, /Business Studio ruošiama ribotai beta versijai/);
  assert.match(pageSource, /44,99 €\/mėn\./);
  assert.match(pageSource, /if \(notifyState === "loading"\) \{[\s\S]*return;/);
  assert.match(pageSource, /disabled=\{notifyState === "loading"\}/);
  assert.match(pageSource, /focus: activeFocus/);
  assert.match(pageSource, /String\(location\.state\?\.email \|\| ""\)\.trim\(\)\.toLowerCase\(\)/);
  assert.match(serviceSource, /api\.post\("\/launch-soon\/notify"/);
  assert.match(controllerSource, /new Set\(\["default", "digital", "journal", "business"\]\)/);
  assert.match(controllerSource, /String\(req\.body\?\.email \|\| ""\)\.trim\(\)\.toLowerCase\(\)/);
  assert.match(controllerSource, /addEmailToBrevoWaitlist\(\{ email, focus \}\)/);
  assert.match(waitlistSource, /BREVO_LAUNCH_FOCUS_ATTRIBUTE/);
  assert.match(waitlistSource, /\[focusAttributeName\]: focus/);
});

test("Business Studio access policy is independent from sales launch flag", () => {
  const accessSource = read("server", "config", "planAccess.js");
  const authSource = read("server", "middleware", "authMiddleware.js");
  const clientMembershipSource = read("client", "src", "utils", "membership.js");

  assert.doesNotMatch(`${accessSource}\n${authSource}\n${clientMembershipSource}`, /BUSINESS_PLAN_SALES_ENABLED|launchFeatures/);
  assert.match(accessSource, /canUserAccessBusinessStudio = \(user\) =>\s*isAdminUser\(user\) \|\| \(hasActivePlanStatus\(user\) && canAccessBusinessStudio\(getUserPlan\(user\)\)\)/);
  assert.match(clientMembershipSource, /userCanAccessBusinessStudio = \(user\) =>\s*isAdminUser\(user\) \|\| \(hasActiveMembership\(user\) && canAccessBusinessStudio\(user\.subscription\?\.plan\)\)/);
});
