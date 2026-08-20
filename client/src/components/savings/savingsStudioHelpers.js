import calculations from "../../../../shared/savingsStudioCalculations.cjs";

export const DEFAULT_CATEGORIES = [
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

export const DEFAULT_FOCUS_OPTIONS = [
  "Sumažinti kasdienes išlaidas",
  "Susikurti finansinį aiškumą",
  "Sutaupyti kelionei",
  "Sukaupti rezervą",
  "Suvaldyti laisvalaikio išlaidas",
];

export const DEFAULT_RECURRING_FREQUENCIES = [
  { value: "weekly", label: "Kas savaitę" },
  { value: "monthly", label: "Kas mėnesį" },
  { value: "quarterly", label: "Kas ketvirtį" },
  { value: "yearly", label: "Kartą per metus" },
];

export const money = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const dateFormatter = new Intl.DateTimeFormat("lt-LT", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const {
  currentDateKey,
  currentMonthKey: getCurrentMonthKey,
  goalProgress,
  isStrictMonthKey,
  recurringMonthlyEquivalent: getRecurringMonthlyEquivalent,
  toFiniteNumber,
} = calculations;

export const currentDateInput = () => currentDateKey();
export const currentMonthKey = () => getCurrentMonthKey();
const isMonthKey = (value) => isStrictMonthKey(value);

export const emptyEntry = (categories = DEFAULT_CATEGORIES) => ({
  title: "",
  amount: "",
  category: categories[1] || categories[0] || "Maistas",
  date: currentDateInput(),
  notes: "",
});

export const emptyGoal = () => ({
  title: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
  notes: "",
});

export const emptyRecurringExpense = (categories = DEFAULT_CATEGORIES) => ({
  title: "",
  amount: "",
  category: categories[1] || categories[0] || "Maistas",
  frequency: "monthly",
  notes: "",
});

export const monthLabel = (monthKey) => {
  const normalizedMonthKey = String(monthKey || "").trim();

  if (!isMonthKey(normalizedMonthKey)) {
    return "Šis mėnuo";
  }

  const parsedDate = new Date(`${normalizedMonthKey}-01T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Šis mėnuo";
  }

  return new Intl.DateTimeFormat("lt-LT", {
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const firstSafeLabelToken = (value) => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "N/A";
  }

  return normalizedValue.split(/\s+/)[0] || "N/A";
};

export const formatChartMonthLabel = (entry) => {
  const explicitLabel = typeof entry?.label === "string" ? entry.label.trim() : "";

  if (explicitLabel) {
    return firstSafeLabelToken(explicitLabel);
  }

  const key = typeof entry?.key === "string" ? entry.key.trim() : "";

  if (!isMonthKey(key)) {
    return "N/A";
  }

  return firstSafeLabelToken(monthLabel(key));
};

export const buildMonthOptions = (entries = []) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const months = new Set(
    safeEntries
      .map((entry) => String(entry?.date || "").slice(0, 7))
      .filter(isMonthKey)
  );
  months.add(new Date().toISOString().slice(0, 7));

  return [
    { value: "all", label: "Visi mėnesiai" },
    ...[...months]
      .sort()
      .reverse()
      .map((month) => ({
        value: month,
        label: monthLabel(month),
      })),
  ];
};

export const formatChange = (change) => {
  const numericChange = Number(change);

  if (!Number.isFinite(numericChange)) {
    return "Pirmas pilnas mėnuo";
  }

  const prefix = numericChange > 0 ? "+" : "";
  return `${prefix}${numericChange}% prieš praeitą mėnesį`;
};

export const getBudgetStatus = ({ spent, limitAmount }) => {
  if (!limitAmount) {
    return "unset";
  }

  if (spent > limitAmount) {
    return "over";
  }

  if (spent >= limitAmount * 0.85) {
    return "warning";
  }

  return "healthy";
};

export const getGoalProgress = (goal) => {
  const result = goalProgress(goal);

  return {
    progress: result.visualProgress,
    remaining: result.remaining,
    complete: result.complete,
  };
};

export const recurringMonthlyEquivalent = (expense) => getRecurringMonthlyEquivalent(expense);

export const formatRecurringFrequency = (value, options = DEFAULT_RECURRING_FREQUENCIES) =>
  options.find((option) => option.value === value)?.label || value;

const splitCsvLine = (line, delimiter) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const detectCsvDelimiter = (headerLine) => {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
};

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ą]/g, "a")
    .replace(/[č]/g, "c")
    .replace(/[ęė]/g, "e")
    .replace(/[į]/g, "i")
    .replace(/[š]/g, "s")
    .replace(/[ųū]/g, "u")
    .replace(/[ž]/g, "z");

const findHeaderValue = (row, aliases) => {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim()) {
      return String(row[alias]).trim();
    }
  }

  return "";
};

const normalizeAmount = (rawValue) => {
  const cleaned = String(rawValue || "")
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/,/g, ".");
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : NaN;
};

const normalizeDateValue = (rawValue) => {
  const value = String(rawValue || "").trim();

  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}[./-]\d{2}[./-]\d{4}$/.test(value)) {
    const [day, month, year] = value.split(/[./-]/);
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

export const parseSavingsCsvText = ({ categories = DEFAULT_CATEGORIES, includeIncomplete = false, text }) => {
  const trimmed = String(text || "").trim();

  if (!trimmed) {
    return [];
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });

  const normalizedRows = rows
    .map((row) => {
      const title = findHeaderValue(row, ["title", "name", "description", "merchant", "payee", "details"]);
      const amount = normalizeAmount(findHeaderValue(row, ["amount", "sum", "value", "debit", "price"]));
      const date = normalizeDateValue(findHeaderValue(row, ["date", "transactiondate", "bookingdate", "data"]));
      const categoryCandidate = findHeaderValue(row, ["category", "kategorija"]);
      const notes = findHeaderValue(row, ["notes", "note", "memo", "comment", "pastabos"]);

      return {
        title,
        amount,
        date,
        category: categories.includes(categoryCandidate) ? categoryCandidate : "Kita",
        notes,
      };
    });

  if (includeIncomplete) {
    return normalizedRows;
  }

  return normalizedRows.filter((row) => row.title && Number.isFinite(row.amount) && row.amount > 0 && row.date);
};
