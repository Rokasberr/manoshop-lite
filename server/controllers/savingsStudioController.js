const RecurringExpense = require("../models/RecurringExpense");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");

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

const currentMonthKey = () => new Date().toISOString().slice(0, 7);

const previousMonthKey = () => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
};

const roundCurrency = (value) => Number(value.toFixed(2));

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
    notes: notes.slice(0, 240),
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
    notes: notes.slice(0, 240),
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
    notes: notes.slice(0, 240),
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

const buildSummary = (entries) => {
  const monthKey = currentMonthKey();
  const lastMonthKey = previousMonthKey();
  const monthlyTotals = monthOptions(6).map((entry) => ({
    ...entry,
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

  res.status(201).json({ entry });
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

  res.json({ recurringExpense: decorateRecurringExpense(recurringExpense) });
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
  res.status(204).send();
};

const getSavingsSummary = async (req, res) => {
  const entries = await SavingsEntry.find({ user: req.user._id });
  res.json({
    summary: buildSummary(entries),
  });
};

module.exports = {
  getSavingsMeta,
  getSavingsProfile,
  updateSavingsProfile,
  getSavingsBudgets,
  getSavingsEntries,
  createSavingsEntry,
  updateSavingsEntry,
  deleteSavingsEntry,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getSavingsSummary,
  upsertSavingsBudgets,
  CATEGORIES,
};
