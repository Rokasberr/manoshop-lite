const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { getPlanById } = require("../config/subscriptionPlans");

const root = path.resolve(__dirname, "..", "..");

const readProjectFile = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("membership prices are the final launch prices on the server", () => {
  assert.equal(getPlanById("basic").price, 0);
  assert.equal(getPlanById("personal").price, 14.99);
  assert.equal(getPlanById("private_business").price, 44.99);
});

test("client membership config uses the final launch prices", () => {
  const source = readProjectFile("client", "src", "constants", "subscriptionPlans.js");

  assert.match(source, /id:\s*"basic"[\s\S]*price:\s*0/);
  assert.match(source, /id:\s*"personal"[\s\S]*price:\s*14\.99/);
  assert.match(source, /id:\s*"private_business"[\s\S]*price:\s*44\.99/);
});

test("active membership surfaces do not reintroduce old launch prices", () => {
  const files = [
    ["server", "config", "subscriptionPlans.js"],
    ["client", "src", "constants", "subscriptionPlans.js"],
    ["client", "src", "i18n", "translations.js"],
    ["client", "src", "pages", "SavingsStudioPage.jsx"],
    ["client", "src", "pages", "admin", "InstagramGeneratorPage.jsx"],
    ["README.md"],
    ["codex-work", "RELEASE_CHECKLIST.md"],
  ];
  const oldMembershipPricePattern =
    /(?:€\s*)?(?<![\d,.])(?:9|24|99)(?![\d,.])(?:\s*(?:€|EUR|eur))?\s*\/?\s*(?:mėn|men|month|mies|Monat|mois|mes|per month)/i;

  for (const file of files) {
    assert.doesNotMatch(readProjectFile(...file), oldMembershipPricePattern, file.join("/"));
  }
});
