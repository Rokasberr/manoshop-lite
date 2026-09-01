const assert = require("node:assert/strict");
const test = require("node:test");

const { formatWebServiceInvoiceNumber } = require("../services/webServiceInvoiceNumberService");
const { createWebServiceOfficialInvoicePdfBuffer } = require("../utils/webServiceOfficialInvoicePdf");
const { assertRealPayment } = require("../services/webServiceOfficialInvoiceEmailService");

test("official invoice numbers use stable yearly ST sequence formatting", () => {
  assert.equal(formatWebServiceInvoiceNumber({ year: 2026, value: 1 }), "ST-2026-0001");
  assert.equal(formatWebServiceInvoiceNumber({ year: 2026, value: 42 }), "ST-2026-0042");
});

test("official invoice PDF renders immutable seller, buyer, SVS and payment details", () => {
  const request = {
    depositInvoiceSnapshot: {
      seller: {
        legalName: "Rokas Bernotas",
        tradingName: "Stilloak Studio",
        certificateNumber: "IV-TEST-0001",
        activityCode: "TEST-CODE",
        vatCode: "LT100000000000",
        address: "Veiklos adresas",
        email: "rokas@stilloak-studio.com",
        vatScheme: "svs",
      },
      buyer: {
        name: "Klientas UAB",
        companyCode: "123456789",
        vatCode: "LT123456789",
        address: "Kliento adresas",
        email: "client@example.test",
      },
      description: "Avansas uz Verslo svetaine",
      amount: 399.5,
      paymentMethod: "bank_transfer",
      requestNumber: "WEB-2026-0001",
    },
  };
  const pdf = createWebServiceOfficialInvoicePdfBuffer({ request, paymentType: "deposit", invoiceNumber: "ST-2026-0001", issuedAt: new Date("2026-09-01T00:00:00Z") });
  const source = pdf.toString("latin1");
  assert.match(source, /^%PDF-1\.4/);
  assert.match(source, /ST-2026-0001/);
  assert.match(source, /IV-TEST-0001/);
  assert.match(source, /TEST-CODE/);
  assert.match(source, /Klientas UAB/);
  assert.match(source, /399\.50 EUR/);
  assert.match(source, /smulkiojo verslo schema/);
  assert.doesNotMatch(source, /NEGALIOJA|TESTINE SASKAITA/);
});

test("official invoices accept bank transfers but reject Stripe test payments", () => {
  assert.doesNotThrow(() => assertRealPayment({ depositPaymentMethod: "bank_transfer" }, "deposit"));
  const previousFlag = process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED;
  const previousKey = process.env.STRIPE_WEB_SERVICE_SECRET_KEY;
  process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED = "false";
  process.env.STRIPE_WEB_SERVICE_SECRET_KEY = "sk_test_example";
  try {
    assert.throws(() => assertRealPayment({ depositPaymentMethod: "stripe" }, "deposit"), /testiniam mokėjimui/);
  } finally {
    if (previousFlag === undefined) delete process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED;
    else process.env.WEB_SERVICE_STRIPE_LIVE_ENABLED = previousFlag;
    if (previousKey === undefined) delete process.env.STRIPE_WEB_SERVICE_SECRET_KEY;
    else process.env.STRIPE_WEB_SERVICE_SECRET_KEY = previousKey;
  }
});
