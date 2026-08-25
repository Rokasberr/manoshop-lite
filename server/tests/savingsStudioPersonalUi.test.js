const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const pagePath = path.join(root, "client", "src", "pages", "SavingsStudioPage.jsx");
const servicePath = path.join(root, "client", "src", "services", "savingsStudioService.js");
const layoutPath = path.join(root, "client", "src", "components", "Layout.jsx");
const memberAreaPath = path.join(root, "client", "src", "pages", "MemberAreaPage.jsx");
const digitalProductAccessGridPath = path.join(root, "client", "src", "components", "DigitalProductAccessGrid.jsx");
const cssPath = path.join(root, "client", "src", "index.css");

const readPageSource = () => fs.readFileSync(pagePath, "utf8");
const readServiceSource = () => fs.readFileSync(servicePath, "utf8");
const readLayoutSource = () => fs.readFileSync(layoutPath, "utf8");
const readMemberAreaSource = () => fs.readFileSync(memberAreaPath, "utf8");
const readDigitalProductAccessGridSource = () => fs.readFileSync(digitalProductAccessGridPath, "utf8");
const readCssSource = () => fs.readFileSync(cssPath, "utf8");

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
  const startIndex = source.lastIndexOf('<div className="panel w-full min-w-0 max-w-full p-6">', headingIndex);
  assert.notEqual(startIndex, -1, "Missing 6 month view panel start");
  const endIndex = source.indexOf('\n          <div className="panel w-full min-w-0 max-w-full p-6">', headingIndex + 1);
  assert.notEqual(endIndex, -1, "Missing 6 month view panel end");
  return source.slice(startIndex, endIndex);
};

const extractSixMonthChartSource = (source) => {
  const chartIndex = source.indexOf("grid h-[260px] min-w-[32rem] grid-cols-6 items-end gap-3");
  assert.notEqual(chartIndex, -1, "Missing 6 month chart grid");
  const startIndex = source.lastIndexOf('<div className="panel w-full min-w-0 max-w-full p-6">', chartIndex);
  assert.notEqual(startIndex, -1, "Missing 6 month chart panel start");
  const endIndex = source.indexOf('\n          <div className="panel w-full min-w-0 max-w-full p-6">', chartIndex + 1);
  assert.notEqual(endIndex, -1, "Missing 6 month chart panel end");
  return source.slice(startIndex, endIndex);
};

test("Saving Studio keeps a mobile-first responsive shell", () => {
  const indexSource = fs.readFileSync(path.join(root, "client", "index.html"), "utf8");
  const layoutSource = readLayoutSource();
  const source = readPageSource();

  assert.match(indexSource, /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/);
  assert.match(layoutSource, /<main id="main-content" className=\{mainContainerClassName\}>/);
  assert.match(source, /marketing-dark min-w-0 rounded-lg px-5 py-7 sm:px-8 sm:py-9 lg:px-10/);
  assert.match(source, /member-workspace member-workspace-personal w-full min-w-0 space-y-8 2xl:space-y-10/);
  assert.match(source, /grid min-w-0 gap-8 lg:grid-cols-\[minmax\(0,1\.02fr\)_minmax\(0,0\.98fr\)\] lg:items-end 2xl:gap-10/);
  assert.match(source, /mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap/);
  assert.match(source, /button-primary min-h-\[52px\] w-full justify-center gap-2 sm:w-auto/);
  assert.match(source, /hero-outline-button min-h-\[52px\] w-full justify-center gap-2 sm:w-auto/);
  assert.match(source, /grid min-w-0 gap-6 xl:grid-cols-\[minmax\(0,0\.9fr\)_minmax\(0,1\.1fr\)\] 2xl:grid-cols-\[minmax\(0,0\.92fr\)_minmax\(0,1\.1fr\)_minmax\(0,0\.98fr\)\] 2xl:gap-8/);
  assert.match(source, /mt-6 grid min-w-0 gap-4 md:grid-cols-\[minmax\(0,1\.2fr\)_minmax\(0,1fr\)_minmax\(0,1fr\)\]/);
  assert.match(source, /max-h-\[92vh\] w-full max-w-3xl overflow-y-auto/);
  assert.doesNotMatch(source, /<table[\s>]/);
});

test("Layout uses a wide route-aware container for Savings Studio and Business workspaces", () => {
  const source = readLayoutSource();

  assert.match(source, /import \{ Outlet, useLocation \} from "react-router-dom"/);
  assert.match(source, /const location = useLocation\(\)/);
  assert.match(source, /const \{ pathname \} = location/);
  assert.match(source, /pathname === "\/members\/savings-studio"/);
  assert.match(source, /pathname === "\/business" \|\| pathname\.startsWith\("\/business\/"\)/);
  assert.match(source, /isWideWorkspace[\s\S]*"mx-auto w-full max-w-\[1800px\] px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:px-10"/);
  assert.match(source, /: "mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"/);
  assert.match(source, /href="#main-content"/);
  assert.match(source, /<Navbar \/>/);
  assert.match(source, /<Footer \/>/);
  assert.match(source, /app-surface relative min-h-screen overflow-x-hidden/);
  assert.doesNotMatch(source, /app-surface relative min-h-screen overflow-hidden/);
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
  assert.match(source, /soft-card flex min-w-0 max-w-full gap-2 overflow-x-auto rounded-lg/);
  assert.match(source, /inline-flex min-h-\[3rem\] min-w-\[9rem\] max-w-\[12rem\] shrink-0/);
  assert.match(source, /<span className="min-w-0 whitespace-normal leading-5">\{t\(`memberArea\.sections\.\$\{section\.id\}`\)\}<\/span>/);
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

test("Savings Studio P1 mobile actions and charts stay width-safe", () => {
  const source = readPageSource();
  const weeklyChartSource = extractBetween(
    source,
    'weeklyTotalsCurrentMonth.map((entry) => {',
    '<WalletCards size={20} style={{ color: "rgb(var(--accent))" }} />'
  );
  const summaryActionsSource = extractBetween(
    source,
    '<form className="mt-6 space-y-5" onSubmit={handleSaveEmailSettings}>',
    '<div className="mt-6 soft-card rounded-[24px] p-5">'
  );
  const csvPreviewSource = extractBetween(
    source,
    "disabled={confirmingCsvImport || !csvPreviewResult.validCount}",
    "{(csvPreviewResult.preview || []).map((row) => ("
  );

  assert.match(source, /grid mobile-stack-grid w-full min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,12rem\),1fr\)\)\] gap-3 lg:max-w-\[30rem\]/);
  assert.match(source, /grid mobile-stack-grid w-full min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,11rem\),1fr\)\)\] gap-3 lg:max-w-\[42rem\] xl:w-auto/);
  assert.match(source, /button-secondary w-full justify-center gap-2 whitespace-normal text-center/);

  assert.match(source, /mt-6 w-full max-w-full overflow-x-auto pb-2/);
  assert.match(source, /grid h-\[250px\] min-w-\[28rem\] grid-cols-5 items-end gap-3/);
  assert.match(weeklyChartSource, /const formattedTotal = money\.format\(entry\.total\)/);
  assert.match(weeklyChartSource, /whitespace-nowrap text-sm font-semibold leading-tight tabular-nums" title=\{formattedTotal\}/);
  assert.doesNotMatch(weeklyChartSource, /<div className="mt-6 grid h-\[250px\] grid-cols-5 items-end gap-3">/);

  assert.match(summaryActionsSource, /grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,12rem\),1fr\)\)\] gap-4/);
  assert.match(summaryActionsSource, /<span className="min-w-0 whitespace-normal">\s*\{sendingSummaryEmail \? [\s\S]*?<\/span>/);
  assert.match(summaryActionsSource, /<span className="min-w-0 whitespace-normal">\s*\{downloadingSummaryKey === "monthly" \? [\s\S]*?<\/span>/);
  assert.doesNotMatch(summaryActionsSource, /mt-6 grid gap-4 sm:grid-cols-2/);
  assert.doesNotMatch(summaryActionsSource, /mt-4 grid gap-4 sm:grid-cols-2/);

  assert.match(source, /grid mobile-stack-grid w-full min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,11rem\),1fr\)\)\] gap-3 lg:max-w-\[42rem\] xl:w-auto/);
  assert.match(source, /button-primary w-full justify-center gap-2 whitespace-normal text-center/);
  assert.match(csvPreviewSource, /button-secondary w-full justify-center whitespace-normal text-center/);
  assert.match(csvPreviewSource, /<Download className="shrink-0" size=\{16\} \/>/);
});

test("Saving Studio six month chart accepts server monthlyTotals without labels", () => {
  const source = readPageSource();
  const sixMonthChartSource = extractSixMonthChartSource(source);

  assert.match(source, /formatChartMonthLabel,/);
  assert.match(source, /const monthlyTotals = Array\.isArray\(summary\?\.monthlyTotals\) \? summary\.monthlyTotals : \[\]/);
  assert.match(sixMonthChartSource, /monthlyTotals\.map\(\(entry, index\) => \{/);
  assert.match(sixMonthChartSource, /const safeTotal = Number\(entry\?\.total \|\| 0\)/);
  assert.match(sixMonthChartSource, /const monthLabel = formatChartMonthLabel\(entry\)/);
  assert.match(sixMonthChartSource, /\{monthLabel\}/);
  assert.doesNotMatch(sixMonthChartSource, /entry\.label\.split/);
});

test("Personal member workspace has a mobile viewport overflow safety net", () => {
  const cssSource = readCssSource();

  assert.match(cssSource, /@media \(max-width: 768px\) \{[\s\S]*?\.member-workspace,/);
  assert.match(cssSource, /\.member-workspace-personal,/);
  assert.match(cssSource, /\.member-workspace \.panel,/);
  assert.match(cssSource, /\.member-workspace \.soft-card-strong \{[\s\S]*?min-width: 0;[\s\S]*?max-width: 100%;/);
  assert.match(cssSource, /\.member-workspace > \*,[\s\S]*?\.member-workspace \.soft-card-strong > \* \{[\s\S]*?min-width: 0;/);
  assert.match(cssSource, /\.member-workspace img,[\s\S]*?\.member-workspace svg \{[\s\S]*?max-width: 100%;/);
  assert.match(cssSource, /\.member-workspace \.button-primary,[\s\S]*?\.member-workspace \.hero-outline-button \{[\s\S]*?max-width: 100%;[\s\S]*?white-space: normal;/);
  assert.match(cssSource, /\.member-workspace input,[\s\S]*?\.member-workspace textarea \{[\s\S]*?min-width: 0;[\s\S]*?max-width: 100%;/);
  assert.match(cssSource, /\.member-workspace p,[\s\S]*?\.member-workspace li \{[\s\S]*?overflow-wrap: anywhere;/);
  assert.match(cssSource, /@layer utilities \{[\s\S]*?@media \(max-width: 768px\) \{[\s\S]*?\.member-workspace \.mobile-stack-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) !important;/);
  assert.match(cssSource, /\.member-workspace-personal #savings-ledger,[\s\S]*?\.member-workspace-personal #savings-ledger button \{[\s\S]*?min-width: 0 !important;[\s\S]*?width: 100% !important;[\s\S]*?max-width: 100% !important;/);
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

test("Saving Studio forms guard against duplicate submit at handler level", () => {
  const source = readPageSource();

  assert.match(source, /const handleSaveOnboarding = async[\s\S]*if \(savingOnboarding\) \{[\s\S]*return;/);
  assert.match(source, /const handleSaveBudgets = async[\s\S]*if \(savingBudgets \|\| loadingBudgets\) \{[\s\S]*return;/);
  assert.match(source, /const handleEntrySubmit = async[\s\S]*if \(submitting\) \{[\s\S]*return;/);
  assert.match(source, /const handleGoalSubmit = async[\s\S]*if \(savingGoal\) \{[\s\S]*return;/);
  assert.match(source, /const handleRecurringSubmit = async[\s\S]*if \(savingRecurring\) \{[\s\S]*return;/);
  assert.match(source, /const handleLogRecurringExpense = async[\s\S]*if \(loggingRecurringId \|\| recurringExpense\.lastLoggedMonth === currentRecurringMonth\)/);
  assert.match(source, /const handleConfirmCsvImport = async[\s\S]*if \(confirmingCsvImport\) \{[\s\S]*return;/);
  assert.match(source, /const handleDownloadSummary = async[\s\S]*if \(downloadingSummaryKey\) \{[\s\S]*return;/);
  assert.match(source, /const handleDownloadEntriesCsv = async[\s\S]*if \(downloadingCsvKey\) \{[\s\S]*return;/);
  assert.match(source, /const handleDownloadBackup = async[\s\S]*if \(downloadingBackup\) \{[\s\S]*return;/);
  assert.match(source, /const handleDelete = async[\s\S]*if \(deletingId\) \{[\s\S]*return;/);
  assert.match(source, /const handleDeleteGoal = async[\s\S]*if \(deletingGoalId\) \{[\s\S]*return;/);
  assert.match(source, /const handleDeleteRecurring = async[\s\S]*if \(deletingRecurringId\) \{[\s\S]*return;/);
});

test("Saving Studio downloads selected month as TXT and CSV with safe Blob cleanup", () => {
  const source = readPageSource();
  const serviceSource = readServiceSource();
  const downloadSource = extractBetween(
    source,
    "const handleDownloadSummary = async (monthOverride = \"\") => {",
    "const handleDelete = async"
  );

  assert.match(serviceSource, /window\.URL\.createObjectURL\(blob\)/);
  assert.match(serviceSource, /window\.URL\.revokeObjectURL\(objectUrl\)/);
  assert.match(serviceSource, /const sanitizeDownloadFilename = /);
  assert.match(serviceSource, /const downloadSummaryFile = async \(\{ month, format = "txt" \}\) =>/);
  assert.match(serviceSource, /params: \{ frequency: "monthly", format, month \}/);
  assert.match(serviceSource, /const downloadEntriesCsv = async \(\{ month, scope = "month" \}\) =>/);
  assert.match(serviceSource, /\/savings-studio\/entries-export/);
  assert.match(serviceSource, /scope === "all" \? \{ scope: "all" \} : \{ month \}/);

  assert.ok(downloadSource.includes('const reportMonth = /^\\d{4}-\\d{2}$/.test(String(monthOverride || "")) ? monthOverride : selectedBudgetMonth;'));
  assert.match(downloadSource, /downloadSummaryFile\(\{ month: reportMonth, format: "txt" \}\)/);
  assert.match(downloadSource, /downloadEntriesCsv\(\{ month: selectedBudgetMonth, scope \}\)/);
  assert.match(source, /const \[downloadingCsvKey, setDownloadingCsvKey\] = useState\(""\)/);
  assert.match(source, /disabled=\{Boolean\(downloadingCsvKey\)\}/);
  assert.match(source, /Atsisiųsti \$\{selectedBudgetMonth\} CSV/);
  assert.match(source, /Atsisiųsti visų įrašų CSV/);
  assert.doesNotMatch(source, /Atsisiųsti savaitės TXT/);
  assert.match(source, /Atsisiųsti mėnesio TXT/);
  assert.match(source, /name="summaryEmailFrequency"/);
  assert.match(source, /<option value="weekly">/);
  assert.match(source, /onClick=\{handleDownloadSummary\}/);
  assert.doesNotMatch(source, /handleDownloadSummary\("weekly"\)/);
  assert.match(source, /grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-3/);
});

test("Saving Studio summary archive only offers TXT generation for monthly exports", () => {
  const source = readPageSource();
  const summaryArchiveSource = extractComponentSource(source, "SummaryArchiveItem", "CoachSignalCard");

  assert.ok(summaryArchiveSource.includes('const archiveMonth = /^\\d{4}-\\d{2}$/.test(String(item.metadata?.month || "")) ? item.metadata.month : "";'));
  assert.ok(summaryArchiveSource.includes('const canDownloadMonthlyTxt = item.action === "summary-export" && frequency === "monthly";'));
  assert.match(summaryArchiveSource, /\{canDownloadMonthlyTxt \? \(/);
  assert.match(summaryArchiveSource, /onClick=\{\(\) => onDownload\(archiveMonth\)\}/);
  assert.match(summaryArchiveSource, /archiveMonth \? `Sugeneruoti \$\{archiveMonth\} TXT` : "Sugeneruoti/);
  assert.match(summaryArchiveSource, /onClick=\{\(\) => onSend\(frequency\)\}/);
  assert.doesNotMatch(summaryArchiveSource, /onClick=\{onDownload\}/);
  assert.doesNotMatch(summaryArchiveSource, />Atsisi[^<]*sti v[^<]*l<\/span>/);
});

test("Saving Studio CSV import validates file type and size before preview request", () => {
  const source = readPageSource();
  const csvHandlerSource = extractBetween(
    source,
    "const handleCsvImport = async (event) => {",
    "const handleConfirmCsvImport = async () => {"
  );

  assert.match(source, /const MAX_CSV_FILE_SIZE_BYTES = 1024 \* 1024/);
  assert.match(csvHandlerSource, /file\.name\.toLowerCase\(\)\.endsWith\("\.csv"\)/);
  assert.match(csvHandlerSource, /"text\/csv", "application\/vnd\.ms-excel", ""/);
  assert.match(csvHandlerSource, /if \(file\.size > MAX_CSV_FILE_SIZE_BYTES\)/);
  assert.match(csvHandlerSource, /Pasirink CSV formato failą/);
  assert.match(csvHandlerSource, /CSV failas per didelis/);
});

test("Saving Studio automation CTA stays inside mobile cards", () => {
  const source = readPageSource();
  const automationCardMatch = source.match(/const AutomationTriggerCard = \(\{ onRun, trigger \}\) => \{[\s\S]*?const ImportInsightCard/);
  assert.ok(automationCardMatch);
  const automationCardSource = automationCardMatch[0];

  assert.match(source, /actionLabel: "[^"]*savait[^"]*suvestin[^"]*"/);
  assert.match(
    source,
    /mt-6 grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-4[\s\S]*label="[^"]+"[\s\S]*label="[^"]+"[\s\S]*label="[^"]+"/
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

  assert.match(goalStrategyMetricsSource, /grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-4/);
  assert.match(goalStrategyMetricsSource, /label="Aktyv[^"]* tikslai"/);
  assert.match(goalStrategyMetricsSource, /label="Fokusuoti dabar"/);
  assert.match(goalStrategyMetricsSource, /label="Did[^"]*iausias m[^"]*n\. tempas"/);
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
    '<h2 className="mt-3 font-display text-3xl font-bold leading-tight">Tavo ai',
    '<p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">usage guide</p>'
  );
  const monthMetricsSource = extractMetricGridBefore(source, "icon={PiggyBank}");
  const focusMetricsSource = extractMetricGridBefore(source, "icon={AlertTriangle}");
  const safeGrid = /grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\]/;

  assert.match(heroPanelSource, /mt-5 grid mobile-stack-grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-3/);
  assert.match(heroPanelSource, /label="[^"]*is m[^"]*nuo"/);
  assert.match(heroPanelSource, /label="Tikslai"/);
  assert.match(heroPanelSource, /label="Pastovios"/);
  assert.match(heroPanelSource, /label="Laisva suma"/);
  assert.doesNotMatch(heroPanelSource, /sm:grid-cols-[23]/);

  assert.match(monthMetricsSource, safeGrid);
  assert.match(monthMetricsSource, /gap-4/);
  assert.match(monthMetricsSource, /label="[^"]*is m[^"]*nuo"/);
  assert.match(monthMetricsSource, /label="Po pastovi[^"]* i[^"]*laid[^"]*"/);
  assert.match(monthMetricsSource, /label="Pastovios i[^"]*laidos"/);
  assert.doesNotMatch(monthMetricsSource, /sm:grid-cols-[23]/);

  assert.match(focusMetricsSource, safeGrid);
  assert.match(focusMetricsSource, /gap-4/);
  assert.match(focusMetricsSource, /label="Tikslai"/);
  assert.match(focusMetricsSource, /label="Did[^"]*iausias spaudimas"/);
  assert.match(focusMetricsSource, /label="Laisva suma"/);
  assert.doesNotMatch(focusMetricsSource, /sm:grid-cols-[23]/);
});

test("Six month chart scrolls internally without hiding labels or values", () => {
  const source = readPageSource();
  const sixMonthSource = extractSixMonthChartSource(source);

  assert.match(sixMonthSource, /mt-6 w-full max-w-full overflow-x-auto pb-2/);
  assert.match(sixMonthSource, /grid h-\[260px\] min-w-\[32rem\] grid-cols-6 items-end gap-3/);
  assert.match(sixMonthSource, /flex h-full min-w-0 flex-col items-center justify-end gap-3/);
  assert.match(sixMonthSource, /min-w-0 w-full text-center/);
  assert.match(sixMonthSource, /whitespace-nowrap text-\[0\.68rem\] font-semibold uppercase tracking-normal text-muted/);
  assert.match(sixMonthSource, /const formattedTotal = money\.format\(safeTotal\)/);
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
  assert.match(summaryArchiveSource, /Sugeneruoti \$\{archiveMonth\} TXT/);
  assert.match(summaryArchiveSource, /Sugeneruoti/);
  assert.match(summaryArchiveSource, /<span className="min-w-0 whitespace-normal break-normal">Si[^<]*sti dar kart[^<]*<\/span>/);
  assert.match(summaryArchiveSource, /<Download className="shrink-0" size=\{14\} \/>/);
  assert.match(summaryArchiveSource, /<Mail className="shrink-0" size=\{14\} \/>/);
  assert.doesNotMatch(summaryArchiveSource, /sm:flex-row/);
  assert.doesNotMatch(summaryArchiveSource, /sm:shrink-0/);
  assert.doesNotMatch(summaryArchiveSource, /whitespace-nowrap/);
});

test("Personal member area shared cards stay width-safe from 320 to 768 px", () => {
  const memberAreaSource = readMemberAreaSource();
  const digitalGridSource = readDigitalProductAccessGridSource();

  assert.match(memberAreaSource, /soft-card min-w-0 rounded-lg p-4 sm:p-5/);
  assert.match(memberAreaSource, /grid w-full min-w-0 max-w-full gap-2 sm:grid-cols-2 lg:max-w-\[520px\]/);
  assert.doesNotMatch(memberAreaSource, /lg:min-w-\[520px\]/);
  assert.match(memberAreaSource, /marketing-card flex h-full min-w-0 max-w-full flex-col/);
  assert.match(memberAreaSource, /member-executive-surface min-w-0 rounded-lg/);
  assert.doesNotMatch(memberAreaSource, /member-executive-surface overflow-hidden/);
  assert.match(memberAreaSource, /mt-6 grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,13rem\),1fr\)\)\] gap-3/);
  assert.match(memberAreaSource, /button-primary mt-5 w-full justify-center gap-2 whitespace-normal sm:w-auto/);

  assert.match(digitalGridSource, /group flex h-full min-w-0 max-w-full flex-col rounded-lg/);
  assert.doesNotMatch(digitalGridSource, /group flex h-full flex-col overflow-hidden/);
  assert.match(digitalGridSource, /mt-5 grid min-w-0 grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,8rem\),1fr\)\)\] gap-3/);
  assert.match(digitalGridSource, /w-full max-w-full whitespace-normal text-center/);
  assert.match(digitalGridSource, /w-full min-w-0 sm:max-w-\[13rem\]/);
  assert.doesNotMatch(digitalGridSource, /sm:min-w-\[13rem\]/);
});
