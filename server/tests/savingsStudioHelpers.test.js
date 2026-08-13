const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..", "..");

const importHelpers = () =>
  import(
    pathToFileURL(
      path.join(root, "client", "src", "components", "savings", "savingsStudioHelpers.js")
    ).href
  );

test("Saving Studio client helpers do not emit NaN for malformed numeric values", async () => {
  const { getGoalProgress, recurringMonthlyEquivalent } = await importHelpers();

  assert.deepEqual(getGoalProgress({ targetAmount: 100, currentAmount: "not-a-number" }), {
    progress: 0,
    remaining: 100,
    complete: false,
  });
  assert.deepEqual(getGoalProgress({ targetAmount: 100, currentAmount: 125 }), {
    progress: 100,
    remaining: 0,
    complete: true,
  });

  assert.equal(recurringMonthlyEquivalent({ amount: "not-a-number", frequency: "monthly" }), 0);
  assert.equal(recurringMonthlyEquivalent({ amount: "not-a-number", frequency: "quarterly" }), 0);
  assert.equal(recurringMonthlyEquivalent({ amount: "not-a-number", frequency: "yearly" }), 0);
  assert.equal(recurringMonthlyEquivalent({ amount: -50, frequency: "weekly" }), 0);
});

test("Saving Studio onboarding draft currency preview uses safe formatting", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx"), "utf8");

  assert.match(source, /const formatDraftCurrency = /);
  assert.doesNotMatch(source, /money\.format\(Number\(String\(/);
});
