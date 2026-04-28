const RecurringExpense = require("../models/RecurringExpense");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const { sendSavingsSummaryEmail } = require("../services/savingsStudioSummaryEmailService");
const { logSavingsAuditSafe } = require("../services/savingsStudioAuditService");

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
const MAX_IMPORT_ROWS = 300;
const MAX_BACKUP_AUDIT_ROWS = 200;

const currentMonthKey = () => new Date().toISOString().slice(0, 7);

const previousMonthKey = () => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
};

const roundCurrency = (value) => Number(value.toFixed(2));
const moneyFormatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const formatMoney = (value) => moneyFormatter.format(Number(value || 0));

const monthOptions = (count = 6) => {
  const formatter = new Intl.DateTimeFormat("lt-LT", {
    month: "short",
    year: "numeric",
  });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - (count - index - 1));

    return {
      key: date.toISOString().slice(0, 7),
      label: formatter.format(date),
    };
  });
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

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw createHttpError("Naudok galiojantį mėnesio formatą YYYY-MM.");
  }

  return month;
};

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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
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

  const normalizedBudgets = budgets
    .map((budget) => ({
      category: String(budget.category || "").trim(),
      limitAmount: Number(budget.limitAmount),
    }))
    .filter((budget) => budget.category && Number.isFinite(budget.limitAmount) && budget.limitAmount > 0);

  for (const budget of normalizedBudgets) {
    if (!CATEGORIES.includes(budget.category)) {
      throw createHttpError(`Biudžeto kategorija negalioja: ${budget.category}`);
    }
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

  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    throw createHttpError("Dabartinė sukaupta suma negali būti neigiama.");
  }

  if (targetDate && (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || Number.isNaN(new Date(`${targetDate}T00:00:00`).getTime()))) {
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

  if (monthlyIncome > 100000000 || monthlySavingsTarget > 100000000) {
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

const recurringToMonthlyEquivalent = (expense) => {
  const amount = Number(expense.amount || 0);

  switch (expense.frequency) {
    case "weekly":
      return roundCurrency((amount * 52) / 12);
    case "quarterly":
      return roundCurrency(amount / 3);
    case "yearly":
      return roundCurrency(amount / 12);
    case "monthly":
    default:
      return roundCurrency(amount);
  }
};

const decorateRecurringExpense = (expense) => ({
  ...expense.toObject(),
  monthlyEquivalent: recurringToMonthlyEquivalent(expense),
});

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

const buildSummary = (entries) => {
  const monthKey = currentMonthKey();
  const lastMonthKey = previousMonthKey();
  const monthlyTotals = monthOptions(6).map((entry) => ({
    ...entry,
    total: 0,
  }));
  const weeklyTotalsCurrentMonth = Array.from({ length: 5 }, (_, index) => ({
    key: `week-${index + 1}`,
    label: `${index + 1} sav.`,
    total: 0,
  }));
  const monthlyLookup = new Map(monthlyTotals.map((entry) => [entry.key, entry]));
  const categoryLookup = new Map();

  let totalSpent = 0;
  let currentMonthTotal = 0;
  let previousMonthTotal = 0;

  for (const entry of entries) {
    const amount = Number(entry.amount);
    const entryMonth = entry.date.slice(0, 7);

    totalSpent += amount;

    if (entryMonth === monthKey) {
      currentMonthTotal += amount;

      const dayOfMonth = Number(entry.date.slice(-2));
      const bucketIndex = Math.min(Math.max(Math.floor((dayOfMonth - 1) / 7), 0), weeklyTotalsCurrentMonth.length - 1);
      weeklyTotalsCurrentMonth[bucketIndex].total += amount;
    }

    if (entryMonth === lastMonthKey) {
      previousMonthTotal += amount;
    }

    if (monthlyLookup.has(entryMonth)) {
      monthlyLookup.get(entryMonth).total += amount;
    }

    categoryLookup.set(entry.category, (categoryLookup.get(entry.category) || 0) + amount);
  }

  const categoryTotals = [...categoryLookup.entries()]
    .map(([category, total]) => ({
      category,
      total: roundCurrency(total),
    }))
    .sort((left, right) => right.total - left.total);

  const change =
    previousMonthTotal > 0
      ? roundCurrency(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100)
      : null;

  return {
    monthTotal: roundCurrency(currentMonthTotal),
    previousMonthTotal: roundCurrency(previousMonthTotal),
    change,
    averageSpend: entries.length ? roundCurrency(totalSpent / entries.length) : 0,
    topCategory: categoryTotals[0]?.category || "Dar nėra duomenų",
    recentCount: entries.length,
    recentEntries: sortEntries(entries).slice(0, 5),
    categoryTotals,
    monthlyTotals: monthlyTotals.map((entry) => ({
      ...entry,
      total: roundCurrency(entry.total),
    })),
    weeklyTotalsCurrentMonth: weeklyTotalsCurrentMonth.map((entry) => ({
      ...entry,
      total: roundCurrency(entry.total),
    })),
  };
};

const buildInsights = ({ budgets, entries, goals, profile, recurringExpenses, summary }) => {
  const monthKey = currentMonthKey();
  const currentMonthSpent = Number(summary.monthTotal || 0);
  const outstandingRecurringExpenses = recurringExpenses.filter(
    (recurringExpense) => recurringExpense.lastLoggedMonth !== monthKey
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
  const safeToSaveAfterRecurring =
    profile.monthlyIncome > 0 ? roundCurrency(Number(profile.monthlyIncome) - projectedMonthTotal) : null;
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
    income: Number(profile.monthlyIncome || 0),
    currentMonthSpent,
    projectedMonthTotal,
    afterActual: profile.monthlyIncome > 0 ? roundCurrency(Number(profile.monthlyIncome) - currentMonthSpent) : null,
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
    availableToSave:
      profile.monthlyIncome > 0 ? roundCurrency(Number(profile.monthlyIncome) - currentMonthSpent) : null,
    safeToSaveAfterRecurring,
    projectedMonthTotal,
    goalPace,
    categoryPressure,
    fixedVsFlexible,
    savingsCapacity,
    insights: insights.slice(0, 4),
  };
};

const buildSavingsSummaryPayload = async (userId) => {
  const month = currentMonthKey();
  const [entries, profile, recurringExpenses, budgets, goals] = await Promise.all([
    SavingsEntry.find({ user: userId }),
    getProfileDocument(userId),
    RecurringExpense.find({ user: userId }),
    SavingsBudget.find({ user: userId, month }),
    SavingsGoal.find({ user: userId }),
  ]);
  const summary = buildSummary(entries);
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

  res.json({ profile });
};

const updateSavingsEmailSettings = async (req, res) => {
  const input = parseEmailSettingsInput(req.body);

  const profile = await SavingsStudioProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: input,
      $setOnInsert: { user: req.user._id },
    },
    { new: true, upsert: true }
  );

  res.json({ profile });
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

  await SavingsBudget.deleteMany({
    user: req.user._id,
    month,
  });

  let savedBudgets = [];

  if (budgets.length) {
    savedBudgets = await SavingsBudget.insertMany(
      budgets.map((budget) => ({
        user: req.user._id,
        month,
        category: budget.category,
        limitAmount: budget.limitAmount,
      }))
    );
  }

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

  const preview = rows.map((row, index) => {
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

  const validRows = preview.filter((entry) => entry.status === "ok").map((entry) => entry.normalized);
  const invalidRows = preview.filter((entry) => entry.status === "error");

  res.json({
    totalRows: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    validRows,
    invalidRows,
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

  const parsedRows = rows.map((row) => parseEntryInput(row));
  const importedEntries = await SavingsEntry.insertMany(
    parsedRows.map((entry) => ({
      user: req.user._id,
      ...entry,
      importSource: buildImportSource({ system: "csv-upload" }),
    }))
  );

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "entry-import",
    entityType: "entry",
    metadata: {
      importedCount: importedEntries.length,
    },
  });

  res.status(201).json({
    importedCount: importedEntries.length,
    entries: importedEntries,
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

  await entry.deleteOne();
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
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    user: req.user._id,
  });

  if (!recurringExpense) {
    throw createHttpError("Pasikartojanti išlaida nerasta.", 404);
  }

  const month = parseMonthKey(req.body.month, currentMonthKey());

  if (recurringExpense.lastLoggedMonth === month) {
    throw createHttpError("Ši pasikartojanti išlaida jau įtraukta šiam mėnesiui.", 409);
  }

  const date =
    month === currentMonthKey()
      ? new Date().toISOString().slice(0, 10)
      : `${month}-01`;

  const entry = await SavingsEntry.create({
    user: req.user._id,
    title: recurringExpense.title,
    amount: recurringToMonthlyEquivalent(recurringExpense),
    category: recurringExpense.category,
    date,
    notes: recurringExpense.notes
      ? `${recurringExpense.notes} | Sugeneruota iš pasikartojančios išlaidos.`
      : "Sugeneruota iš pasikartojančios išlaidos.",
    importSource: buildImportSource({
      system: "recurring-expense",
      entryId: recurringExpense._id.toString(),
    }),
  });

  recurringExpense.lastLoggedMonth = month;
  await recurringExpense.save();

  await logSavingsAuditSafe({
    userId: req.user._id,
    action: "recurring-log-to-entry",
    entityType: "recurring",
    entityId: recurringExpense._id.toString(),
    metadata: {
      month,
      entryId: entry._id.toString(),
      amount: entry.amount,
    },
  });

  res.status(201).json({
    entry,
    recurringExpense: decorateRecurringExpense(recurringExpense),
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
  const { summary } = await buildSavingsSummaryPayload(req.user._id);
  res.json({
    summary,
  });
};

const exportSavingsBackup = async (req, res) => {
  const [payload, allBudgets, auditLogs] = await Promise.all([
    buildSavingsSummaryPayload(req.user._id),
    SavingsBudget.find({ user: req.user._id }).sort({ month: -1, category: 1 }),
    SavingsStudioAuditLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(MAX_BACKUP_AUDIT_ROWS),
  ]);

  const fileKey = new Date().toISOString().slice(0, 10);
  const backup = {
    generatedAt: new Date().toISOString(),
    user: {
      id: req.user._id.toString(),
      email: req.user.email,
      subscription: req.user.subscription,
    },
    profile: payload.profile,
    summary: payload.summary,
    entries: payload.entries,
    budgets: allBudgets,
    goals: payload.goals,
    recurringExpenses: payload.recurringExpenses,
    auditLogs,
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
  res.setHeader("Content-Disposition", `attachment; filename=\"savings-studio-backup-${fileKey}.json\"`);
  res.status(200).send(JSON.stringify(backup, null, 2));
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
  exportSavingsBackup,
  sendSavingsSummaryEmailNow,
  upsertSavingsBudgets,
  CATEGORIES,
  buildSavingsSummaryPayload,
};
