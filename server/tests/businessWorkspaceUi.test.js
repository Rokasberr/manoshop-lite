const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const appPath = path.join(root, "client", "src", "App.jsx");
const layoutPath = path.join(root, "client", "src", "components", "Layout.jsx");
const businessLayoutPath = path.join(root, "client", "src", "components", "business", "BusinessLayout.jsx");
const memberAreaPath = path.join(root, "client", "src", "pages", "MemberAreaPage.jsx");

const readSource = (filePath) => fs.readFileSync(filePath, "utf8");

const extractBetween = (source, startMarker, endMarker) => {
  const startIndex = source.indexOf(startMarker);
  assert.notEqual(startIndex, -1, `Missing start marker: ${startMarker}`);
  const endIndex = source.indexOf(endMarker, startIndex);
  assert.notEqual(endIndex, -1, `Missing end marker after ${startMarker}: ${endMarker}`);
  return source.slice(startIndex, endIndex);
};

const extractBusinessRoutes = (source) =>
  extractBetween(
    source,
    '<Route element={<ProtectedRoute requireBusinessPlan />}>',
    '<Route element={<ProtectedRoute requireAdmin />}>'
  );

test("BusinessLayout exists and owns the Business workspace shell without nested main", () => {
  assert.equal(fs.existsSync(businessLayoutPath), true);

  const source = readSource(businessLayoutPath);

  assert.match(source, /import \{[\s\S]*NavLink[\s\S]*Outlet[\s\S]*useLocation[\s\S]*\} from "react-router-dom"/);
  assert.match(source, /<Outlet \/>/);
  assert.match(source, /business-workspace w-full min-w-0 space-y-6/);
  assert.match(source, /Operacinė darbo zona svetainės kūrimui, produktams, užsakymams ir pajamoms\./);
  assert.match(source, /to="\/members\/savings-studio"/);
  assert.match(source, /Grįžti į nario zoną/);
  assert.doesNotMatch(source, /<main[\s>]/);
  assert.doesNotMatch(source, /<h1[\s>]/);
  assert.match(source, /<p[\s\S]*\{activeModuleLabel\}[\s\S]*<\/p>/);
});

test("Business workspace navigation exposes six unique real modules with active states", () => {
  const source = readSource(businessLayoutPath);

  const expectedLinks = [
    ['label: "Apžvalga"', 'to: "/business"'],
    ['label: "Site Builder"', 'to: "/business/site-builder"'],
    ['label: "Skaitmeniniai produktai"', 'to: "/business/digital-products"'],
    ['label: "Mano produktai"', 'to: "/business/my-products"'],
    ['label: "Užsakymai"', 'to: "/business/orders"'],
    ['label: "Pajamos"', 'to: "/business/earnings"'],
  ];

  expectedLinks.forEach(([label, to]) => {
    assert.match(source, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(source, new RegExp(to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  assert.match(source, /end: true/);
  assert.match(source, /<NavLink key=\{item\.to\} to=\{item\.to\} end=\{item\.end\} className=\{getNavLinkClassName\}>/);
  assert.match(source, /isActive[\s\S]*bg-\[rgb\(var\(--accent-strong\)\)\] text-white/);
  assert.match(source, /aria-label="Verslo zonos navigacija"/);
  assert.doesNotMatch(source, /my-store/);
  assert.doesNotMatch(source, /settings/);

  const toMatches = [...source.matchAll(/to: "(\/business[^"]*)"/g)].map((match) => match[1]);
  assert.deepEqual(new Set(toMatches).size, 6);
});

test("Business workspace responsive grid keeps desktop sidebar sticky and mobile nav internally scrollable", () => {
  const source = readSource(businessLayoutPath);

  assert.match(source, /grid w-full min-w-0 gap-6 lg:grid-cols-\[240px_minmax\(0,1fr\)\] lg:gap-7 xl:grid-cols-\[260px_minmax\(0,1fr\)\] xl:gap-8 2xl:grid-cols-\[280px_minmax\(0,1fr\)\] 2xl:gap-10/);
  assert.match(source, /className="soft-card sticky top-28 rounded-lg p-3/);
  assert.match(source, /className="soft-card flex w-full max-w-full gap-2 overflow-x-auto rounded-lg p-2 pb-3/);
  assert.match(source, /min-h-\[3rem\] shrink-0 items-center gap-2/);
  assert.match(source, /<span className="whitespace-nowrap">\{item\.label\}<\/span>/);
  assert.match(source, /<section className="w-full min-w-0">[\s\S]*<Outlet \/>[\s\S]*<\/section>/);
});

test("Business routes are nested under requireBusinessPlan and legacy duplicates redirect", () => {
  const source = readSource(appPath);
  const businessRoutes = extractBusinessRoutes(source);

  assert.match(source, /import BusinessLayout from "\.\/components\/business\/BusinessLayout"/);
  assert.match(businessRoutes, /<Route path="\/business" element=\{<BusinessLayout \/>\}>/);
  assert.match(businessRoutes, /<Route index element=\{<BusinessDashboardPage \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="site-builder" element=\{<SiteBuilderPage \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="digital-products" element=\{<BusinessProductsPage \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="my-products" element=\{<BusinessProductsPage mode="selected" \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="orders" element=\{<BusinessOrdersPage \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="earnings" element=\{<BusinessOrdersPage mode="earnings" \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="my-store" element=\{<Navigate to="\/business\/site-builder" replace \/>\} \/>/);
  assert.match(businessRoutes, /<Route path="settings" element=\{<Navigate to="\/business\/site-builder" replace \/>\} \/>/);
  assert.doesNotMatch(businessRoutes, /path="\/business\/my-store" element=\{<SiteBuilderPage/);
  assert.doesNotMatch(businessRoutes, /path="\/business\/settings" element=\{<SiteBuilderPage/);
});

test("Layout gives wide max width only to Savings Studio and Business workspace routes", () => {
  const source = readSource(layoutPath);

  assert.match(source, /const isSavingsStudioWorkspace = pathname === "\/members\/savings-studio"/);
  assert.match(source, /const isBusinessWorkspace = pathname === "\/business" \|\| pathname\.startsWith\("\/business\/"\)/);
  assert.match(source, /const isWideWorkspace = isSavingsStudioWorkspace \|\| isBusinessWorkspace/);
  assert.match(source, /isWideWorkspace[\s\S]*"mx-auto w-full max-w-\[1800px\] px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:px-10"/);
  assert.match(source, /: "mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"/);
  assert.doesNotMatch(source, /stores/);
});

test("Member area Business section keeps unique modules and does not duplicate Site Builder aliases", () => {
  const source = readSource(memberAreaPath);
  const businessModules = extractBetween(source, "const businessModules = [", "const memberResources = [");

  assert.match(businessModules, /id: "business"[\s\S]*to: "\/business"/);
  assert.match(businessModules, /title: "Verslo darbo zona"/);
  assert.match(businessModules, /id: "siteBuilder"[\s\S]*to: "\/business\/site-builder"/);
  assert.match(businessModules, /id: "digitalProducts"[\s\S]*to: "\/business\/digital-products"/);
  assert.match(businessModules, /id: "myProducts"[\s\S]*to: "\/business\/my-products"/);
  assert.match(businessModules, /id: "orders"[\s\S]*to: "\/business\/orders"/);
  assert.match(businessModules, /id: "earnings"[\s\S]*to: "\/business\/earnings"/);
  assert.doesNotMatch(businessModules, /myWebsite/);
  assert.doesNotMatch(businessModules, /\/business\/my-store/);
  assert.doesNotMatch(businessModules, /\/business\/settings/);
  assert.match(source, /<PrivateBusinessWorkspacePage \/>/);
});
