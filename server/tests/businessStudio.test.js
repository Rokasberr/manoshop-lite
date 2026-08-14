const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { calculatePaidOrderTotals } = require("../controllers/businessController");
const { getOrderInvoicePdf } = require("../controllers/orderController");
const Order = require("../models/Order");

const root = path.resolve(__dirname, "..", "..");
const originalFindById = Order.findById;

const id = (value) => ({
  toString: () => value,
});

const buildInvoiceOrder = ({
  paymentStatus = "paid",
  userId = "buyer-1",
  storeOwnerId = "seller-1",
} = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  user: {
    _id: id(userId),
    email: "buyer@example.test",
  },
  storeOwner: id(storeOwnerId),
  customerEmail: "buyer@example.test",
  paymentStatus,
  paymentMethod: "stripe",
  invoice: {
    number: "INV-TEST-001",
    issuedAt: new Date("2026-08-14T00:00:00.000Z"),
  },
  shippingAddress: {
    fullName: "Test Buyer",
    address: "Test g. 1",
    city: "Vilnius",
    postalCode: "01100",
    country: "LT",
  },
  items: [
    {
      name: "Business PDF",
      price: 44.99,
      quantity: 1,
    },
  ],
  itemsPrice: 44.99,
  shippingPrice: 0,
  taxPrice: 9.45,
  totalPrice: 54.44,
  createdAt: new Date("2026-08-14T00:00:00.000Z"),
});

const buildInvoiceResponse = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
  },
  send(body) {
    this.body = body;
  },
});

const withFoundOrder = async (order, fn) => {
  Order.findById = () => ({
    populate: async () => order,
  });

  try {
    return await fn();
  } finally {
    Order.findById = originalFindById;
  }
};

const callGetOrderInvoicePdf = async ({ order, user }) => {
  const res = buildInvoiceResponse();

  await withFoundOrder(order, async () => {
    await getOrderInvoicePdf(
      {
        params: { id: String(order?._id || "507f1f77bcf86cd799439011") },
        user,
      },
      res
    );
  });

  return res;
};

const callGetOrderInvoicePdfError = async ({ order, user }) => {
  const res = buildInvoiceResponse();
  let thrownError;

  await withFoundOrder(order, async () => {
    try {
      await getOrderInvoicePdf(
        {
          params: { id: String(order?._id || "507f1f77bcf86cd799439011") },
          user,
        },
        res
      );
    } catch (error) {
      thrownError = error;
    }
  });

  return { res, error: thrownError };
};

test("Business Studio revenue totals include only paid store orders", () => {
  const totals = calculatePaidOrderTotals([
    {
      paymentStatus: "paid",
      price: 99,
      platformCommission: 19.8,
      sellerEarnings: 79.2,
    },
    {
      paymentStatus: "pending",
      price: 99,
      platformCommission: 19.8,
      sellerEarnings: 79.2,
    },
    {
      paymentStatus: "failed",
      totalPrice: 24,
      platformCommission: 4.8,
      sellerEarnings: 19.2,
    },
    {
      paymentStatus: "refunded",
      totalPrice: 48,
      platformCommission: 9.6,
      sellerEarnings: 38.4,
    },
  ]);

  assert.deepEqual(totals, {
    orders: 1,
    revenue: 99,
    platformCommission: 19.8,
    sellerEarnings: 79.2,
  });
});

test("Business Earnings UI does not present pending checkout orders as revenue", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "BusinessOrdersPage.jsx"), "utf8");

  assert.match(source, /orders\.filter\(\(order\) => order\.paymentStatus === "paid"\)\.reduce/);
  assert.match(source, /Pending, failed, canceled ir refunded checkout irasai lieka lenteleje kaip eiga/);
  assert.match(source, /Ismokejimai MVP etape yra rankinis procesas/);
  assert.match(source, /\["Patvirtintos pajamos", totals\.revenue\]/);
  assert.match(source, /pendingOrdersCount[\s\S]*neapmoketi arba neuzbaigti uzsakymai/);
});

test("Business Orders exposes PDF invoices only for paid store orders", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "BusinessOrdersPage.jsx"), "utf8");

  assert.match(source, /import orderService from "\.\.\/services\/orderService"/);
  assert.match(source, /const \[downloadingInvoiceId, setDownloadingInvoiceId\] = useState\(""\)/);
  assert.match(source, /await orderService\.downloadInvoice\(order\._id, order\.invoice\?\.number \|\| `invoice-\$\{order\._id\}`\)/);
  assert.match(source, /order\.paymentStatus === "paid" \? \(/);
  assert.match(source, /po apmokejimo/);
});

test("order invoice PDF remains downloadable for paid orders", async () => {
  const res = await callGetOrderInvoicePdf({
    order: buildInvoiceOrder({ paymentStatus: "paid" }),
    user: { _id: id("buyer-1") },
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Content-Type"], "application/pdf");
  assert.equal(res.headers["Content-Disposition"], 'attachment; filename="INV-TEST-001.pdf"');
  assert.ok(Buffer.isBuffer(res.body));
  assert.match(res.body.toString("latin1", 0, 8), /%PDF-1\.4/);
});

test("order invoice PDF rejects every unpaid payment state after successful access checks", async () => {
  const cases = [
    { paymentStatus: "pending", user: { _id: id("buyer-1") } },
    { paymentStatus: "failed", user: { _id: id("buyer-1") } },
    { paymentStatus: "canceled", user: { _id: id("buyer-1") } },
    { paymentStatus: "expired", user: { _id: id("seller-1") } },
    { paymentStatus: "cancelled", user: { _id: id("admin-1"), role: "admin" } },
  ];

  for (const invoiceCase of cases) {
    const { res, error } = await callGetOrderInvoicePdfError({
      order: buildInvoiceOrder({ paymentStatus: invoiceCase.paymentStatus }),
      user: invoiceCase.user,
    });

    assert.equal(res.statusCode, 409);
    assert.equal(error?.message, "Saskaita pasiekiama tik po sekmingo apmokejimo.");
    assert.equal(res.body, null);
    assert.equal(res.headers["Content-Type"], undefined);
  }
});

test("order invoice PDF keeps ownership authorization before paid-only enforcement", async () => {
  const { res, error } = await callGetOrderInvoicePdfError({
    order: buildInvoiceOrder({ paymentStatus: "pending" }),
    user: { _id: id("other-user") },
  });

  assert.equal(res.statusCode, 403);
  assert.match(error?.message || "", /Neturi teis/);
  assert.equal(res.headers["Content-Type"], undefined);
});

test("Business Dashboard shows real recent orders and store state from backend data", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "BusinessDashboardPage.jsx"), "utf8");

  assert.match(source, /const recentOrders = dashboard\?\.recentOrders \|\| \[\]/);
  assert.match(source, /Paskutiniai uzsakymai/);
  assert.match(source, /Pajamu korteles virsuje skaiciuoja tik apmoketus uzsakymus/);
  assert.match(source, /recentOrders\.slice\(0, 5\)\.map/);
  assert.match(source, /<StatusBadge status=\{order\.paymentStatus \|\| "pending"\} \/>/);
  assert.match(source, /Store busena/);
  assert.match(source, /store\?\.selectedProducts\?\.length \|\| 0/);
});

test("public store checkout is rate limited before creating Stripe sessions", () => {
  const routeSource = fs.readFileSync(path.join(root, "server", "routes", "storeRoutes.js"), "utf8");

  assert.match(routeSource, /const \{ createWindowRateLimiter \} = require\("\.\.\/middleware\/rateLimit"\)/);
  assert.match(routeSource, /const storeCheckoutLimiter = createWindowRateLimiter\(\{/);
  assert.match(routeSource, /keyPrefix: "store-checkout"/);
  assert.match(routeSource, /router\.post\("\/:slug\/checkout", storeCheckoutLimiter, asyncHandler\(createStoreCheckoutSession\)\)/);
});

test("Site Builder rejects malformed selected product IDs instead of silently dropping them", () => {
  const controllerSource = fs.readFileSync(path.join(root, "server", "controllers", "businessController.js"), "utf8");

  assert.match(controllerSource, /const selectedProductValues = Array\.isArray\(payload\.selectedProducts\)/);
  assert.match(controllerSource, /const invalidSelectedProducts = selectedProductValues\.filter/);
  assert.match(controllerSource, /if \(invalidSelectedProducts\.length\) \{/);
  assert.match(controllerSource, /Store produkto identifikatoriai netinkami\./);
});
