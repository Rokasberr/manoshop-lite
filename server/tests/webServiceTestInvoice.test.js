const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTestInvoiceNumber,
  createWebServiceTestInvoicePdfBuffer,
} = require("../utils/webServiceTestInvoicePdf");

const request = {
  requestNumber: "WEB-2026-TEST1234",
  name: "Testas Klientas",
  email: "testas@example.test",
  company: "Testinė įmonė",
  packageName: "Verslo svetainė",
  proposalPrice: 800,
  depositAmount: 400,
  depositPaidAt: new Date("2026-08-28T12:00:00.000Z"),
};

test("Stilloak Web test invoice is a valid single-page PDF with an explicit invalid marker", () => {
  const pdf = createWebServiceTestInvoicePdfBuffer({ request, paymentType: "deposit" });
  const source = pdf.toString("latin1");
  assert.equal(pdf.subarray(0, 8).toString("latin1"), "%PDF-1.4");
  assert.match(source, /TESTINE SASKAITA - NEGALIOJA/);
  assert.match(source, /400\.00 EUR/);
  assert.match(source, /%%EOF$/);
  assert.equal(buildTestInvoiceNumber(request, "deposit"), "TEST-WEB-2026-TEST1234-AVANSAS");
});

test("remaining-payment test invoice calculates only the unpaid balance", () => {
  const pdf = createWebServiceTestInvoicePdfBuffer({
    request: { ...request, finalPaidAt: new Date("2026-09-10T12:00:00.000Z") },
    paymentType: "final",
  });
  const source = pdf.toString("latin1");
  assert.match(source, /Likusi suma/);
  assert.match(source, /400\.00 EUR/);
  assert.equal(buildTestInvoiceNumber(request, "final"), "TEST-WEB-2026-TEST1234-FINAL");
});
