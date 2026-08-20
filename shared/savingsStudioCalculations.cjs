const RECURRING_FREQUENCY_FACTORS = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

const toFiniteNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const toCents = (value) => {
  const numericValue = toFiniteNumber(value, 0);
  return Math.round(numericValue * 100);
};

const fromCents = (cents) => {
  const numericCents = toFiniteNumber(cents, 0);
  return Number((numericCents / 100).toFixed(2));
};

const moneyAmount = (value) => fromCents(toCents(value));

const sumMoney = (values) =>
  fromCents((Array.isArray(values) ? values : []).reduce((sum, value) => sum + toCents(value), 0));

const percent = (numerator, denominator) => {
  const denominatorCents = toCents(denominator);

  if (denominatorCents <= 0) {
    return 0;
  }

  return moneyAmount((toCents(numerator) / denominatorCents) * 100);
};

const isStrictMonthKey = (value) => {
  const month = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(month) && Number(month.slice(5, 7)) >= 1 && Number(month.slice(5, 7)) <= 12;
};

const isStrictDateKey = (value) => {
  const date = String(value || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const currentMonthKey = (now = new Date()) => {
  const date = now instanceof Date ? now : new Date(now);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 7) : date.toISOString().slice(0, 7);
};

const currentDateKey = (now = new Date()) => {
  const date = now instanceof Date ? now : new Date(now);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

const shiftMonthKey = (monthKey, delta) => {
  const month = isStrictMonthKey(monthKey) ? monthKey : currentMonthKey();
  const [yearPart, monthPart] = month.split("-");
  const date = new Date(Date.UTC(Number(yearPart), Number(monthPart) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const getEntryMonthKey = (entry) => {
  const date = String(entry?.date || "").trim();
  return isStrictDateKey(date) ? date.slice(0, 7) : "";
};

const getRecurringEntryId = (entry = {}) => {
  if (entry.importSource?.system !== "recurring-expense") {
    return "";
  }

  return String(entry.importSource?.entryId || "").trim();
};

const getLoggedRecurringIdsForMonth = (entries = [], selectedMonth = currentMonthKey()) =>
  new Set(
    (Array.isArray(entries) ? entries : [])
      .map(toPlain)
      .filter((entry) => getEntryMonthKey(entry) === selectedMonth)
      .map(getRecurringEntryId)
      .filter(Boolean)
  );

const recurringMonthlyEquivalent = (expense = {}) => {
  const amount = Math.max(moneyAmount(expense.amount), 0);
  const factor = RECURRING_FREQUENCY_FACTORS[expense.frequency] || RECURRING_FREQUENCY_FACTORS.monthly;
  return moneyAmount(amount * factor);
};

const goalProgress = (goal = {}) => {
  const targetAmount = Math.max(moneyAmount(goal.targetAmount), 0);
  const savedAmount = Math.max(moneyAmount(goal.currentAmount ?? goal.savedAmount), 0);

  if (targetAmount <= 0) {
    return {
      progress: 0,
      visualProgress: 0,
      remaining: 0,
      remainingAmount: 0,
      complete: savedAmount > 0,
      savedAmount,
      targetAmount,
    };
  }

  const rawProgress = percent(savedAmount, targetAmount);
  const remaining = Math.max(moneyAmount(targetAmount - savedAmount), 0);

  return {
    progress: rawProgress,
    visualProgress: Math.min(Math.max(rawProgress, 0), 100),
    remaining,
    remainingAmount: remaining,
    complete: savedAmount >= targetAmount,
    savedAmount,
    targetAmount,
  };
};

const toPlain = (document) => {
  if (document && typeof document.toObject === "function") {
    return document.toObject();
  }

  return document || {};
};

const buildMonthOptions = ({ anchorMonth, count = 6 }) =>
  Array.from({ length: count }, (_, index) => {
    const key = shiftMonthKey(anchorMonth, index - count + 1);
    return { key, total: 0 };
  });

const buildSavingsSummary = ({
  budgets = [],
  entries = [],
  goals = [],
  month = currentMonthKey(),
  profile = {},
  recurringExpenses = [],
} = {}) => {
  const selectedMonth = isStrictMonthKey(month) ? month : currentMonthKey();
  const previousMonth = shiftMonthKey(selectedMonth, -1);
  const monthlyTotals = buildMonthOptions({ anchorMonth: selectedMonth });
  const monthlyLookup = new Map(monthlyTotals.map((entry) => [entry.key, entry]));
  const weeklyTotalsCurrentMonth = Array.from({ length: 5 }, (_, index) => ({
    key: `week-${index + 1}`,
    label: `${index + 1} sav.`,
    total: 0,
  }));
  const selectedCategoryTotals = new Map();
  const selectedEntries = [];
  let totalSpent = 0;
  let selectedMonthTotal = 0;
  let previousMonthTotal = 0;

  for (const rawEntry of Array.isArray(entries) ? entries : []) {
    const entry = toPlain(rawEntry);
    const entryMonth = getEntryMonthKey(entry);
    const amount = Math.max(moneyAmount(entry.amount), 0);

    if (!entryMonth) {
      continue;
    }

    totalSpent += toCents(amount);

    if (monthlyLookup.has(entryMonth)) {
      monthlyLookup.get(entryMonth).total = sumMoney([monthlyLookup.get(entryMonth).total, amount]);
    }

    if (entryMonth === selectedMonth) {
      selectedEntries.push(entry);
      selectedMonthTotal += toCents(amount);
      selectedCategoryTotals.set(entry.category, sumMoney([selectedCategoryTotals.get(entry.category) || 0, amount]));

      const dayOfMonth = Number(String(entry.date).slice(-2));
      const bucketIndex = Math.min(Math.max(Math.floor((dayOfMonth - 1) / 7), 0), 4);
      weeklyTotalsCurrentMonth[bucketIndex].total = sumMoney([weeklyTotalsCurrentMonth[bucketIndex].total, amount]);
    }

    if (entryMonth === previousMonth) {
      previousMonthTotal += toCents(amount);
    }
  }

  const monthTotal = fromCents(selectedMonthTotal);
  const previousTotal = fromCents(previousMonthTotal);
  const categoryTotals = [...selectedCategoryTotals.entries()]
    .map(([category, total]) => ({ category, total: moneyAmount(total) }))
    .sort((left, right) => right.total - left.total);
  const loggedRecurringIds = getLoggedRecurringIdsForMonth(entries, selectedMonth);
  const outstandingRecurring = (Array.isArray(recurringExpenses) ? recurringExpenses : [])
    .map(toPlain)
    .filter((expense) => !loggedRecurringIds.has(String(expense._id || "").trim()));
  const recurringByCategory = {};

  for (const expense of outstandingRecurring) {
    recurringByCategory[expense.category] = sumMoney([
      recurringByCategory[expense.category] || 0,
      recurringMonthlyEquivalent(expense),
    ]);
  }

  const recurringMonthlyTotal = sumMoney(outstandingRecurring.map(recurringMonthlyEquivalent));
  const loggedRecurringTotal = sumMoney(
    selectedEntries
      .filter((entry) => entry.importSource?.system === "recurring-expense")
      .map((entry) => entry.amount)
  );
  const flexibleSpendTotal = Math.max(moneyAmount(monthTotal - loggedRecurringTotal), 0);
  const projectedMonthTotal = sumMoney([monthTotal, recurringMonthlyTotal]);
  const income = moneyAmount(profile.monthlyIncome);
  const actualBalance = moneyAmount(income - monthTotal);
  const projectedBalance = moneyAmount(income - projectedMonthTotal);
  const monthlySavingsTarget = moneyAmount(profile.monthlySavingsTarget);
  const availableSavings = Math.max(actualBalance, 0);
  const savingsPercent = income > 0 && availableSavings > 0 ? percent(availableSavings, income) : 0;
  const budgetRows = (Array.isArray(budgets) ? budgets : []).map(toPlain);
  const budgetCategories = new Set([
    ...budgetRows.map((budget) => budget.category),
    ...categoryTotals.map((entry) => entry.category),
    ...Object.keys(recurringByCategory),
  ]);
  const budgetProgress = [...budgetCategories]
    .map((category) => {
      const budget = budgetRows.find((entry) => entry.category === category) || {};
      const actualSpent = moneyAmount(selectedCategoryTotals.get(category) || 0);
      const recurringCommitted = moneyAmount(recurringByCategory[category] || 0);
      const limitAmount = Math.max(moneyAmount(budget.limitAmount), 0);
      const projectedSpent = sumMoney([actualSpent, recurringCommitted]);
      const remaining = moneyAmount(limitAmount - projectedSpent);
      const overAmount = Math.max(moneyAmount(projectedSpent - limitAmount), 0);
      const percentUsed = limitAmount > 0 ? percent(projectedSpent, limitAmount) : 0;

      return {
        category,
        actualSpent,
        recurringCommitted,
        spent: projectedSpent,
        projectedSpent,
        limitAmount,
        remaining,
        overAmount,
        percentUsed,
        visualPercentUsed: Math.min(Math.max(percentUsed, 0), 100),
        status:
          limitAmount <= 0
            ? "unset"
            : projectedSpent > limitAmount
            ? "over"
            : projectedSpent >= moneyAmount(limitAmount * 0.85)
            ? "warning"
            : "healthy",
      };
    })
    .sort((left, right) => right.percentUsed - left.percentUsed || right.projectedSpent - left.projectedSpent);
  const goalsWithProgress = (Array.isArray(goals) ? goals : []).map((goal) => ({
    ...toPlain(goal),
    ...goalProgress(toPlain(goal)),
  }));
  const change = previousTotal > 0 ? percent(monthTotal - previousTotal, previousTotal) : null;

  return {
    month: selectedMonth,
    monthTotal,
    monthlyIncome: income,
    totalMonthlyExpenses: monthTotal,
    balance: actualBalance,
    deficit: actualBalance < 0 ? Math.abs(actualBalance) : 0,
    previousMonthTotal: previousTotal,
    change,
    averageSpend: entries.length ? fromCents(totalSpent / entries.length) : 0,
    topCategory: categoryTotals[0]?.category || "Dar nėra duomenų",
    recentCount: entries.length,
    categoryTotals,
    monthlyTotals: monthlyTotals.map((entry) => ({ ...entry, total: moneyAmount(entry.total) })),
    weeklyTotalsCurrentMonth: weeklyTotalsCurrentMonth.map((entry) => ({ ...entry, total: moneyAmount(entry.total) })),
    selectedEntries,
    recurringMonthlyTotal,
    recurringByCategory,
    projectedMonthTotal,
    availableToSave: actualBalance,
    safeToSaveAfterRecurring: projectedBalance,
    savingsCapacity: {
      income,
      currentMonthSpent: monthTotal,
      projectedMonthTotal,
      afterActual: actualBalance,
      afterProjected: projectedBalance,
      target: monthlySavingsTarget,
      availableSavings,
      savingsPercent,
    },
    fixedVsFlexible: {
      loggedRecurring: loggedRecurringTotal,
      recurringRemaining: recurringMonthlyTotal,
      fixedProjected: sumMoney([loggedRecurringTotal, recurringMonthlyTotal]),
      flexibleSpent: flexibleSpendTotal,
    },
    budgetProgress,
    categoryPressure: budgetProgress
      .filter((entry) => entry.limitAmount > 0)
      .slice(0, 5)
      .map((entry) => ({
        category: entry.category,
        projectedSpent: entry.projectedSpent,
        limitAmount: entry.limitAmount,
        shareOfProjected: projectedMonthTotal > 0 ? percent(entry.projectedSpent, projectedMonthTotal) : 0,
        status: entry.status,
      })),
    goalsWithProgress,
  };
};

module.exports = {
  RECURRING_FREQUENCY_FACTORS,
  buildSavingsSummary,
  currentDateKey,
  currentMonthKey,
  fromCents,
  getEntryMonthKey,
  getLoggedRecurringIdsForMonth,
  getRecurringEntryId,
  goalProgress,
  isStrictDateKey,
  isStrictMonthKey,
  moneyAmount,
  percent,
  recurringMonthlyEquivalent,
  shiftMonthKey,
  sumMoney,
  toCents,
  toFiniteNumber,
};
