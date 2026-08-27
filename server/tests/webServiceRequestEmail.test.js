const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildAdminEmail,
  buildCustomerEmail,
  formatPrice,
  getNotificationRecipient,
} = require("../services/webServiceRequestEmailService");

const makeRequest = (overrides = {}) => ({
  requestNumber: "WEB-2026-ABC12345",
  name: "Rokas Test",
  email: "client@example.test",
  phone: "+37060000000",
  company: "UAB Test",
  packageName: "Business",
  basePrice: 599,
  budget: "",
  message: "Reikia reprezentacinės svetainės su kontaktų forma ir aiškiu paslaugų pristatymu.",
  ...overrides,
});

test("customer confirmation contains request number, package and price", () => {
  const email = buildCustomerEmail(makeRequest());

  assert.match(email.subject, /WEB-2026-ABC12345/);
  assert.match(email.text, /Business/);
  assert.match(email.text, /599/);
  assert.match(email.html, /Užsakymas gautas/);
  assert.match(email.html, /WEB-2026-ABC12345/);
});

test("admin notification contains customer contact details and project description", () => {
  const email = buildAdminEmail(makeRequest());

  assert.match(email.subject, /Naujas Stilloak Web užsakymas/);
  assert.match(email.text, /client@example\.test/);
  assert.match(email.text, /\+37060000000/);
  assert.match(email.html, /UAB Test/);
  assert.match(email.html, /reprezentacinės svetainės/);
});

test("email html escapes customer supplied markup", () => {
  const request = makeRequest({
    name: '<script>alert("x")</script>',
    company: "A&B <b>Test</b>",
    message: "<img src=x onerror=alert(1)> normalus projekto aprašymas",
  });

  const customer = buildCustomerEmail(request);
  const admin = buildAdminEmail(request);

  assert.doesNotMatch(customer.html, /<script>/i);
  assert.doesNotMatch(admin.html, /<img/i);
  assert.match(customer.html, /&lt;script&gt;/i);
  assert.match(admin.html, /&lt;img/i);
});

test("custom project price is rendered as pagal poreikius", () => {
  assert.equal(formatPrice(null), "Pagal poreikius");
  assert.match(formatPrice(999), /999/);
});

test("explicit web order notification recipient overrides sender fallback", () => {
  const original = process.env.WEB_ORDERS_NOTIFY_EMAIL;
  process.env.WEB_ORDERS_NOTIFY_EMAIL = "orders@example.test";

  try {
    assert.equal(getNotificationRecipient(), "orders@example.test");
  } finally {
    if (original === undefined) {
      delete process.env.WEB_ORDERS_NOTIFY_EMAIL;
    } else {
      process.env.WEB_ORDERS_NOTIFY_EMAIL = original;
    }
  }
});
