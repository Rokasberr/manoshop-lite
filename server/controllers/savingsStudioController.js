const SavingsEntry = require("../models/SavingsEntry");

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

const getSavingsMeta = async (_req, res) => {
  res.json({
    categories: CATEGORIES,
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

const getSavingsSummary = async (req, res) => {
  const entries = await SavingsEntry.find({ user: req.user._id });
  res.json({
    summary: buildSummary(entries),
  });
};

module.exports = {
  getSavingsMeta,
  getSavingsEntries,
  createSavingsEntry,
  updateSavingsEntry,
  deleteSavingsEntry,
  getSavingsSummary,
  CATEGORIES,
};
