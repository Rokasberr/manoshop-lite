const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const RecurringExpense = require("../models/RecurringExpense");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const {
  buildSavingsSummaryPayload,
  deleteSavingsEntry,
  getSavingsSummary,
} = require("../controllers/savingsStudioController");
const {
  buildSavingsSummary,
  goalProgress,
  isStrictDateKey,
  isStrictMonthKey,
  moneyAmount,
  recurringMonthlyEquivalent,
  shiftMonthKey,
  sumMoney,
} = require("../../shared/savingsStudioCalculations.cjs");

const root = path.resolve(__dirname, "..", "..");

const importClientHelpers = () =>
  import(
    pathToFileURL(
      path.join(root, "client", "src", "components", "savings", "savingsStudioHelpers.js")
    ).href
  );

const doc = (value) => ({
  ...value,
  toObject() {
    return { ...value };
  },
});

const makeResponse = () => ({
  body: null,
  statusCode: 200,
  json(payload) {
    this.body = payload;
    return this;
  },
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  send() {
    return this;
  },
});

test("Saving Studio money math is cent-precise and stable for malformed or large values", () => {
  assert.equal(sumMoney([0.1, 0.2]), 0.3);
  assert.equal(moneyAmount(null), 0);
  assert.equal(moneyAmount(undefined), 0);
  assert.equal(moneyAmount(""), 0);
  assert.equal(moneyAmount("not-a-number"), 0);
  assert.equal(moneyAmount(Number.POSITIVE_INFINITY), 0);
  assert.equal(sumMoney([99999999.99, 0.01]), 100000000);
});

test("Saving Studio date and month keys are calendar keys, not UTC/local rollovers", () => {
  assert.equal(isStrictMonthKey("2026-01"), true);
  assert.equal(isStrictMonthKey("2026-12"), true);
  assert.equal(isStrictMonthKey("2026-00"), false);
  assert.equal(isStrictMonthKey("2026-13"), false);
  assert.equal(isStrictDateKey("2026-02-28"), true);
  assert.equal(isStrictDateKey("2028-02-29"), true);
  assert.equal(isStrictDateKey("2026-02-29"), false);
  assert.equal(isStrictDateKey("2026-04-31"), false);
  assert.equal(shiftMonthKey("2026-01", -1), "2025-12");
  assert.equal(shiftMonthKey("2026-12", 1), "2027-01");
});

test("Saving Studio recurring monthly equivalents match every allowed frequency", async () => {
  const clientHelpers = await importClientHelpers();
  const cases = [
    ["weekly", 10, 43.33],
    ["monthly", 10, 10],
    ["quarterly", 90, 30],
    ["yearly", 120, 10],
  ];

  for (const [frequency, amount, expected] of cases) {
    assert.equal(recurringMonthlyEquivalent({ amount, frequency }), expected);
    assert.equal(clientHelpers.recurringMonthlyEquivalent({ amount, frequency }), expected);
  }
});

test("Saving Studio goal progress handles reached, exceeded, zero, malformed, and negative values", async () => {
  const clientHelpers = await importClientHelpers();

  assert.deepEqual(goalProgress({ targetAmount: 100, currentAmount: 100 }), {
    progress: 100,
    visualProgress: 100,
    remaining: 0,
    remainingAmount: 0,
    complete: true,
    savedAmount: 100,
    targetAmount: 100,
  });
  assert.deepEqual(goalProgress({ targetAmount: 100, currentAmount: 125 }), {
    progress: 125,
    visualProgress: 100,
    remaining: 0,
    remainingAmount: 0,
    complete: true,
    savedAmount: 125,
    targetAmount: 100,
  });
  assert.equal(goalProgress({ targetAmount: 0, currentAmount: 50 }).progress, 0);
  assert.equal(goalProgress({ targetAmount: 0, currentAmount: 50 }).complete, true);
  assert.equal(goalProgress({ targetAmount: 100, currentAmount: -20 }).savedAmount, 0);
  assert.equal(clientHelpers.getGoalProgress({ targetAmount: 100, currentAmount: 125 }).progress, 100);
});

test("Saving Studio summary separates actual expenses from recurring forecast and exposes deficits", () => {
  const summary = buildSavingsSummary({
    month: "2026-08",
    profile: { monthlyIncome: 100, monthlySavingsTarget: 25 },
    entries: [
      { title: "July", amount: 999, category: "Maistas", date: "2026-07-31" },
      { title: "August start", amount: 0.1, category: "Maistas", date: "2026-08-01" },
      { title: "August end", amount: 0.2, category: "Maistas", date: "2026-08-31" },
      {
        title: "Rent logged",
        amount: 40,
        category: "Būstas",
        date: "2026-08-15",
        importSource: { system: "recurring-expense", entryId: "recurring-rent" },
      },
      { title: "September", amount: 888, category: "Maistas", date: "2026-09-01" },
    ],
    recurringExpenses: [
      { _id: "recurring-rent", title: "Rent", amount: 40, category: "Būstas", frequency: "monthly", lastLoggedMonth: "2026-08" },
      { title: "Gym", amount: 12, category: "Sveikata", frequency: "monthly", lastLoggedMonth: "" },
    ],
    budgets: [
      { category: "Maistas", limitAmount: 0 },
      { category: "Būstas", limitAmount: 30 },
      { category: "Sveikata", limitAmount: 10 },
    ],
  });

  assert.equal(summary.monthTotal, 40.3);
  assert.equal(summary.totalMonthlyExpenses, 40.3);
  assert.equal(summary.recurringMonthlyTotal, 12);
  assert.equal(summary.projectedMonthTotal, 52.3);
  assert.equal(summary.fixedVsFlexible.loggedRecurring, 40);
  assert.equal(summary.fixedVsFlexible.recurringRemaining, 12);
  assert.equal(summary.fixedVsFlexible.fixedProjected, 52);
  assert.equal(summary.fixedVsFlexible.flexibleSpent, 0.3);
  assert.equal(summary.balance, 59.7);
  assert.equal(summary.safeToSaveAfterRecurring, 47.7);
  assert.equal(summary.categoryTotals.length, 2);
  assert.equal(summary.categoryTotals.find((entry) => entry.category === "Maistas").total, 0.3);
  assert.equal(summary.budgetProgress.find((entry) => entry.category === "Būstas").status, "over");
  assert.equal(summary.budgetProgress.find((entry) => entry.category === "Būstas").overAmount, 10);
  assert.equal(summary.budgetProgress.find((entry) => entry.category === "Maistas").status, "unset");
});

test("Saving Studio recurring forecast is disabled by selected-month linked entries, not lastLoggedMonth", () => {
  const recurring = { _id: "recurring-rent", title: "Rent", amount: 40, category: "Būstas", frequency: "monthly", lastLoggedMonth: "2026-09" };
  const entries = [
    {
      title: "August rent",
      amount: 40,
      category: "Būstas",
      date: "2026-08-05",
      importSource: { system: "recurring-expense", entryId: "recurring-rent" },
    },
    {
      title: "September rent",
      amount: 40,
      category: "Būstas",
      date: "2026-09-05",
      importSource: { system: "recurring-expense", entryId: "recurring-rent" },
    },
  ];

  const august = buildSavingsSummary({ month: "2026-08", entries, recurringExpenses: [recurring] });
  const september = buildSavingsSummary({ month: "2026-09", entries, recurringExpenses: [recurring] });

  assert.equal(august.monthTotal, 40);
  assert.equal(august.recurringMonthlyTotal, 0);
  assert.equal(august.fixedVsFlexible.loggedRecurring, 40);
  assert.equal(september.monthTotal, 40);
  assert.equal(september.recurringMonthlyTotal, 0);
  assert.equal(september.fixedVsFlexible.loggedRecurring, 40);
});

test("Saving Studio recurring forecast stays active when selected month has no linked entry", () => {
  const summary = buildSavingsSummary({
    month: "2026-08",
    entries: [
      {
        title: "September rent",
        amount: 40,
        category: "Būstas",
        date: "2026-09-05",
        importSource: { system: "recurring-expense", entryId: "recurring-rent" },
      },
    ],
    recurringExpenses: [
      { _id: "recurring-rent", title: "Rent", amount: 40, category: "Būstas", frequency: "monthly", lastLoggedMonth: "2026-09" },
    ],
  });

  assert.equal(summary.monthTotal, 0);
  assert.equal(summary.recurringMonthlyTotal, 40);
  assert.equal(summary.fixedVsFlexible.recurringRemaining, 40);
});

test("Saving Studio recurring forecast is not disabled by another recurring, CSV, or manual entry", () => {
  const summary = buildSavingsSummary({
    month: "2026-08",
    entries: [
      {
        title: "Other recurring",
        amount: 20,
        category: "Būstas",
        date: "2026-08-03",
        importSource: { system: "recurring-expense", entryId: "other-recurring" },
      },
      {
        title: "CSV rent",
        amount: 40,
        category: "Būstas",
        date: "2026-08-04",
        importSource: { system: "csv-upload", entryId: "recurring-rent" },
      },
      {
        title: "Manual rent",
        amount: 40,
        category: "Būstas",
        date: "2026-08-05",
      },
    ],
    recurringExpenses: [
      { _id: "recurring-rent", title: "Rent", amount: 40, category: "Būstas", frequency: "monthly", lastLoggedMonth: "2026-08" },
    ],
  });

  assert.equal(summary.monthTotal, 100);
  assert.equal(summary.recurringMonthlyTotal, 40);
  assert.equal(summary.fixedVsFlexible.loggedRecurring, 20);
});

test("Saving Studio summary keeps negative balance visible and avoids misleading savings percent", () => {
  const summary = buildSavingsSummary({
    month: "2026-08",
    profile: { monthlyIncome: 50 },
    entries: [{ title: "Large", amount: 75, category: "Kita", date: "2026-08-20" }],
  });

  assert.equal(summary.balance, -25);
  assert.equal(summary.deficit, 25);
  assert.equal(summary.availableToSave, -25);
  assert.equal(summary.savingsCapacity.availableSavings, 0);
  assert.equal(summary.savingsCapacity.savingsPercent, 0);
});

test("Saving Studio summary handles zero income, zero expenses, and zero budget denominators", () => {
  const summary = buildSavingsSummary({
    month: "2026-08",
    profile: { monthlyIncome: 0 },
    budgets: [{ category: "Maistas", limitAmount: 0 }],
  });

  assert.equal(summary.monthlyIncome, 0);
  assert.equal(summary.monthTotal, 0);
  assert.equal(summary.balance, 0);
  assert.equal(summary.savingsCapacity.savingsPercent, 0);
  assert.equal(summary.budgetProgress.find((entry) => entry.category === "Maistas").percentUsed, 0);
});

test("Saving Studio summary updates after CRUD-like entry changes", () => {
  const base = {
    month: "2026-08",
    profile: { monthlyIncome: 100 },
    entries: [{ title: "One", amount: 10, category: "Kita", date: "2026-08-10" }],
  };

  assert.equal(buildSavingsSummary(base).monthTotal, 10);
  assert.equal(buildSavingsSummary({ ...base, entries: [...base.entries, { title: "Two", amount: 5, category: "Kita", date: "2026-08-11" }] }).monthTotal, 15);
  assert.equal(buildSavingsSummary({ ...base, entries: [] }).monthTotal, 0);
});

test("Saving Studio server summary is user-scoped and month-scoped without real MongoDB", async () => {
  const calls = [];
  const originals = {
    entryFind: SavingsEntry.find,
    profileFindOneAndUpdate: SavingsStudioProfile.findOneAndUpdate,
    recurringFind: RecurringExpense.find,
    budgetFind: SavingsBudget.find,
    goalFind: SavingsGoal.find,
  };

  SavingsEntry.find = (query) => {
    calls.push(["entries", query]);
    return [
      doc({ title: "Own", amount: 25, category: "Maistas", date: "2026-08-20", user: query.user }),
      doc({ title: "Other month", amount: 99, category: "Maistas", date: "2026-09-01", user: query.user }),
    ];
  };
  SavingsStudioProfile.findOneAndUpdate = (query) => {
    calls.push(["profile", query]);
    return doc({ user: query.user, monthlyIncome: 100, monthlySavingsTarget: 10 });
  };
  RecurringExpense.find = (query) => {
    calls.push(["recurring", query]);
    return [doc({ title: "Weekly", amount: 10, category: "Kita", frequency: "weekly", lastLoggedMonth: "" })];
  };
  SavingsBudget.find = (query) => {
    calls.push(["budgets", query]);
    return [doc({ user: query.user, month: query.month, category: "Maistas", limitAmount: 20 })];
  };
  SavingsGoal.find = (query) => {
    calls.push(["goals", query]);
    return [doc({ user: query.user, title: "Reserve", targetAmount: 100, currentAmount: 50 })];
  };

  try {
    const { summary } = await buildSavingsSummaryPayload("user-a", { month: "2026-08" });

    assert.equal(summary.month, "2026-08");
    assert.equal(summary.monthTotal, 25);
    assert.equal(summary.previousMonthTotal, 0);
    assert.equal(summary.recurringMonthlyTotal, 43.33);
    assert.equal(summary.budgetProgress.find((entry) => entry.category === "Maistas").status, "over");
    assert.equal(calls.every(([, query]) => String(query.user) === "user-a"), true);
    assert.equal(calls.find(([name]) => name === "budgets")[1].month, "2026-08");
  } finally {
    SavingsEntry.find = originals.entryFind;
    SavingsStudioProfile.findOneAndUpdate = originals.profileFindOneAndUpdate;
    RecurringExpense.find = originals.recurringFind;
    SavingsBudget.find = originals.budgetFind;
    SavingsGoal.find = originals.goalFind;
  }
});

test("Saving Studio summary endpoint keeps month query backward compatibility", async () => {
  const originals = {
    entryFind: SavingsEntry.find,
    profileFindOneAndUpdate: SavingsStudioProfile.findOneAndUpdate,
    recurringFind: RecurringExpense.find,
    budgetFind: SavingsBudget.find,
    goalFind: SavingsGoal.find,
  };
  const budgetQueries = [];

  SavingsEntry.find = () => [];
  SavingsStudioProfile.findOneAndUpdate = (query) => doc({ user: query.user, monthlyIncome: 100 });
  RecurringExpense.find = () => [];
  SavingsBudget.find = (query) => {
    budgetQueries.push(query);
    return [];
  };
  SavingsGoal.find = () => [];

  try {
    const currentResponse = makeResponse();
    await getSavingsSummary({ user: { _id: "user-a" }, query: {} }, currentResponse);
    assert.equal(currentResponse.body.summary.month, new Date().toISOString().slice(0, 7));
    assert.equal(budgetQueries.at(-1).user, "user-a");

    const explicitResponse = makeResponse();
    await getSavingsSummary({ user: { _id: "user-a" }, query: { month: "2026-08" } }, explicitResponse);
    assert.equal(explicitResponse.body.summary.month, "2026-08");
    assert.equal(budgetQueries.at(-1).month, "2026-08");

    const emptyResponse = makeResponse();
    await getSavingsSummary({ user: { _id: "user-a" }, query: { month: "" } }, emptyResponse);
    assert.equal(emptyResponse.body.summary.month, new Date().toISOString().slice(0, 7));

    await assert.rejects(
      () => getSavingsSummary({ user: { _id: "user-a" }, query: { month: "2026-13" } }, makeResponse()),
      (error) => error.statusCode === 400
    );
  } finally {
    SavingsEntry.find = originals.entryFind;
    SavingsStudioProfile.findOneAndUpdate = originals.profileFindOneAndUpdate;
    RecurringExpense.find = originals.recurringFind;
    SavingsBudget.find = originals.budgetFind;
    SavingsGoal.find = originals.goalFind;
  }
});

test("Saving Studio deleting a linked recurring entry clears only matching user-scoped lastLoggedMonth", async () => {
  const originalEntryFindOne = SavingsEntry.findOne;
  const originalRecurringFindOneAndUpdate = RecurringExpense.findOneAndUpdate;
  const originalAuditCreate = require("../models/SavingsStudioAuditLog").create;
  const updates = [];
  let deleted = false;

  SavingsEntry.findOne = async (query) =>
    doc({
      _id: query._id,
      user: query.user,
      amount: 40,
      date: "2026-08-05",
      importSource: { system: "recurring-expense", entryId: "recurring-rent" },
      async deleteOne() {
        deleted = true;
      },
    });
  RecurringExpense.findOneAndUpdate = async (query, update) => {
    updates.push({ query, update });
    return null;
  };
  require("../models/SavingsStudioAuditLog").create = async () => ({});

  try {
    const response = makeResponse();
    await deleteSavingsEntry({ params: { entryId: "entry-1" }, user: { _id: "user-a" } }, response);

    assert.equal(deleted, true);
    assert.equal(response.statusCode, 204);
    assert.deepEqual(updates[0].query, {
      _id: "recurring-rent",
      user: "user-a",
      lastLoggedMonth: "2026-08",
    });
    assert.deepEqual(updates[0].update, { $set: { lastLoggedMonth: "" } });
  } finally {
    SavingsEntry.findOne = originalEntryFindOne;
    RecurringExpense.findOneAndUpdate = originalRecurringFindOneAndUpdate;
    require("../models/SavingsStudioAuditLog").create = originalAuditCreate;
  }
});

test("Saving Studio deleting manual entries or nonmatching recurring months does not clear recurring state", async () => {
  const originalEntryFindOne = SavingsEntry.findOne;
  const originalRecurringFindOneAndUpdate = RecurringExpense.findOneAndUpdate;
  const originalAuditCreate = require("../models/SavingsStudioAuditLog").create;
  const updates = [];

  RecurringExpense.findOneAndUpdate = async (query, update) => {
    updates.push({ query, update });
    return null;
  };
  require("../models/SavingsStudioAuditLog").create = async () => ({});

  try {
    SavingsEntry.findOne = async (query) =>
      doc({
        _id: query._id,
        user: query.user,
        amount: 15,
        date: "2026-08-05",
        importSource: { system: "csv-upload", entryId: "recurring-rent" },
        async deleteOne() {},
      });
    await deleteSavingsEntry({ params: { entryId: "csv-entry" }, user: { _id: "user-a" } }, makeResponse());
    assert.equal(updates.length, 0);

    SavingsEntry.findOne = async (query) =>
      doc({
        _id: query._id,
        user: query.user,
        amount: 40,
        date: "2026-08-05",
        importSource: { system: "recurring-expense", entryId: "recurring-rent" },
        async deleteOne() {},
      });
    await deleteSavingsEntry({ params: { entryId: "recurring-entry" }, user: { _id: "user-a" } }, makeResponse());
    assert.equal(updates[0].query.lastLoggedMonth, "2026-08");
    assert.notEqual(updates[0].query.lastLoggedMonth, "2026-09");
  } finally {
    SavingsEntry.findOne = originalEntryFindOne;
    RecurringExpense.findOneAndUpdate = originalRecurringFindOneAndUpdate;
    require("../models/SavingsStudioAuditLog").create = originalAuditCreate;
  }
});

test("Saving Studio entry delete failure leaves recurring state unchanged", async () => {
  const originalEntryFindOne = SavingsEntry.findOne;
  const originalRecurringFindOneAndUpdate = RecurringExpense.findOneAndUpdate;
  let updateCalled = false;

  SavingsEntry.findOne = async (query) =>
    doc({
      _id: query._id,
      user: query.user,
      date: "2026-08-05",
      importSource: { system: "recurring-expense", entryId: "recurring-rent" },
      async deleteOne() {
        throw new Error("delete failed");
      },
    });
  RecurringExpense.findOneAndUpdate = async () => {
    updateCalled = true;
  };

  try {
    await assert.rejects(
      () => deleteSavingsEntry({ params: { entryId: "entry-1" }, user: { _id: "user-a" } }, makeResponse()),
      /delete failed/
    );
    assert.equal(updateCalled, false);
  } finally {
    SavingsEntry.findOne = originalEntryFindOne;
    RecurringExpense.findOneAndUpdate = originalRecurringFindOneAndUpdate;
  }
});

test("Saving Studio server and client helper formulas match for shared indicators", async () => {
  const clientHelpers = await importClientHelpers();
  const goal = { targetAmount: 200, currentAmount: 50 };
  const recurring = { amount: 26, frequency: "weekly" };

  assert.equal(clientHelpers.recurringMonthlyEquivalent(recurring), recurringMonthlyEquivalent(recurring));
  assert.equal(clientHelpers.getGoalProgress(goal).remaining, goalProgress(goal).remaining);
  assert.equal(clientHelpers.getGoalProgress(goal).progress, goalProgress(goal).visualProgress);
});
