const crypto = require("node:crypto");

const RecurringExpense = require("../models/RecurringExpense");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const { sendSavingsSummaryEmail } = require("../services/savingsStudioSummaryEmailService");
const { logSavingsAuditSafe } = require("../services/savingsStudioAuditService");
const {
  buildSavingsSummary,
  currentDateKey,
  currentMonthKey,
  getLoggedRecurringIdsForMonth,
  getEntryMonthKey,
  isStrictDateKey,
  isStrictMonthKey,
  moneyAmount,
  recurringMonthlyEquivalent,
} = require("../../shared/savingsStudioCalculations.cjs");

const CATEGORIES = [
  "Būstas",
  "Maistas",
  "Transportas",
  "Sveikata",
  "Apsipirkimas",
  "Sąskaitos",
  "Kelionės",
  "Pramogos",
  "Kita",
];

const FOCUS_OPTIONS = [
  "Sumažinti kasdienes išlaidas",
  "Susikurti finansinį aiškumą",
  "Sutaupyti kelionei",
  "Sukaupti rezervą",
  "Suvaldyti laisvalaikio išlaidas",
];

const RECURRING_FREQUENCIES = [
  { value: "weekly", label: "Kas savaitę" },
  { value: "monthly", label: "Kas mėnesį" },
  { value: "quarterly", label: "Kas ketvirtį" },
  { value: "yearly", label: "Kartą per metus" },
];

const MAX_TEXT_LENGTH = 80;
const MAX_NOTES_LENGTH = 240;
const MAX_MONEY_AMOUNT = 100000000;
const MAX_IMPORT_ROWS = 300;
const MAX_ACTIVITY_ROWS = 36;
const MAX_EXPORT_ROWS = 5000;
const BACKUP_SCHEMA_VERSION = "saving-studio-backup.v1";

const buildDownloadTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");
const roundCurrency = (value) => moneyAmount(value);
const moneyFormatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const formatMoney = (value) => moneyFormatter.format(Number(value || 0));
const safeDownloadFileName = (value) => String(value || "download").replace(/[^a-zA-Z0-9._-]/g, "_");

const toPlainObject = (value) => {
  if (value && typeof value.toObject === "function") {
    return value.toObject();
  }

  return value || {};
};

const documentId = (value) => {
  const plain = toPlainObject(value);
  return plain._id ? String(plain._id) : "";
};

const serializeDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const serializeSavingsProfileBackup = (profile) => {
  const plain = toPlainObject(profile);

  return {
    id: documentId(plain),
    onboardingCompleted: Boolean(plain.onboardingCompleted),
    monthlyIncome: moneyAmount(plain.monthlyIncome),
    monthlySavingsTarget: moneyAmount(plain.monthlySavingsTarget),
    primaryFocus: String(plain.primaryFocus || ""),
    summaryEmailsEnabled: Boolean(plain.summaryEmailsEnabled),
    summaryEmailFrequency: ["weekly", "monthly"].includes(plain.summaryEmailFrequency)
      ? plain.summaryEmailFrequency
      : "weekly",
    summaryEmailLastSentAt: serializeDateValue(plain.summaryEmailLastSentAt),
    createdAt: serializeDateValue(plain.createdAt),
    updatedAt: serializeDateValue(plain.updatedAt),
  };
};

const serializeImportSourceBackup = (importSource = {}) => ({
  system: String(importSource.system || ""),
  entryId: String(importSource.entryId || ""),
});

const serializeSavingsEntryBackup = (entry) => {
  const plain = toPlainObject(entry);

  return {
    id: documentId(plain),
    title: String(plain.title || ""),
    amount: moneyAmount(plain.amount),
    category: String(plain.category || ""),
    date: String(plain.date || ""),
    notes: String(plain.notes || ""),
    importSource: serializeImportSourceBackup(plain.importSource),
    importFingerprint: String(plain.importFingerprint || ""),
    createdAt: serializeDateValue(plain.createdAt),
    updatedAt: serializeDateValue(plain.updatedAt),
  };
};

const serializeSavingsBudgetBackup = (budget) => {
  const plain = toPlainObject(budget);

  return {
    id: documentId(plain),
    month: String(plain.month || ""),
    category: String(plain.category || ""),
    limitAmount: moneyAmount(plain.limitAmount),
    createdAt: serializeDateValue(plain.createdAt),
    updatedAt: serializeDateValue(plain.updatedAt),
  };
};

const serializeSavingsGoalBackup = (goal) => {
  const plain = toPlainObject(goal);

  return {
    id: documentId(plain),
    title: String(plain.title || ""),
    targetAmount: moneyAmount(plain.targetAmount),
    currentAmount: moneyAmount(plain.currentAmount),
    targetDate: String(plain.targetDate || ""),
    notes: String(plain.notes || ""),
    createdAt: serializeDateValue(plain.createdAt),
    updatedAt: serializeDateValue(plain.updatedAt),
  };
};

const serializeRecurringExpenseBackup = (expense) => {
  const plain = toPlainObject(expense);

  return {
    id: documentId(plain),
    title: String(plain.title || ""),
    amount: moneyAmount(plain.amount),
    category: String(plain.category || ""),
    frequency: RECURRING_FREQUENCIES.some((entry) => entry.value === plain.frequency)
      ? plain.frequency
      : "monthly",
    notes: String(plain.notes || ""),
    lastLoggedMonth: String(plain.lastLoggedMonth || ""),
    createdAt: serializeDateValue(plain.createdAt),
    updatedAt: serializeDateValue(plain.updatedAt),
  };
};

const csvTextCell = (value) => {
  const rawValue = value === null || value === undefined ? "" : String(value);
  const formulaSafeValue = /^[\s\u0000-\u001f]*[=+\-@]/.test(rawValue) ? `'${rawValue}` : rawValue;

  return `"${formulaSafeValue.replace(/"/g, '""')}"`;
};

const csvSafeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const csvAmountCell = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw createHttpError("Eksporte rastas netinkamas sumos formatas.", 500);
  }

  return amount.toFixed(2);
};

const buildEntriesCsv = (entries) => {
  const headers = ["date", "title", "category", "amount_eur", "notes", "source"];
  const rows = (Array.isArray(entries) ? entries : []).map((entry) => [
    csvSafeCell(entry.date || ""),
    csvTextCell(entry.title || ""),
    csvTextCell(entry.category || ""),
    csvAmountCell(entry.amount),
    csvTextCell(entry.notes || ""),
    csvTextCell(entry.importSource?.system || ""),
  ]);

  return `\uFEFF${[headers.map(csvSafeCell), ...rows].map((row) => row.join(",")).join("\r\n")}\r\n`;
};

const sortEntries = (entries) =>
  [...entries].sort((left, right) => {
    const dateOrder = right.date.localeCompare(left.date);

    if (dateOrder !== 0) {
      return dateOrder;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

const parseMonthKey = (value, fallback = currentMonthKey()) => {
  const month = String(value || fallback).trim();

  if (!isStrictMonthKey(month)) {
    throw createHttpError("Naudok galiojantį mėnesio formatą YYYY-MM.");
  }

  const parsedMonth = Number(month.slice(5, 7));

  if (parsedMonth < 1 || parsedMonth > 12) {
    throw createHttpError("Naudok galiojantį mėnesio formatą YYYY-MM.");
  }

  return month;
};

const isValidDateKey = (value) => isStrictDateKey(value);

const parseEntryInput = (input) => {
  const title = String(input.title || "").trim();
  const notes = String(input.notes || "").trim();
  const category = String(input.category || "").trim();
  const date = String(input.date || "").trim();
  const amount = Number(input.amount);

  if (title.length < 2) {
    throw createHttpError("Išlaidos pavadinimui reikia bent 2 simbolių.");
  }

  if (title.length > MAX_TEXT_LENGTH) {
    throw createHttpError("Išlaidos pavadinimas per ilgas.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError("Suma turi būti didesnė už 0.");
  }

  if (amount > MAX_MONEY_AMOUNT) {
    throw createHttpError("Įvesta suma per didelė.");
  }

  if (!isValidDateKey(date)) {
    throw createHttpError("Įvesk galiojančią išlaidų datą.");
  }

  if (!CATEGORIES.includes(category)) {
    throw createHttpError("Pasirink galiojančią kategoriją.");
  }

  return {
    title,
    amount: roundCurrency(amount),
    category,
    date,
    notes: notes.slice(0, MAX_NOTES_LENGTH),
  };
};

const parseBudgetPayload = (input) => {
  const month = parseMonthKey(input.month);
  const budgets = Array.isArray(input.budgets) ? input.budgets : [];

  const normalizedBudgetMap = new Map();

  budgets
    .map((budget) => ({
      category: String(budget.category || "").trim(),
      limitAmount: Number(budget.limitAmount),
    }))
    .filter((budget) => budget.category && Number.isFinite(budget.limitAmount) && budget.limitAmount > 0)
    .forEach((budget) => {
      normalizedBudgetMap.set(budget.category, budget);
    });

  const normalizedBudgets = [...normalizedBudgetMap.values()];

  for (const budget of normalizedBudgets) {
    if (!CATEGORIES.includes(budget.category)) {
      throw createHttpError(`Biudžeto kategorija negalioja: ${budget.category}`);
    }
  }

  if (normalizedBudgets.some((budget) => budget.limitAmount > MAX_MONEY_AMOUNT)) {
    throw createHttpError("Įvesta suma per didelė.");
  }

  if (normalizedBudgets.length > CATEGORIES.length) {
    throw createHttpError("Biudžetų eilučių per daug vienam mėnesiui.");
  }

  return {
    month,
    budgets: normalizedBudgets.map((budget) => ({
      ...budget,
      limitAmount: roundCurrency(budget.limitAmount),
    })),
  };
};

const parseGoalInput = (input) => {
  const title = String(input.title || "").trim();
  const notes = String(input.notes || "").trim();
  const targetDate = String(input.targetDate || "").trim();
  const targetAmount = Number(input.targetAmount);
  const currentAmount = Number(input.currentAmount || 0);

  if (title.length < 2) {
    throw createHttpError("Tikslo pavadinimui reikia bent 2 simbolių.");
  }

  if (title.length > MAX_TEXT_LENGTH) {
    throw createHttpError("Tikslo pavadinimas per ilgas.");
  }

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw createHttpError("Tikslo suma turi būti didesnė už 0.");
  }

  if (targetAmount > MAX_MONEY_AMOUNT || currentAmount > MAX_MONEY_AMOUNT) {
    throw createHttpError("Įvesta suma per didelė.");
  }

  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    throw createHttpError("Dabartinė sukaupta suma negali būti neigiama.");
  }

  if (targetDate && !isValidDateKey(targetDate)) {
    throw createHttpError("Naudok galiojančią tikslo datą YYYY-MM-DD formatu.");
  }

  return {
    title,
    targetAmount: roundCurrency(targetAmount),
    currentAmount: roundCurrency(currentAmount),
    targetDate,
    notes: notes.slice(0, MAX_NOTES_LENGTH),
  };
};

const parseRecurringInput = (input) => {
  const title = String(input.title || "").trim();
  const notes = String(input.notes || "").trim();
  const category = String(input.category || "").trim();
  const frequency = String(input.frequency || "monthly").trim();
  const amount = Number(input.amount);

  if (amount > MAX_MONEY_AMOUNT) {
    throw createHttpError("Įvesta suma per didelė.");
  }

  if (title.length < 2) {
    throw createHttpError("Pasikartojančios išlaidos pavadinimui reikia bent 2 simbolių.");
  }

  if (title.length > MAX_TEXT_LENGTH) {
    throw createHttpError("Pasikartojančios išlaidos pavadinimas per ilgas.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError("Suma turi būti didesnė už 0.");
  }

  if (!CATEGORIES.includes(category)) {
    throw createHttpError("Pasirink galiojančią kategoriją.");
  }

  if (!RECURRING_FREQUENCIES.some((entry) => entry.value === frequency)) {
    throw createHttpError("Pasirink galiojantį periodiškumą.");
  }

  return {
    title,
    amount: roundCurrency(amount),
    category,
    frequency,
    notes: notes.slice(0, MAX_NOTES_LENGTH),
  };
};

const parseProfileInput = (input) => {
  const monthlyIncome = Number(input.monthlyIncome || 0);
  const monthlySavingsTarget = Number(input.monthlySavingsTarget || 0);
  const primaryFocus = String(input.primaryFocus || "").trim();
  const onboardingCompleted = Boolean(input.onboardingCompleted);

  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    throw createHttpError("Mėnesio pajamos negali būti neigiamos.");
  }

  if (monthlyIncome > MAX_MONEY_AMOUNT || monthlySavingsTarget > MAX_MONEY_AMOUNT) {
    throw createHttpError("Įvesta suma per didelė.");
  }

  if (!Number.isFinite(monthlySavingsTarget) || monthlySavingsTarget < 0) {
    throw createHttpError("Mėnesio taupymo tikslas negali būti neigiamas.");
  }

  if (primaryFocus && !FOCUS_OPTIONS.includes(primaryFocus)) {
    throw createHttpError("Pasirink vieną iš siūlomų pagrindinių fokusų.");
  }

  return {
    monthlyIncome: roundCurrency(monthlyIncome),
    monthlySavingsTarget: roundCurrency(monthlySavingsTarget),
    primaryFocus,
    onboardingCompleted,
  };
};

const parseEmailSettingsInput = (input) => {
  const summaryEmailsEnabled = Boolean(input.summaryEmailsEnabled);
  const summaryEmailFrequency = String(input.summaryEmailFrequency || "weekly").trim();

  if (!["weekly", "monthly"].includes(summaryEmailFrequency)) {
    throw createHttpError("Pasirink galiojantį suvestinių dažnį.");
  }

  return {
    summaryEmailsEnabled,
    summaryEmailFrequency,
  };
};

const buildImportSource = ({ system = "", entryId = "" } = {}) => ({
  system: String(system || "").trim(),
  entryId: String(entryId || "").trim(),
});

const normalizeFingerprintText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const buildEntryFingerprint = (entry) => {
  const title = normalizeFingerprintText(entry?.title);
  const amount = Number(entry?.amount || 0).toFixed(2);
  const date = String(entry?.date || "").trim();
  const category = normalizeFingerprintText(entry?.category);

  return `${date}__${amount}__${title}__${category}`;
};

const buildEntryImportFingerprint = (entry) => {
  const canonicalPayload = JSON.stringify({
    title: normalizeFingerprintText(entry?.title),
    amount: Number(entry?.amount || 0).toFixed(2),
    date: String(entry?.date || "").trim(),
    category: normalizeFingerprintText(entry?.category),
  });

  return crypto.createHash("sha256").update(canonicalPayload).digest("hex");
};

const buildRecurringLogFingerprint = ({ month, recurringId }) => {
  const canonicalPayload = JSON.stringify({
    system: "recurring-expense",
    recurringId: String(recurringId || "").trim(),
    month: String(month || "").trim(),
  });

  return crypto.createHash("sha256").update(canonicalPayload).digest("hex");
};

const findDuplicateImportedRows = async ({ rows, userId }) => {
  if (!rows.length) {
    return {
      duplicateFingerprints: new Set(),
      inputDuplicateIndexes: new Set(),
    };
  }

  const rowsWithFingerprints = rows.map((row) => ({
    ...row,
    importFingerprint: buildEntryImportFingerprint(row),
  }));
  const existingEntries = await SavingsEntry.find({
    user: userId,
    $or: [
      { importFingerprint: { $in: [...new Set(rowsWithFingerprints.map((row) => row.importFingerprint))] } },
      { date: { $in: [...new Set(rowsWithFingerprints.map((row) => row.date))] } },
    ],
  }).select("title amount date category importFingerprint");
  const duplicateFingerprints = new Set([
    ...existingEntries.map(buildEntryFingerprint),
    ...existingEntries.map((entry) => entry.importFingerprint).filter(Boolean),
  ]);
  const seenInputFingerprints = new Set();
  const inputDuplicateIndexes = new Set();

  rowsWithFingerprints.forEach((row, index) => {
    const fingerprint = row.importFingerprint;

    if (seenInputFingerprints.has(fingerprint)) {
      inputDuplicateIndexes.add(index);
    }

    seenInputFingerprints.add(fingerprint);
  });

  return {
    duplicateFingerprints,
    inputDuplicateIndexes,
  };
};

const recurringToMonthlyEquivalent = (expense) => {
  return recurringMonthlyEquivalent(expense);
};

const decorateRecurringExpense = (expense) => ({
  ...expense.toObject(),
  monthlyEquivalent: recurringToMonthlyEquivalent(expense),
});

const createImportedEntry = async ({ entry, rowNumber, userId }) => {
  const importFingerprint = buildEntryImportFingerprint(entry);

  try {
    const createdEntry = await SavingsEntry.create({
      user: userId,
      ...entry,
      importFingerprint,
      importSource: buildImportSource({ system: "csv-upload" }),
    });

    return {
      entry: createdEntry,
      duplicate: null,
    };
  } catch (error) {
    if (error?.code === 11000) {
      return {
        entry: null,
        duplicate: {
          rowNumber,
          status: "duplicate",
          error: "Toks įrašas jau importuotas anksčiau.",
          normalized: entry,
        },
      };
    }

    throw error;
  }
};

const monthsUntilTargetDate = (targetDate) => {
  if (!targetDate) {
    return null;
  }

  const today = new Date();
  const target = new Date(`${targetDate}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const rawMonths =
    (target.getUTCFullYear() - today.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - today.getUTCMonth()) +
    1;

  return Math.max(rawMonths, 1);
};

const buildInsights = ({ budgets, entries, goals, profile, recurringExpenses, summary }) => {
  const monthKey = parseMonthKey(summary.month, currentMonthKey());
  const currentMonthSpent = Number(summary.monthTotal || 0);
  const loggedRecurringIds = getLoggedRecurringIdsForMonth(entries, monthKey);
  const outstandingRecurringExpenses = recurringExpenses.filter(
    (recurringExpense) => !loggedRecurringIds.has(String(recurringExpense._id || "").trim())
  );
  const recurringMonthlyTotal = roundCurrency(
    outstandingRecurringExpenses.reduce((sum, recurringExpense) => sum + recurringToMonthlyEquivalent(recurringExpense), 0)
  );
  const recurringByCategory = outstandingRecurringExpenses.reduce((totals, recurringExpense) => {
    const nextTotals = { ...totals };
    nextTotals[recurringExpense.category] = roundCurrency(
      Number(nextTotals[recurringExpense.category] || 0) + recurringToMonthlyEquivalent(recurringExpense)
    );
    return nextTotals;
  }, {});
  const currentMonthEntries = entries.filter((entry) => entry.date.startsWith(monthKey));
  const loggedRecurringTotal = roundCurrency(
    currentMonthEntries
      .filter((entry) => entry.importSource?.system === "recurring-expense")
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
  );
  const flexibleSpendTotal = roundCurrency(Math.max(currentMonthSpent - loggedRecurringTotal, 0));
  const spentByCategory = new Map(
    (summary.categoryTotals || []).map((entry) => [entry.category, Number(entry.total || 0)])
  );
  const budgetProgress = budgets
    .map((budget) => {
      const spent = Number(spentByCategory.get(budget.category) || 0);
      const recurringCommitted = Number(recurringByCategory[budget.category] || 0);
      const projectedSpent = roundCurrency(spent + recurringCommitted);

      return {
        category: budget.category,
        limitAmount: Number(budget.limitAmount || 0),
        spent,
        recurringCommitted,
        projectedSpent,
        ratio: budget.limitAmount ? projectedSpent / Number(budget.limitAmount) : 0,
      };
    })
    .filter((entry) => entry.limitAmount > 0)
    .sort((left, right) => right.ratio - left.ratio);

  const projectedMonthTotal = roundCurrency(currentMonthSpent + recurringMonthlyTotal);
  const monthlyIncome = roundCurrency(Number(profile.monthlyIncome || 0));
  const safeToSaveAfterRecurring = roundCurrency(monthlyIncome - projectedMonthTotal);
  const categoryPressure = budgetProgress
    .slice(0, 5)
    .map((entry) => ({
      category: entry.category,
      projectedSpent: entry.projectedSpent,
      limitAmount: entry.limitAmount,
      shareOfProjected: projectedMonthTotal > 0 ? roundCurrency((entry.projectedSpent / projectedMonthTotal) * 100) : 0,
      status:
        entry.projectedSpent > entry.limitAmount
          ? "over"
          : entry.projectedSpent >= entry.limitAmount * 0.85
          ? "warning"
          : "healthy",
    }));
  const savingsCapacity = {
    income: monthlyIncome,
    currentMonthSpent,
    projectedMonthTotal,
    afterActual: roundCurrency(monthlyIncome - currentMonthSpent),
    afterProjected: safeToSaveAfterRecurring,
    target: Number(profile.monthlySavingsTarget || 0),
  };
  const fixedVsFlexible = {
    loggedRecurring: loggedRecurringTotal,
    recurringRemaining: recurringMonthlyTotal,
    fixedProjected: roundCurrency(loggedRecurringTotal + recurringMonthlyTotal),
    flexibleSpent: flexibleSpendTotal,
  };

  const overBudget = budgetProgress.filter((entry) => entry.projectedSpent > entry.limitAmount);
  const warningBudget = budgetProgress.filter(
    (entry) => entry.projectedSpent <= entry.limitAmount && entry.projectedSpent >= entry.limitAmount * 0.85
  );
  const topCategory = summary.categoryTotals?.[0];
  const activeGoals = goals.filter((goal) => Number(goal.currentAmount || 0) < Number(goal.targetAmount || 0));
  const nearestGoal = activeGoals
    .map((goal) => {
      const remaining = roundCurrency(Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0));
      const monthsLeft = monthsUntilTargetDate(goal.targetDate);

      return {
        ...goal.toObject(),
        remaining,
        monthsLeft,
        recommendedMonthly: monthsLeft ? roundCurrency(remaining / monthsLeft) : null,
      };
    })
    .sort((left, right) => {
      if (left.monthsLeft && right.monthsLeft) {
        return left.monthsLeft - right.monthsLeft;
      }

      if (left.monthsLeft) {
        return -1;
      }

      if (right.monthsLeft) {
        return 1;
      }

      return left.remaining - right.remaining;
    })[0];
  const goalPace = nearestGoal?.recommendedMonthly
    ? {
        title: nearestGoal.title,
        targetDate: nearestGoal.targetDate,
        remaining: nearestGoal.remaining,
        recommendedMonthly: nearestGoal.recommendedMonthly,
        monthsLeft: nearestGoal.monthsLeft,
        status:
          profile.monthlySavingsTarget > 0 && nearestGoal.recommendedMonthly > Number(profile.monthlySavingsTarget)
            ? "behind"
            : safeToSaveAfterRecurring !== null && safeToSaveAfterRecurring < nearestGoal.recommendedMonthly
            ? "tight"
            : "on-track",
      }
    : null;

  const insights = [];

  if (overBudget.length) {
    const first = overBudget[0];
    insights.push({
      key: "budget-over",
      tone: "danger",
      title: `Viršytas ${first.category} biudžetas`,
      metric: formatMoney(first.projectedSpent - first.limitAmount),
      body:
        overBudget.length > 1
          ? `${overBudget.length} kategorijos jau viršijo ribą, kai įskaičiuoji pastovias išlaidas. Pirmiausia verta stabdyti ${first.category.toLowerCase()} sritį.`
          : `${first.category} su pastoviomis išlaidomis jau viršija planą. Čia dabar greičiausiai dingsta mėnesio rezervas.`,
    });
  } else if (warningBudget.length) {
    const first = warningBudget[0];
    insights.push({
      key: "budget-warning",
      tone: "warning",
      title: `${first.category} artėja prie ribos`,
      metric: `${Math.round(first.ratio * 100)}%`,
      body:
        warningBudget.length > 1
          ? `${warningBudget.length} kategorijos pasiekė bent 85% limito, kai įskaičiuoji pastovias išlaidas. Dar keli pirkiniai gali perstumti mėnesį į minusą.`
          : `Šioje kategorijoje su pastoviomis išlaidomis jau panaudota didžioji dalis limito. Jei ją pristabdysi, bus lengviau išsaugoti mėnesio balansą.`,
    });
  }

  if (profile.monthlyIncome > 0 && profile.monthlySavingsTarget > 0) {
    const availableToSave = roundCurrency(Number(profile.monthlyIncome) - currentMonthSpent);

    if (availableToSave >= Number(profile.monthlySavingsTarget)) {
      insights.push({
        key: "target-on-track",
        tone: "success",
        title: "Mėnesio taupymo tikslas telpa",
        metric: formatMoney(availableToSave),
        body: `Pagal dabartinį mėnesį dar telpa apie ${formatMoney(availableToSave)}. Tai užtenka pasiekti tavo nusistatytą taupymo tikslą.`,
      });
    } else {
      const shortfall = roundCurrency(Number(profile.monthlySavingsTarget) - availableToSave);
      insights.push({
        key: "target-shortfall",
        tone: "warning",
        title: "Taupymo tikslui dar trūksta vietos",
        metric: formatMoney(shortfall),
        body: `Jei nieko nekeisi, iki mėnesio taupymo tikslo trūks apie ${formatMoney(shortfall)}. Geriausia pradėti nuo labiausiai augančios kategorijos.`,
      });
    }
  }

  if (summary.change !== null) {
    if (summary.change <= -8) {
      insights.push({
        key: "month-improving",
        tone: "success",
        title: "Mėnuo juda gera kryptimi",
        metric: `${summary.change}%`,
        body: "Palyginti su praėjusiu mėnesiu, išlaidos sumažėjo. Verta išlaikyti dabartinį ritmą ir negrįžti prie spontaniškų pirkinių.",
      });
    } else if (summary.change >= 10) {
      insights.push({
        key: "month-rising",
        tone: "warning",
        title: "Išlaidos auga greičiau nei įprasta",
        metric: `+${summary.change}%`,
        body: "Šis mėnuo jau brangesnis nei praėjęs. Dabar svarbiausia patikrinti, ar augimas ateina iš vienos kategorijos, ar iš kelių smulkių įpročių.",
      });
    }
  }

  if (topCategory && currentMonthSpent > 0) {
    const topShare = roundCurrency((Number(topCategory.total) / currentMonthSpent) * 100);

    if (topShare >= 30) {
      insights.push({
        key: "top-category",
        tone: "info",
        title: `${topCategory.category} valgo didžiausią dalį mėnesio`,
        metric: `${topShare}%`,
        body: `Vien ši kategorija sudaro apie ${topShare}% viso mėnesio. Jei nori greito pokyčio, pradėk būtent nuo jos.`,
      });
    }
  }

  if (recurringMonthlyTotal > 0) {
    const recurringShare = currentMonthSpent > 0 ? roundCurrency((recurringMonthlyTotal / currentMonthSpent) * 100) : 0;
    const largestRecurring = recurringExpenses
      .map((recurringExpense) => ({
        title: recurringExpense.title,
        monthlyEquivalent: recurringToMonthlyEquivalent(recurringExpense),
      }))
      .sort((left, right) => right.monthlyEquivalent - left.monthlyEquivalent)[0];

    insights.push({
      key: "recurring-load",
      tone: recurringShare >= 35 ? "warning" : "info",
      title: "Pastovios išlaidos jau užima mėnesio dalį",
      metric: formatMoney(recurringMonthlyTotal),
      body: largestRecurring
        ? `Pasikartojantys mokėjimai sudaro apie ${recurringShare}% šio mėnesio vaizdo. Didžiausia pastovi eilutė dabar yra ${largestRecurring.title.toLowerCase()}.`
        : "Pasikartojančios išlaidos jau užima reikšmingą mėnesio dalį, todėl jos turi būti matomos atskirai.",
    });
  }

  if (nearestGoal?.recommendedMonthly) {
    insights.push({
      key: "goal-pace",
      tone: "info",
      title: `Tikslas „${nearestGoal.title}“ turi aiškų tempą`,
      metric: `${formatMoney(nearestGoal.recommendedMonthly)}/mėn.`,
      body: nearestGoal.monthsLeft
        ? `Jei nori pasiekti šį tikslą iki ${nearestGoal.targetDate}, reikėtų atsidėti maždaug po ${formatMoney(nearestGoal.recommendedMonthly)} per mėnesį.`
        : `Kad tikslas judėtų užtikrintai, verta atsidėti bent po ${formatMoney(nearestGoal.recommendedMonthly)} per mėnesį.`,
    });
  }

  if (!insights.length) {
    insights.push({
      key: "starting-point",
      tone: "info",
      title: "Pradžiai reikia daugiau duomenų",
      metric: "Start",
      body: "Sukurk kelias išlaidas, vieną biudžetą ir vieną tikslą. Tuomet Stilloak galės parodyti, kur realiai pradėti taupyti.",
    });
  }

  return {
    recurringMonthlyTotal,
    recurringByCategory,
    availableToSave: roundCurrency(monthlyIncome - currentMonthSpent),
    safeToSaveAfterRecurring,
    projectedMonthTotal,
    goalPace,
    categoryPressure,
    fixedVsFlexible,
    savingsCapacity,
    insights: insights.slice(0, 4),
  };
};

const buildAuthoritativeSummary = ({ budgets, entries, goals, month, profile, recurringExpenses }) => ({
  ...buildSavingsSummary({
    budgets,
    entries,
    goals,
    month,
    profile,
    recurringExpenses,
  }),
  recentEntries: sortEntries(entries).slice(0, 5),
});

const buildSavingsSummaryPayload = async (userId, options = {}) => {
  const month = parseMonthKey(options.month, currentMonthKey());
  const [entries, profile, recurringExpenses, budgets, goals] = await Promise.all([
    SavingsEntry.find({ user: userId }),
    getProfileDocument(userId),
    RecurringExpense.find({ user: userId }),
    SavingsBudget.find({ user: userId, month }),
    SavingsGoal.find({ user: userId }),
  ]);
  const summary = buildAuthoritativeSummary({
    budgets,
    entries,
    goals,
    month,
    profile,
    recurringExpenses,
  });
  const insightPayload = buildInsights({
    budgets,
    entries,
    goals,
    profile,
    recurringExpenses,
    summary,
  });

  return {
    profile,
    recurringExpenses,
    budgets,
    goals,
    entries,
    summary: {
      ...summary,
      ...insightPayload,
    },
  };
};

const getProfileDocument = async (userId) =>
  SavingsStudioProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );

const getSavingsMeta = async (_req, res) => {
  res.json({
    categories: CATEGORIES,
    focusOptions: FOCUS_OPTIONS,
    recurringFrequencies: RECURRING_FREQUENCIES,
  });
};

const getSavingsProfile = async (req, res) => {
  const profile = await getProfileDocument(req.user._id);
  res.json({ profile });
};

const updateSavingsProfile = async (req, res) => {
  const input = parseProfileInput(req.body);

  const profile = await SavingsStudioProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: input,
      $setOnInsert: { user: req.user._id },
    },
    { new: true, upsert: true }
  );

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "profile-update",
    entityType: "profile",
    entityId: profile._id.toString(),
    metadata: {
      onboardingCompleted: profile.onboardingCompleted,
    },
  });

  res.json({ profile });
};

const updateSavingsEmailSettings = async (req, res) => {
  const input = parseEmailSettingsInput(req.body);
  const previousProfile = await getProfileDocument(req.user._id);

  const profile = await SavingsStudioProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: input,
      $setOnInsert: { user: req.user._id },
    },
    { new: true, upsert: true }
  );

  const shouldTriggerInitialSummary =
    profile.summaryEmailsEnabled &&
    (!previousProfile.summaryEmailsEnabled || !previousProfile.summaryEmailLastSentAt);

  let initialSummary = null;

  if (shouldTriggerInitialSummary) {
    try {
      const { summary } = await buildSavingsSummaryPayload(req.user._id);
      const result = await sendSavingsSummaryEmail({
        frequency: profile.summaryEmailFrequency,
        profile,
        summary,
        user: req.user,
      });

      initialSummary = {
        triggered: true,
        sent: Boolean(result.sent),
        skipped: Boolean(result.skipped),
        reason: result.reason || "",
        frequency: profile.summaryEmailFrequency,
      };

      await logSavingsAuditSafe({
        userId: req.user._id,
        action: result.sent ? "summary-email-initial" : "summary-email-initial-skipped",
        entityType: "summary-email",
        metadata: {
          frequency: profile.summaryEmailFrequency,
          skipped: Boolean(result.skipped),
          reason: result.reason || "",
        },
      });
    } catch (error) {
      initialSummary = {
        triggered: true,
        sent: false,
        skipped: false,
        reason: error.message,
        frequency: profile.summaryEmailFrequency,
      };

      await logSavingsAuditSafe({
        userId: req.user._id,
        action: "summary-email-initial-failed",
        entityType: "summary-email",
        metadata: {
          frequency: profile.summaryEmailFrequency,
          message: error.message,
        },
      });
    }
  }

  res.json({ profile, initialSummary });
};

const getSavingsBudgets = async (req, res) => {
  const month = parseMonthKey(req.query.month);
  const budgets = await SavingsBudget.find({
    user: req.user._id,
    month,
  }).sort({ category: 1 });

  res.json({
    month,
    budgets,
  });
};

const upsertSavingsBudgets = async (req, res) => {
  const { month, budgets } = parseBudgetPayload(req.body);

  if (budgets.length) {
    await SavingsBudget.bulkWrite(
      budgets.map((budget) => ({
        updateOne: {
          filter: {
            user: req.user._id,
            month,
            category: budget.category,
          },
          update: {
            $set: {
              limitAmount: budget.limitAmount,
            },
            $setOnInsert: {
              user: req.user._id,
              month,
              category: budget.category,
            },
          },
          upsert: true,
        },
      }))
    );
  }

  await SavingsBudget.deleteMany({
    user: req.user._id,
    month,
    category: { $nin: budgets.map((budget) => budget.category) },
  });

  const savedBudgets = await SavingsBudget.find({
    user: req.user._id,
    month,
  }).sort({ category: 1 });

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "budget-upsert",
    entityType: "budget",
    metadata: {
      month,
      budgetCount: savedBudgets.length,
    },
  });

  res.json({
    month,
    budgets: savedBudgets,
  });
};

const getSavingsEntries = async (req, res) => {
  const entries = await SavingsEntry.find({ user: req.user._id }).sort({ date: -1, updatedAt: -1 });
  res.json({
    entries,
  });
};

const createSavingsEntry = async (req, res) => {
  const input = parseEntryInput(req.body);

  const entry = await SavingsEntry.create({
    user: req.user._id,
    ...input,
  });
  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entry-create",
    entityType: "entry",
    entityId: entry._id.toString(),
    metadata: {
      category: entry.category,
      amount: entry.amount,
    },
  });

  res.status(201).json({ entry });
};

const previewSavingsEntriesImport = async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

  if (!rows.length) {
    throw createHttpError("CSV preview reikia bent vienos eilutės.");
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    throw createHttpError(`Vienu kartu galima preview'inti iki ${MAX_IMPORT_ROWS} eilučių.`);
  }

  const parsedPreview = rows.map((row, index) => {
    try {
      return {
        rowNumber: index + 1,
        status: "ok",
        normalized: parseEntryInput(row),
      };
    } catch (error) {
      return {
        rowNumber: index + 1,
        status: "error",
        error: error.message,
        raw: {
          title: String(row.title || "").trim(),
          amount: row.amount,
          date: row.date,
          category: row.category,
        },
      };
    }
  });

  const parsedRows = parsedPreview.filter((entry) => entry.status === "ok").map((entry) => entry.normalized);
  const { duplicateFingerprints, inputDuplicateIndexes } = await findDuplicateImportedRows({
    rows: parsedRows,
    userId: req.user._id,
  });
  let validRowIndex = 0;
  const preview = parsedPreview.map((entry) => {
    if (entry.status !== "ok") {
      return entry;
    }

    const normalized = entry.normalized;
    const isDuplicate =
      duplicateFingerprints.has(buildEntryFingerprint(normalized)) ||
      duplicateFingerprints.has(buildEntryImportFingerprint(normalized)) ||
      inputDuplicateIndexes.has(validRowIndex);

    validRowIndex += 1;

    if (!isDuplicate) {
      return entry;
    }

    return {
      rowNumber: entry.rowNumber,
      status: "duplicate",
      error: "Toks įrašas jau yra arba kartojasi šiame CSV.",
      normalized,
    };
  });

  const validRows = preview.filter((entry) => entry.status === "ok").map((entry) => entry.normalized);
  const invalidRows = preview.filter((entry) => entry.status === "error");
  const duplicateRows = preview.filter((entry) => entry.status === "duplicate");

  res.json({
    totalRows: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicateCount: duplicateRows.length,
    validRows,
    invalidRows,
    duplicateRows,
    preview: preview.slice(0, 20),
  });
};

const importSavingsEntries = async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

  if (!rows.length) {
    throw createHttpError("CSV importui reikia bent vienos eilutės.");
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    throw createHttpError(`Vienu kartu galima importuoti iki ${MAX_IMPORT_ROWS} eilučių.`);
  }

  const parsedPreview = rows.map((row, index) => {
    try {
      return {
        rowNumber: index + 1,
        status: "ok",
        normalized: parseEntryInput(row),
      };
    } catch (error) {
      return {
        rowNumber: index + 1,
        status: "error",
        error: error.message,
      };
    }
  });
  const parsedRows = parsedPreview.filter((entry) => entry.status === "ok").map((entry) => entry.normalized);
  const { duplicateFingerprints, inputDuplicateIndexes } = await findDuplicateImportedRows({
    rows: parsedRows,
    userId: req.user._id,
  });
  const acceptedRows = [];
  const duplicateRows = [];
  let validRowIndex = 0;

  parsedPreview.forEach((entry) => {
    if (entry.status !== "ok") {
      return;
    }

    const normalized = entry.normalized;
    const isDuplicate =
      duplicateFingerprints.has(buildEntryFingerprint(normalized)) ||
      duplicateFingerprints.has(buildEntryImportFingerprint(normalized)) ||
      inputDuplicateIndexes.has(validRowIndex);

    validRowIndex += 1;

    if (isDuplicate) {
      duplicateRows.push({
        rowNumber: entry.rowNumber,
        status: "duplicate",
        error: "Toks įrašas jau yra arba kartojasi šiame CSV.",
        normalized,
      });
      return;
    }

    acceptedRows.push({
      rowNumber: entry.rowNumber,
      normalized,
    });
  });
  const invalidRows = parsedPreview.filter((entry) => entry.status === "error");
  const importedEntries = [];

  for (const entry of acceptedRows) {
    const result = await createImportedEntry({
      entry: entry.normalized,
      rowNumber: entry.rowNumber,
      userId: req.user._id,
    });

    if (result.entry) {
      importedEntries.push(result.entry);
    }

    if (result.duplicate) {
      duplicateRows.push(result.duplicate);
    }
  }

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entry-import",
    entityType: "entry",
    metadata: {
      importedCount: importedEntries.length,
    },
  });

  res.status(201).json({
    acceptedCount: importedEntries.length,
    importedCount: importedEntries.length,
    entries: importedEntries,
    rejectedCount: invalidRows.length + duplicateRows.length,
    invalidCount: invalidRows.length,
    duplicateCount: duplicateRows.length,
    invalidRows,
    duplicateRows,
  });
};

const updateSavingsEntry = async (req, res) => {
  const input = parseEntryInput(req.body);
  const entry = await SavingsEntry.findOne({
    _id: req.params.entryId,
    user: req.user._id,
  });

  if (!entry) {
    throw createHttpError("Išlaidos įrašas nerastas.", 404);
  }

  Object.assign(entry, input);
  await entry.save();

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entry-update",
    entityType: "entry",
    entityId: entry._id.toString(),
    metadata: {
      category: entry.category,
      amount: entry.amount,
    },
  });

  res.json({ entry });
};

const deleteSavingsEntry = async (req, res) => {
  const entry = await SavingsEntry.findOne({
    _id: req.params.entryId,
    user: req.user._id,
  });

  if (!entry) {
    throw createHttpError("Išlaidos įrašas nerastas.", 404);
  }

  const recurringEntryId =
    entry.importSource?.system === "recurring-expense" ? String(entry.importSource?.entryId || "").trim() : "";
  const entryMonth = getEntryMonthKey(entry);

  await entry.deleteOne();

  if (recurringEntryId && entryMonth) {
    await RecurringExpense.findOneAndUpdate(
      {
        _id: recurringEntryId,
        user: req.user._id,
        lastLoggedMonth: entryMonth,
      },
      {
        $set: {
          lastLoggedMonth: "",
        },
      }
    );
  }

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entry-delete",
    entityType: "entry",
    entityId: req.params.entryId,
  });
  res.status(204).send();
};

const getSavingsGoals = async (req, res) => {
  const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ goals });
};

const createSavingsGoal = async (req, res) => {
  const input = parseGoalInput(req.body);
  const goal = await SavingsGoal.create({
    user: req.user._id,
    ...input,
  });

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "goal-create",
    entityType: "goal",
    entityId: goal._id.toString(),
    metadata: {
      targetAmount: goal.targetAmount,
    },
  });

  res.status(201).json({ goal });
};

const updateSavingsGoal = async (req, res) => {
  const input = parseGoalInput(req.body);
  const goal = await SavingsGoal.findOne({
    _id: req.params.goalId,
    user: req.user._id,
  });

  if (!goal) {
    throw createHttpError("Taupymo tikslas nerastas.", 404);
  }

  Object.assign(goal, input);
  await goal.save();

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "goal-update",
    entityType: "goal",
    entityId: goal._id.toString(),
    metadata: {
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
    },
  });

  res.json({ goal });
};

const deleteSavingsGoal = async (req, res) => {
  const goal = await SavingsGoal.findOne({
    _id: req.params.goalId,
    user: req.user._id,
  });

  if (!goal) {
    throw createHttpError("Taupymo tikslas nerastas.", 404);
  }

  await goal.deleteOne();
  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "goal-delete",
    entityType: "goal",
    entityId: req.params.goalId,
  });
  res.status(204).send();
};

const getRecurringExpenses = async (req, res) => {
  const recurringExpenses = await RecurringExpense.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({
    recurringExpenses: recurringExpenses.map(decorateRecurringExpense),
  });
};

const createRecurringExpense = async (req, res) => {
  const input = parseRecurringInput(req.body);
  const recurringExpense = await RecurringExpense.create({
    user: req.user._id,
    ...input,
  });

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "recurring-create",
    entityType: "recurring",
    entityId: recurringExpense._id.toString(),
    metadata: {
      frequency: recurringExpense.frequency,
      amount: recurringExpense.amount,
    },
  });

  res.status(201).json({ recurringExpense: decorateRecurringExpense(recurringExpense) });
};

const updateRecurringExpense = async (req, res) => {
  const input = parseRecurringInput(req.body);
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    user: req.user._id,
  });

  if (!recurringExpense) {
    throw createHttpError("Pasikartojanti išlaida nerasta.", 404);
  }

  Object.assign(recurringExpense, input);
  await recurringExpense.save();

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "recurring-update",
    entityType: "recurring",
    entityId: recurringExpense._id.toString(),
    metadata: {
      frequency: recurringExpense.frequency,
      amount: recurringExpense.amount,
    },
  });

  res.json({ recurringExpense: decorateRecurringExpense(recurringExpense) });
};

const logRecurringExpenseAsEntry = async (req, res) => {
  const month = parseMonthKey(req.body.month, currentMonthKey());
  const existingRecurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    user: req.user._id,
  });

  if (!existingRecurringExpense) {
    throw createHttpError("Pasikartojanti išlaida nerasta.", 404);
  }

  if (existingRecurringExpense.lastLoggedMonth === month) {
    throw createHttpError("Ši pasikartojanti išlaida jau įtraukta šiam mėnesiui.", 409);
  }

  const recurringExpense = existingRecurringExpense;


  const date =
    month === currentMonthKey()
      ? currentDateKey()
      : `${month}-01`;
  const importFingerprint = buildRecurringLogFingerprint({
    month,
    recurringId: recurringExpense._id,
  });

  let entry = null;
  let createdEntry = true;

  try {
    entry = await SavingsEntry.create({
      user: req.user._id,
      title: recurringExpense.title,
      amount: recurringToMonthlyEquivalent(recurringExpense),
      category: recurringExpense.category,
      date,
      notes: recurringExpense.notes
        ? `${recurringExpense.notes} | Sugeneruota iš pasikartojančios išlaidos.`
        : "Sugeneruota iš pasikartojančios išlaidos.",
      importFingerprint,
      importSource: buildImportSource({
        system: "recurring-expense",
        entryId: recurringExpense._id.toString(),
      }),
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    createdEntry = false;
    entry = await SavingsEntry.findOne({
      user: req.user._id,
      importFingerprint,
    });

    if (!entry) {
      throw error;
    }
  }

  const updatedRecurringExpense = await RecurringExpense.findOneAndUpdate(
    {
      _id: req.params.recurringId,
      user: req.user._id,
    },
    {
      $set: {
        lastLoggedMonth: month,
      },
    },
    { new: true }
  );

  if (!updatedRecurringExpense) {
    throw createHttpError("Pasikartojanti išlaida nerasta.", 404);
  }
  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "recurring-log-to-entry",
    entityType: "recurring",
    entityId: updatedRecurringExpense._id.toString(),
    metadata: {
      createdEntry,
      month,
      entryId: entry._id.toString(),
      amount: entry.amount,
    },
  });

  res.status(createdEntry ? 201 : 200).json({
    entry,
    recurringExpense: decorateRecurringExpense(updatedRecurringExpense),
  });
};

const deleteRecurringExpense = async (req, res) => {
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    user: req.user._id,
  });

  if (!recurringExpense) {
    throw createHttpError("Pasikartojanti išlaida nerasta.", 404);
  }

  await recurringExpense.deleteOne();
  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "recurring-delete",
    entityType: "recurring",
    entityId: req.params.recurringId,
  });
  res.status(204).send();
};

const getSavingsSummary = async (req, res) => {
  const month = parseMonthKey(req.query.month);
  const { summary } = await buildSavingsSummaryPayload(req.user._id, { month });
  res.json({
    summary,
  });
};

const getSavingsActivity = async (req, res) => {
  const auditLogs = await SavingsStudioAuditLog.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(MAX_ACTIVITY_ROWS);

  res.json({
    activity: auditLogs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId || "",
      metadata: log.metadata || {},
      createdAt: log.createdAt,
    })),
  });
};

const exportSavingsEntriesCsv = async (req, res) => {
  const scope = String(req.query.scope || "").trim().toLowerCase();
  const hasMonth = req.query.month !== undefined && String(req.query.month).trim() !== "";

  if (scope && scope !== "all") {
    throw createHttpError("Pasirink galiojantį CSV eksporto tipą.");
  }

  if (scope === "all" && hasMonth) {
    throw createHttpError("Visų duomenų eksportas negali turėti mėnesio filtro.");
  }

  const month = scope === "all" ? "" : parseMonthKey(req.query.month);
  const query = { user: req.user._id };

  if (month) {
    query.date = {
      $gte: `${month}-01`,
      $lte: `${month}-31`,
    };
  }

  const entries = await SavingsEntry.find(query).sort({ date: -1, updatedAt: -1 }).limit(MAX_EXPORT_ROWS + 1);

  if (entries.length > MAX_EXPORT_ROWS) {
    throw createHttpError("Eksportui per daug eilučių. Pasirink konkretų mėnesį.", 413);
  }

  const fileScope = scope === "all" ? "all" : month;
  const filename = safeDownloadFileName(`stilloak-savings-studio-entries-${fileScope}.csv`);

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entries-csv-export",
    entityType: "entries-csv",
    metadata: {
      scope: scope === "all" ? "all" : "month",
      month,
      entryCount: entries.length,
    },
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buildEntriesCsv(entries.map(toPlainObject)));
};

const exportSavingsBackup = async (req, res) => {
  const [payload, allBudgets] = await Promise.all([
    buildSavingsSummaryPayload(req.user._id),
    SavingsBudget.find({ user: req.user._id }).sort({ month: -1, category: 1 }),
  ]);

  const fileKey = new Date().toISOString().slice(0, 10);
  const backup = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    profile: serializeSavingsProfileBackup(payload.profile),
    entries: payload.entries.map(serializeSavingsEntryBackup),
    budgets: allBudgets.map(serializeSavingsBudgetBackup),
    goals: payload.goals.map(serializeSavingsGoalBackup),
    recurringExpenses: payload.recurringExpenses.map(serializeRecurringExpenseBackup),
  };

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "backup-export",
    entityType: "backup",
    metadata: {
      entryCount: payload.entries.length,
      budgetCount: allBudgets.length,
      goalCount: payload.goals.length,
      recurringCount: payload.recurringExpenses.length,
    },
  });

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${safeDownloadFileName(`savings-studio-backup-${fileKey}.json`)}"`);
  res.status(200).send(JSON.stringify(backup, null, 2));
};

const buildSavingsSummaryTextReport = ({ summary, userName }) => {
  const periodLabel = "Mėnesio ataskaita";
  const budgetLines = (summary.budgetProgress || [])
    .map(
      (budget) =>
        `- ${budget.category}: faktas ${formatMoney(budget.actualSpent)}, prognozuojama ${formatMoney(
          budget.projectedSpent
        )}, limitas ${formatMoney(budget.limitAmount)}, būsena ${budget.status}`
    );
  const goalLines = (summary.goalsWithProgress || [])
    .map(
      (goal) =>
        `- ${goal.title}: sukaupta ${formatMoney(goal.savedAmount)}, tikslas ${formatMoney(
          goal.targetAmount
        )}, progresas ${Number(goal.visualProgress || 0).toFixed(0)}%`
    );
  const categoryLines = (summary.categoryTotals || [])
    .map((entry) => `- ${entry.category}: ${formatMoney(entry.total)}`);

  return [
    "Stilloak Studio",
    "Saving Studio",
    "",
    `${periodLabel}: ${summary.month}`,
    userName ? `Vartotojas: ${userName}` : "",
    "",
    "Pagrindiniai skaičiai",
    `Pajamos: ${formatMoney(summary.monthlyIncome)}`,
    `Faktinės mėnesio išlaidos: ${formatMoney(summary.monthTotal)}`,
    `Likusi pasikartojančių išlaidų prognozė: ${formatMoney(summary.recurringMonthlyTotal)}`,
    `Bendra mėnesio prognozė: ${formatMoney(summary.projectedMonthTotal)}`,
    `Likutis pagal faktą: ${formatMoney(summary.balance)}`,
    `Likutis po prognozės: ${formatMoney(summary.safeToSaveAfterRecurring)}`,
    "",
    "Faktinės kategorijų išlaidos",
    ...(categoryLines.length ? categoryLines : ["- Šiam mėnesiui įrašų dar nėra."]),
    "",
    "Biudžetai",
    ...(budgetLines.length ? budgetLines : ["- Šiam mėnesiui biudžetų ir išlaidų dar nėra."]),
    "",
    "Tikslai",
    ...(goalLines.length ? goalLines : ["- Tikslų dar nėra."]),
    "",
    "Pastovių išlaidų atskyrimas",
    `Jau įtrauktos pastovios išlaidos: ${formatMoney(summary.fixedVsFlexible?.loggedRecurring)}`,
    `Likusi pastovių išlaidų prognozė: ${formatMoney(summary.fixedVsFlexible?.recurringRemaining)}`,
    `Lanksčios faktinės išlaidos: ${formatMoney(summary.fixedVsFlexible?.flexibleSpent)}`,
    "",
    "Pastaba",
    "Faktinės išlaidos skaičiuojamos tik iš įrašų. Pasikartojančių išlaidų prognozė rodoma atskirai, todėl ji nedubliuojama su jau įtrauktais įrašais.",
  ]
    .filter((line) => line !== "")
    .join("\n");
};

const downloadSavingsSummaryDocument = async (req, res) => {
  const frequency = String(req.query.frequency || "monthly").trim();
  const format = String(req.query.format || "txt").trim().toLowerCase();
  const month = parseMonthKey(req.query.month);

  if (frequency !== "monthly") {
    throw createHttpError("TXT atsisiuntimui palaikoma tik mėnesio ataskaita.");
  }

  if (format !== "txt") {
    throw createHttpError("Pasirink galiojantį TXT ataskaitos formatą.");
  }

  const reportPayload = await buildSavingsSummaryPayload(req.user._id, { month });
  const report = buildSavingsSummaryTextReport({
    summary: reportPayload.summary,
    userName: req.user.name,
  });
  const reportFileStamp = buildDownloadTimestamp();
  const reportFilename = safeDownloadFileName(`stilloak-monthly-summary-${month}-${reportFileStamp}.txt`);

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "summary-export",
    entityType: "summary-file",
    metadata: {
      frequency,
      format,
      month,
    },
  });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${reportFilename}"`);
  res.status(200).send(report);
};

const sendSavingsSummaryEmailNow = async (req, res) => {
  const profile = await getProfileDocument(req.user._id);
  const frequency = String(req.body.frequency || profile.summaryEmailFrequency || "weekly").trim();

  if (!["weekly", "monthly"].includes(frequency)) {
    throw createHttpError("Pasirink galiojantį suvestinės dažnį.");
  }

  const { summary } = await buildSavingsSummaryPayload(req.user._id);
  const result = await sendSavingsSummaryEmail({
    frequency,
    profile,
    summary,
    user: req.user,
  });

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: result.sent ? "summary-email-manual" : "summary-email-manual-skipped",
    entityType: "summary-email",
    metadata: {
      frequency,
      skipped: Boolean(result.skipped),
      reason: result.reason || "",
    },
  });

  res.json({
    ...result,
    frequency,
  });
};

module.exports = {
  getSavingsMeta,
  getSavingsProfile,
  updateSavingsProfile,
  updateSavingsEmailSettings,
  getSavingsBudgets,
  getSavingsEntries,
  createSavingsEntry,
  previewSavingsEntriesImport,
  importSavingsEntries,
  updateSavingsEntry,
  deleteSavingsEntry,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  logRecurringExpenseAsEntry,
  deleteRecurringExpense,
  getSavingsSummary,
  getSavingsActivity,
  exportSavingsEntriesCsv,
  exportSavingsBackup,
  downloadSavingsSummaryDocument,
  sendSavingsSummaryEmailNow,
  upsertSavingsBudgets,
  CATEGORIES,
  buildEntryImportFingerprint,
  buildSavingsSummaryPayload,
};
