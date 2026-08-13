const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { calculatePaidOrderTotals } = require("../controllers/businessController");

const root = path.resolve(__dirname, "..", "..");

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
