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

export const emptyEntry = (categories = DEFAULT_CATEGORIES) => ({
  title: "",
  amount: "",
  category: categories[1] || categories[0] || "Maistas",
  date: currentDateInput(),
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
