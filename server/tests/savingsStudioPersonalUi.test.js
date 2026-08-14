const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const pagePath = path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx");
const layoutPath = path.join(root, "client", "src", "components", "Layout.jsx");
const memberAreaPath = path.join(root, "client", "src", "pages", "MemberAreaPage.jsx");

const readPageSource = () => fs.readFileSync(pagePath, "utf8");
const readLayoutSource = () => fs.readFileSync(layoutPath, "utf8");
const readMemberAreaSource = () => fs.readFileSync(memberAreaPath, "utf8");

const extractBetween = (source, startMarker, endMarker) => {
  const startIndex = source.indexOf(startMarker);
  assert.notEqual(startIndex, -1, `Missing start marker: ${startMarker}`);
  const endIndex = source.indexOf(endMarker, startIndex);
  assert.notEqual(endIndex, -1, `Missing end marker after ${startMarker}: ${endMarker}`);
  return source.slice(startIndex, endIndex);
};

const extractComponentSource = (source, componentName, nextComponentName) =>
  extractBetween(source, `const ${componentName} = `, `const ${nextComponentName} = `);

const extractPreviousDivBlock = (source, marker) => {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Missing marker: ${marker}`);
  const startIndex = source.lastIndexOf('<div className="mt-6', markerIndex);
  assert.notEqual(startIndex, -1, `Missing metric grid before marker: ${marker}`);
  const endIndex = source.indexOf("</div>", markerIndex);
  assert.notEqual(endIndex, -1, `Missing metric grid close after marker: ${marker}`);
  return source.slice(startIndex, endIndex);
};

const extractMetricGridBefore = (source, marker) => {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Missing marker: ${marker}`);
  const startIndex = source.lastIndexOf('<div className="mt-', markerIndex);
  assert.notEqual(startIndex, -1, `Missing metric grid before marker: ${marker}`);
  const endIndex = source.indexOf("\n            </div>", markerIndex);
  assert.notEqual(endIndex, -1, `Missing metric grid close after marker: ${marker}`);
  return source.slice(startIndex, endIndex);
};

const extractSixMonthViewSource = (source) => {
  const headingIndex = source.indexOf("6 mėnesių vaizdas");
  assert.notEqual(headingIndex, -1, "Missing 6 month view heading");
  const startIndex = source.lastIndexOf('<div className="panel p-6">', headingIndex);
  assert.notEqual(startIndex, -1, "Missing 6 month view panel start");
  const endIndex = source.indexOf('\n          <div className="panel p-6">', headingIndex + 1);
  assert.notEqual(endIndex, -1, "Missing 6 month view panel end");
  return source.slice(startIndex, endIndex);
};

test("Saving Studio keeps a mobile-first responsive shell", () => {
  const indexSource = fs.readFileSync(path.join(root, "client", "index.html"), "utf8");
  const layoutSource = readLayoutSource();
  const source = readPageSource();

  assert.match(indexSource, /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/);
  assert.match(layoutSource, /<main id="main-content" className=\{mainContainerClassName\}>/);
  assert.match(source, /marketing-dark overflow-hidden rounded-lg px-5 py-7 sm:px-8 sm:py-9 lg:px-10/);
  assert.match(source, /member-workspace member-workspace-personal w-full min-w-0 space-y-8 2xl:space-y-10/);
  assert.match(source, /grid min-w-0 gap-8 lg:grid-cols-\[minmax\(0,1\.02fr\)_minmax\(0,0\.98fr\)\] lg:items-end 2xl:gap-10/);
  assert.match(source, /mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap/);
  assert.match(source, /grid min-w-0 gap-6 xl:grid-cols-\[minmax\(0,0\.9fr\)_minmax\(0,1\.1fr\)\] 2xl:grid-cols-\[minmax\(0,0\.92fr\)_minmax\(0,1\.1fr\)_minmax\(0,0\.98fr\)\] 2xl:gap-8/);
  assert.match(source, /mt-6 grid min-w-0 gap-4 md:grid-cols-\[minmax\(0,1\.2fr\)_minmax\(0,1fr\)_minmax\(0,1fr\)\]/);
  assert.match(source, /max-h-\[92vh\] w-full max-w-3xl overflow-y-auto/);
  assert.doesNotMatch(source, /<table[\s>]/);
});

test("Layout uses a wide route-aware container only for Savings Studio", () => {
  const source = readLayoutSource();

  assert.match(source, /import \{ Outlet, useLocation \} from "react-router-dom"/);
  assert.match(source, /const \{ pathname \} = useLocation\(\)/);
  assert.match(source, /pathname === "\/members\/savings-studio"/);
  assert.match(source, /isSavingsStudioWorkspace[\s\S]*"mx-auto w-full max-w-\[1800px\] px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:px-10"/);
  assert.match(source, /: "mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"/);
  assert.match(source, /href="#main-content"/);
  assert.match(source, /<Navbar \/>/);
  assert.match(source, /<Footer \/>/);
});

test("Member area shell lets Savings Studio use the available workspace width", () => {
  const source = readMemberAreaSource();
  const savingSectionSource = extractComponentSource(source, "SavingStudioSection", "JournalSection");

  assert.match(source, /member-workspace w-full min-w-0 space-y-6/);
  assert.match(
    source,
    /grid min-w-0 gap-6 lg:grid-cols-\[240px_minmax\(0,1fr\)\] lg:gap-7 xl:grid-cols-\[260px_minmax\(0,1fr\)\] xl:gap-8 2xl:grid-cols-\[280px_minmax\(0,1fr\)\] 2xl:gap-10/
  );
  assert.match(source, /<main className="w-full min-w-0">\{renderActiveSection\(\)\}<\/main>/);
  assert.match(savingSectionSource, /<section className="min-w-0 space-y-5">/);
  assert.match(savingSectionSource, /<div className="min-w-0">\{access\.personal \? <SavingsStudioPage \/> : <BazinisMemberPage \/>\}<\/div>/);
  assert.match(source, /soft-card flex gap-2 overflow-x-auto rounded-lg/);
  assert.match(source, /soft-card sticky top-28 rounded-lg/);
});

test("Savings Studio important three-column sections wait for wide screens", () => {
  const source = readPageSource();

  assert.match(
    source,
    /id="savings-ledger" className="grid min-w-0 gap-6 xl:grid-cols-\[minmax\(0,0\.9fr\)_minmax\(0,1\.1fr\)\] 2xl:grid-cols-\[minmax\(0,0\.92fr\)_minmax\(0,1\.1fr\)_minmax\(0,0\.98fr\)\] 2xl:gap-8"/
  );
  assert.match(
    source,
    /<section className="grid min-w-0 gap-6 xl:grid-cols-2 2xl:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(0,0\.95fr\)_minmax\(0,1fr\)\] 2xl:gap-8">/
  );
  assert.match(
    source,
    /<section className="grid min-w-0 gap-6 xl:grid-cols-2 2xl:grid-cols-\[minmax\(0,1\.04fr\)_minmax\(0,0\.96fr\)_minmax\(0,1fr\)\] 2xl:gap-8">/
  );
  assert.match(source, /grid min-w-0 gap-4 md:grid-cols-3/);
  assert.match(source, /mt-4 grid min-w-0 gap-3 md:grid-cols-3/);
  assert.doesNotMatch(source, /sm:grid-cols-3/);
  assert.doesNotMatch(source, /xl:grid-cols-\[0\.92fr_1\.1fr_0\.98fr\]/);
  assert.doesNotMatch(source, /xl:grid-cols-\[1\.05fr_0\.95fr_1fr\]/);
  assert.doesNotMatch(source, /xl:grid-cols-\[1\.04fr_0\.96fr_1fr\]/);
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

test("Goal strategy metrics use a container-safe grid", () => {
  const source = readPageSource();
  const goalStrategyMetricsSource = extractPreviousDivBlock(source, "value={String(goalStrategyBoard.length)}");

  assert.match(goalStrategyMetricsSource, /grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-4/);
  assert.match(goalStrategyMetricsSource, /label="Aktyvūs tikslai"/);
  assert.match(goalStrategyMetricsSource, /label="Fokusuoti dabar"/);
  assert.match(goalStrategyMetricsSource, /label="Didžiausias mėn\. tempas"/);
  assert.doesNotMatch(goalStrategyMetricsSource, /sm:grid-cols-3/);
});

test("ForecastMetricTile allows labels, values, and hints to wrap inside narrow cards", () => {
  const source = readPageSource();
  const metricTileSource = extractComponentSource(source, "ForecastMetricTile", "GoalScenarioCard");

  assert.match(metricTileSource, /soft-card min-w-0 max-w-full rounded-\[24px\] p-5/);
  assert.match(metricTileSource, /max-w-full whitespace-normal break-words text-xs/);
  assert.match(metricTileSource, /mt-3 max-w-full whitespace-normal break-normal text-2xl font-semibold/);
  assert.match(metricTileSource, /mt-2 max-w-full whitespace-normal break-words text-sm leading-6 text-muted/);
  assert.doesNotMatch(metricTileSource, /whitespace-nowrap/);
  assert.doesNotMatch(metricTileSource, /overflow-hidden/);
});

test("InsightTile allows money values to wrap inside narrow cards", () => {
  const source = readPageSource();
  const insightTileSource = extractComponentSource(source, "InsightTile", "InsightSignalCard");

  assert.match(insightTileSource, /metric-card min-w-0 max-w-full/);
  assert.match(insightTileSource, /flex min-w-0 items-center justify-between gap-3/);
  assert.match(insightTileSource, /min-w-0 whitespace-normal break-words text-xs uppercase/);
  assert.match(insightTileSource, /<Icon className="shrink-0" size=\{18\}/);
  assert.match(
    insightTileSource,
    /mt-3 min-w-0 max-w-full whitespace-normal break-words font-display text-2xl font-bold leading-tight tabular-nums xl:text-3xl/
  );
  assert.match(insightTileSource, /mt-2 whitespace-normal break-words text-sm text-white\/62/);
  assert.doesNotMatch(insightTileSource, /overflow-hidden/);
  assert.doesNotMatch(insightTileSource, /whitespace-nowrap/);
});

test("InsightTile metric groups use container-safe auto-fit grids", () => {
  const source = readPageSource();
  const heroPanelSource = extractBetween(
    source,
    '<h2 className="mt-3 font-display text-3xl font-bold leading-tight">Tavo aiškumo panelė</h2>',
    '<p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">usage guide</p>'
  );
  const monthMetricsSource = extractMetricGridBefore(source, "icon={PiggyBank}");
  const focusMetricsSource = extractMetricGridBefore(source, "icon={AlertTriangle}");
  const safeGrid = /grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\]/;

  assert.match(heroPanelSource, /mt-5 grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-3/);
  assert.match(heroPanelSource, /label="Šis mėnuo"/);
  assert.match(heroPanelSource, /label="Tikslai"/);
  assert.match(heroPanelSource, /label="Pastovios"/);
  assert.match(heroPanelSource, /label="Laisva suma"/);
  assert.doesNotMatch(heroPanelSource, /sm:grid-cols-[23]/);

  assert.match(monthMetricsSource, safeGrid);
  assert.match(monthMetricsSource, /gap-4/);
  assert.match(monthMetricsSource, /label="Šis mėnuo"/);
  assert.match(monthMetricsSource, /label="Po pastovių išlaidų"/);
  assert.match(monthMetricsSource, /label="Pastovios išlaidos"/);
  assert.doesNotMatch(monthMetricsSource, /sm:grid-cols-[23]/);

  assert.match(focusMetricsSource, safeGrid);
  assert.match(focusMetricsSource, /gap-4/);
  assert.match(focusMetricsSource, /label="Tikslai"/);
  assert.match(focusMetricsSource, /label="Didžiausias spaudimas"/);
  assert.match(focusMetricsSource, /label="Laisva suma"/);
  assert.doesNotMatch(focusMetricsSource, /sm:grid-cols-[23]/);
});

test("Six month chart scrolls internally without hiding labels or values", () => {
  const source = readPageSource();
  const sixMonthSource = extractSixMonthViewSource(source);

  assert.match(sixMonthSource, /mt-6 w-full max-w-full overflow-x-auto pb-2/);
  assert.match(sixMonthSource, /grid h-\[260px\] min-w-\[32rem\] grid-cols-6 items-end gap-3/);
  assert.match(sixMonthSource, /flex h-full min-w-0 flex-col items-center justify-end gap-3/);
  assert.match(sixMonthSource, /min-w-0 w-full text-center/);
  assert.match(sixMonthSource, /whitespace-nowrap text-\[0\.68rem\] font-semibold uppercase tracking-normal text-muted/);
  assert.match(sixMonthSource, /const formattedTotal = money\.format\(entry\.total\)/);
  assert.match(
    sixMonthSource,
    /mt-1 whitespace-nowrap text-xs font-semibold leading-tight tabular-nums" title=\{formattedTotal\}/
  );
  assert.match(sixMonthSource, /\{formattedTotal\}/);
  assert.doesNotMatch(sixMonthSource, /truncate/);
  assert.doesNotMatch(sixMonthSource, /overflow-hidden/);
  assert.doesNotMatch(sixMonthSource, /<div className="mt-6 grid h-\[260px\] grid-cols-6 items-end gap-3">/);
});

test("Summary archive actions stay inside narrow cards", () => {
  const source = readPageSource();
  const summaryArchiveSource = extractComponentSource(source, "SummaryArchiveItem", "CoachSignalCard");

  assert.match(summaryArchiveSource, /flex min-w-0 flex-col gap-4/);
  assert.match(summaryArchiveSource, /<div className="min-w-0">/);
  assert.match(
    summaryArchiveSource,
    /grid w-full grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,10rem\),1fr\)\)\] gap-2/
  );
  assert.match(summaryArchiveSource, /className="button-secondary w-full max-w-full justify-center gap-2 whitespace-normal break-normal text-center"/);
  assert.match(summaryArchiveSource, /<span className="min-w-0 whitespace-normal break-normal">Atsisiųsti vėl<\/span>/);
  assert.match(summaryArchiveSource, /<span className="min-w-0 whitespace-normal break-normal">Siųsti dar kartą<\/span>/);
  assert.match(summaryArchiveSource, /<Download className="shrink-0" size=\{14\} \/>/);
  assert.match(summaryArchiveSource, /<Mail className="shrink-0" size=\{14\} \/>/);
  assert.doesNotMatch(summaryArchiveSource, /sm:flex-row/);
  assert.doesNotMatch(summaryArchiveSource, /sm:shrink-0/);
  assert.doesNotMatch(summaryArchiveSource, /whitespace-nowrap/);
});
