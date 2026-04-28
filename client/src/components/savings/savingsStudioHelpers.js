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

export const currentDateInput = () => new Date().toISOString().slice(0, 10);
export const currentMonthKey = () => new Date().toISOString().slice(0, 7);

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

export const monthLabel = (monthKey) =>
  new Intl.DateTimeFormat("lt-LT", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00`));

export const buildMonthOptions = (entries) => {
  const months = new Set(entries.map((entry) => entry.date.slice(0, 7)));
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
  if (change === null || Number.isNaN(change)) {
    return "Pirmas pilnas mėnuo";
  }

  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change}% prieš praeitą mėnesį`;
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
  const targetAmount = Number(goal.targetAmount || 0);
  const currentAmount = Number(goal.currentAmount || 0);

  if (!targetAmount) {
    return {
      progress: 0,
      remaining: 0,
      complete: false,
    };
  }

  return {
    progress: Math.min((currentAmount / targetAmount) * 100, 100),
    remaining: Number((targetAmount - currentAmount).toFixed(2)),
    complete: currentAmount >= targetAmount,
  };
};

export const recurringMonthlyEquivalent = (expense) => {
  const amount = Number(expense.amount || 0);

  switch (expense.frequency) {
    case "weekly":
      return Number((((amount * 52) / 12) || 0).toFixed(2));
    case "quarterly":
      return Number((amount / 3).toFixed(2));
    case "yearly":
      return Number((amount / 12).toFixed(2));
    case "monthly":
    default:
      return Number(amount.toFixed(2));
  }
};

export const formatRecurringFrequency = (value, options = DEFAULT_RECURRING_FREQUENCIES) =>
  options.find((option) => option.value === value)?.label || value;
