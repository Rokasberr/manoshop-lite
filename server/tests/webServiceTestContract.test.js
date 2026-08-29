const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTestContractNumber,
  createWebServiceTestContractPdfBuffer,
} = require("../utils/webServiceTestContractPdf");

const request = {
  requestNumber: "WEB-2026-TEST1234",
  name: "Testas Klientas",
  email: "testas@example.test",
  billingName: "Testine imone, UAB",
  companyCode: "123456789",
  vatCode: "LT123456789",
  billingAddress: "Testu g. 1, Vilnius",
  packageName: "Verslo svetaine",
  proposalPrice: 800,
  depositPercent: 50,
  depositAmount: 400,
  proposalScope: "Dizainas, programavimas ir paleidimas.",
  proposalTerms: "Darbai pradedami gavus avansa.",
  proposalTermsVersion: "2026-08",
  proposalAcceptedName: "Testas Klientas",
  proposalAcceptedAt: new Date("2026-08-29T12:00:00.000Z"),
};

test("Stilloak Web test contract is a valid PDF with explicit invalid markers", () => {
  const pdf = createWebServiceTestContractPdfBuffer({ request });
  const source = pdf.toString("latin1");
  assert.equal(pdf.subarray(0, 8).toString("latin1"), "%PDF-1.4");
  assert.match(source, /TESTINE PASLAUGU SUTARTIS - NEGALIOJA/);
  assert.match(source, /DOKUMENTAS NEGALIOJA - TIK TESTAVIMUI/);
  assert.match(source, /Testine imone, UAB/);
  assert.match(source, /800\.00 EUR/);
  assert.match(source, /%%EOF$/);
  assert.equal(buildTestContractNumber(request), "TEST-WEB-2026-TEST1234-SUTARTIS");
});

test("long test contract content is paginated", () => {
  const pdf = createWebServiceTestContractPdfBuffer({
    request: { ...request, proposalScope: "Ilga darbu eilute. ".repeat(500) },
  });
  const source = pdf.toString("latin1");
  const pageCount = (source.match(/\/Type \/Page /g) || []).length;
  assert.ok(pageCount > 1);
  assert.match(source, new RegExp(`Puslapis ${pageCount} is ${pageCount}`));
});
