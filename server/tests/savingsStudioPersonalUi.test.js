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

test("Saving Studio CSV import quality uses server duplicate rows", () => {
  const source = readPageSource();

  assert.match(source, /const serverDuplicateRows = csvPreviewResult\?\.duplicateRows \|\| \[\]/);
  assert.match(source, /const duplicateCandidates = serverDuplicateRows\.map\(\(row\) => row\.normalized\)\.filter\(Boolean\)/);
  assert.match(source, /duplicateCount: csvPreviewResult\?\.duplicateCount \|\| 0/);
  assert.match(source, /\(csvPreviewResult\?\.duplicateCount \|\| 0\)/);
  assert.match(source, /Bus importuota: \{csvPreviewResult\.validCount\}/);
  assert.match(source, /disabled=\{confirmingCsvImport \|\| !csvPreviewResult\.validCount\}/);
});

test("Saving Studio automation CTA stays inside mobile cards", () => {
  const source = readPageSource();
  const automationCardMatch = source.match(/const AutomationTriggerCard = \(\{ onRun, trigger \}\) => \{[\s\S]*?const ImportInsightCard/);
  assert.ok(automationCardMatch);
  const automationCardSource = automationCardMatch[0];

  assert.match(source, /actionLabel: "Siųsti savaitės suvestinę"/);
  assert.match(
    source,
    /mt-6 grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-4[\s\S]*label="Suvestinės"[\s\S]*label="Kopijos"[\s\S]*label="Signalai"/
  );
  assert.doesNotMatch(source, /mt-6 grid min-w-0[\s\S]{0,120}sm:grid-cols-3/);
  assert.match(automationCardSource, /flex min-w-0 flex-col gap-4/);
  assert.match(automationCardSource, /<div className="min-w-0">/);
  assert.match(
    automationCardSource,
    /className="button-secondary w-full max-w-full justify-center gap-2 whitespace-normal break-normal text-center"/
  );
  assert.match(automationCardSource, /<span className="min-w-0 whitespace-normal break-normal">\{trigger\.actionLabel\}<\/span>/);
  assert.match(automationCardSource, /<ArrowUpRight className="shrink-0" size=\{14\} \/>/);
  assert.doesNotMatch(automationCardSource, /sm:flex-row/);
  assert.doesNotMatch(automationCardSource, /sm:w-auto/);
  assert.doesNotMatch(automationCardSource, /sm:shrink-0/);
  assert.doesNotMatch(automationCardSource, /whitespace-nowrap/);
});
