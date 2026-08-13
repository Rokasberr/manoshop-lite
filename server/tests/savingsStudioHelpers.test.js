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
  const { buildMonthOptions, formatChange, getGoalProgress, recurringMonthlyEquivalent } = await importHelpers();

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
  assert.equal(formatChange(undefined), "Pirmas pilnas mėnuo");
  assert.equal(formatChange("not-a-number"), "Pirmas pilnas mėnuo");
  assert.doesNotThrow(() => buildMonthOptions([{ date: "" }, {}, null]));
  assert.equal(buildMonthOptions([{ date: "" }, {}, null]).some((option) => option.value === "all"), true);
});

test("Saving Studio onboarding draft currency preview uses safe formatting", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx"), "utf8");

  assert.match(source, /const formatDraftCurrency = /);
  assert.doesNotMatch(source, /money\.format\(Number\(String\(/);
});

test("Saving Studio mutations refresh dependent summary and activity state", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx"), "utf8");

  assert.match(source, /const refreshSummary = async \(\) => \{[\s\S]*savingsStudioService\.getSummary\(\)/);
  assert.match(source, /handleEntrySubmit[\s\S]*Promise\.all\(\[refreshSummaryAndEntries\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleConfirmCsvImport[\s\S]*Promise\.all\(\[refreshSummaryAndEntries\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleDelete = async[\s\S]*Promise\.all\(\[refreshSummaryAndEntries\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleGoalSubmit[\s\S]*Promise\.all\(\[refreshGoals\(\), refreshSummary\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleDeleteGoal[\s\S]*Promise\.all\(\[refreshGoals\(\), refreshSummary\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleRecurringSubmit[\s\S]*Promise\.all\(\[refreshRecurring\(\), refreshSummary\(\), refreshActivity\(\)\]\)/);
  assert.match(source, /handleDeleteRecurring[\s\S]*Promise\.all\(\[refreshRecurring\(\), refreshSummary\(\), refreshActivity\(\)\]\)/);
});

test("Saving Studio initial load failure keeps a visible retry state", () => {
  const source = fs.readFileSync(path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx"), "utf8");

  assert.match(source, /const \[loadError, setLoadError\] = useState\(""\)/);
  assert.match(source, /setLoadError\(message\)/);
  assert.match(source, /if \(loadError\) \{[\s\S]*Saving Studio neatsidarė/);
  assert.match(source, /if \(loadError\) \{[\s\S]*onClick=\{loadStudio\}/);
  assert.match(source, /Bandyti dar kartą/);
});
