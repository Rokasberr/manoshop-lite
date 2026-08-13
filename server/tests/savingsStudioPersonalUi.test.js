const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const pagePath = path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx");

const readPageSource = () => fs.readFileSync(pagePath, "utf8");

test("Saving Studio keeps a mobile-first responsive shell", () => {
  const indexSource = fs.readFileSync(path.join(root, "client", "index.html"), "utf8");
  const layoutSource = fs.readFileSync(path.join(root, "client", "src", "components", "Layout.jsx"), "utf8");
  const source = readPageSource();

  assert.match(indexSource, /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/);
  assert.match(layoutSource, /<main id="main-content" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">/);
  assert.match(source, /marketing-dark overflow-hidden rounded-lg px-5 py-7 sm:px-8 sm:py-9 lg:px-10/);
  assert.match(source, /grid gap-8 lg:grid-cols-\[1\.02fr_0\.98fr\] lg:items-end/);
  assert.match(source, /mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap/);
  assert.match(source, /grid gap-6 xl:grid-cols-\[0\.92fr_1\.1fr_0\.98fr\]/);
  assert.match(source, /mt-6 grid gap-4 md:grid-cols-\[1\.2fr_1fr_1fr\]/);
  assert.match(source, /max-h-\[92vh\] w-full max-w-3xl overflow-y-auto/);
  assert.doesNotMatch(source, /<table[\s>]/);
});

test("Saving Studio onboarding validation has a persistent inline error state", () => {
  const source = readPageSource();

  assert.match(source, /const getOnboardingStepError = /);
  assert.match(source, /const \[onboardingError, setOnboardingError\] = useState\(""\)/);
  assert.match(source, /setOnboardingError\(validationError\)/);
  assert.match(source, /getOnboardingCompletionError\(\{ budgetInputs, profileForm \}\)/);
  assert.match(source, /onboardingError \? \([\s\S]*role="alert"[\s\S]*\{onboardingError\}/);
});

test("Saving Studio budget month load failure has visible retry state", () => {
  const source = readPageSource();

  assert.match(source, /const \[budgetLoadError, setBudgetLoadError\] = useState\(""\)/);
  assert.match(source, /const loadBudgetsForMonth = useCallback\(async \(monthKey\) =>/);
  assert.match(source, /setBudgetLoadError\(message\)/);
  assert.match(source, /budgetLoadError \? \([\s\S]*role="alert"[\s\S]*onClick=\{\(\) => loadBudgetsForMonth\(selectedBudgetMonth\)\}/);
  assert.match(source, /disabled=\{savingBudgets \|\| loadingBudgets\}/);
});

test("Saving Studio legacy entries without dates do not crash filters or display", () => {
  const source = readPageSource();

  assert.match(source, /const getEntryDateValue = \(entry\) => String\(entry\?\.date \|\| ""\)\.trim\(\)/);
  assert.match(source, /const formatEntryDate = \(dateValue\) =>/);
  assert.match(source, /const entryDate = getEntryDateValue\(entry\)/);
  assert.doesNotMatch(source, /entry\.date\.startsWith/);
  assert.match(source, /formatEntryDate\(entry\.date\)/);
  assert.match(source, /date: getEntryDateValue\(entry\) \|\| currentDateInput\(\)/);
});
