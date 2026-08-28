const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  areWebStripeDepositsEnabled,
  getWebBankTransferDetails,
} = require("../config/webServicePayments");

const readRepoFile = (...parts) =>
  fs.readFileSync(path.resolve(__dirname, "..", "..", ...parts), "utf8");

const withEnv = (values, callback) => {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]])
  );
  try {
    Object.entries(values).forEach(([key, value]) => {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    });
    callback();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    });
  }
};

test("Bank transfer details stay server-configured and include request-specific reference", () => {
  withEnv(
    {
      WEB_BANK_TRANSFER_BENEFICIARY: "Test Beneficiary",
      WEB_BANK_TRANSFER_IBAN: "LT00 0000 0000 0000 0000",
      WEB_BANK_TRANSFER_BIC: "TESTLT21",
      WEB_BANK_TRANSFER_BANK_NAME: "Test Bank",
    },
    () => {
      assert.deepEqual(getWebBankTransferDetails("WEB-2026-ABC123"), {
        beneficiary: "Test Beneficiary",
        iban: "LT00 0000 0000 0000 0000",
        bic: "TESTLT21",
        bankName: "Test Bank",
        currency: "EUR",
        reference: "Stilloak Web avansas – WEB-2026-ABC123",
      });
    }
  );
});

test("Stripe web deposits are opt-in and test mode does not require the live unlock", () => {
  withEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_test_example",
      WEB_STRIPE_DEPOSITS_ENABLED: null,
      WEB_SERVICE_STRIPE_LIVE_ENABLED: null,
    },
    () => {
      assert.equal(areWebStripeDepositsEnabled(), false);
    }
  );
  withEnv(
    {
      STRIPE_WEB_SERVICE_SECRET_KEY: "sk_test_example",
      WEB_STRIPE_DEPOSITS_ENABLED: "true",
      WEB_SERVICE_STRIPE_LIVE_ENABLED: "false",
    },
    () => {
      assert.equal(areWebStripeDepositsEnabled(), true);
    }
  );
});

test("Bank transfer admin fallback stays wired but is not exposed on the public proposal", () => {
  const routes = readRepoFile("server", "routes", "webServiceRequestRoutes.js");
  const controller = readRepoFile("server", "controllers", "webServiceBankTransferController.js");
  const model = readRepoFile("server", "models", "WebServiceRequest.js");
  const admin = readRepoFile("client", "src", "pages", "admin", "WebProposalsPage.jsx");
  const proposal = readRepoFile("web-services", "src", "ProposalPage.tsx");

  assert.match(routes, /\/proposal\/:token\/bank-transfer/);
  assert.match(routes, /requireWebStripeDepositsEnabled/);
  assert.match(routes, /deposit\/bank-transfer\/paid/);
  assert.match(controller, /depositPaymentMethod = "bank_transfer"/);
  assert.match(controller, /proposalStatus !== "accepted"/);
  assert.match(model, /depositPaymentMethod:/);
  assert.match(admin, /Pažymėti avansą gautu pavedimu/);
  assert.doesNotMatch(proposal, /Avansas banko pavedimu/);
  assert.doesNotMatch(proposal, /Nukopijuoti mokėjimo duomenis/);
});
