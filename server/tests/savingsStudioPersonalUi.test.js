const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const pagePath = path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx");

const readPageSource = () => fs.readFileSync(pagePath, "utf8");

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
