const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const RecurringExpense = require("../models/RecurringExpense");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const {
  downloadSavingsSummaryDocument,
  exportSavingsBackup,
  exportSavingsEntriesCsv,
} = require("../controllers/savingsStudioController");

const controllerPath = path.join(__dirname, "..", "controllers", "savingsStudioController.js");

const doc = (value) => ({
  ...value,
  toObject() {
    return { ...value };
  },
});

const makeResponse = () => ({
  body: null,
  headers: {},
  statusCode: 200,
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  },
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  send(payload) {
    this.body = payload;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const chain = (rows) => ({
  sort() {
    return {
      limit() {
        return rows;
      },
    };
  },
});

const withSavingsStubs = async (stubs, run) => {
  const originals = {
    entryFind: SavingsEntry.find,
    budgetFind: SavingsBudget.find,
    goalFind: SavingsGoal.find,
    recurringFind: RecurringExpense.find,
    profileFindOneAndUpdate: SavingsStudioProfile.findOneAndUpdate,
    auditCreate: SavingsStudioAuditLog.create,
  };

  SavingsEntry.find = stubs.entryFind || (() => []);
  SavingsBudget.find = stubs.budgetFind || (() => []);
  SavingsGoal.find = stubs.goalFind || (() => []);
  RecurringExpense.find = stubs.recurringFind || (() => []);
  SavingsStudioProfile.findOneAndUpdate =
    stubs.profileFindOneAndUpdate || ((query) => doc({ _id: "profile-1", user: query.user }));
  SavingsStudioAuditLog.create = async () => ({});

  try {
    await run();
  } finally {
    SavingsEntry.find = originals.entryFind;
    SavingsBudget.find = originals.budgetFind;
    SavingsGoal.find = originals.goalFind;
    RecurringExpense.find = originals.recurringFind;
    SavingsStudioProfile.findOneAndUpdate = originals.profileFindOneAndUpdate;
    SavingsStudioAuditLog.create = originals.auditCreate;
  }
};

test("Saving Studio summary export controller has no unreachable legacy response path", () => {
  const source = fs.readFileSync(controllerPath, "utf8");
  const functionSource = source.slice(
    source.indexOf("const downloadSavingsSummaryDocument = async"),
    source.indexOf("const sendSavingsSummaryEmailNow = async")
  );

  assert.doesNotMatch(functionSource, /if \(false\)/);
  assert.doesNotMatch(functionSource, /buildSummaryEmail/);
  assert.equal((functionSource.match(/res\.status\(200\)\.send/g) || []).length, 1);
  assert.match(functionSource, /frequency !== "monthly"/);
});

test("Saving Studio backup uses explicit DTO serializers instead of a generic denylist serializer", () => {
  const source = fs.readFileSync(controllerPath, "utf8");

  assert.match(source, /const serializeSavingsProfileBackup = \(profile\) =>/);
  assert.match(source, /const serializeSavingsEntryBackup = \(entry\) =>/);
  assert.match(source, /const serializeSavingsBudgetBackup = \(budget\) =>/);
  assert.match(source, /const serializeSavingsGoalBackup = \(goal\) =>/);
  assert.match(source, /const serializeRecurringExpenseBackup = \(expense\) =>/);
  assert.doesNotMatch(source, /const serializePublicDocument = /);
  assert.match(source, /profile: serializeSavingsProfileBackup\(payload\.profile\)/);
  assert.match(source, /entries: payload\.entries\.map\(serializeSavingsEntryBackup\)/);
  assert.match(source, /budgets: allBudgets\.map\(serializeSavingsBudgetBackup\)/);
  assert.match(source, /goals: payload\.goals\.map\(serializeSavingsGoalBackup\)/);
  assert.match(source, /recurringExpenses: payload\.recurringExpenses\.map\(serializeRecurringExpenseBackup\)/);
});

test("Saving Studio monthly TXT report uses selected month and authoritative summary fields", async () => {
  const calls = [];

  await withSavingsStubs(
    {
      entryFind(query) {
        calls.push(["entries", query]);
        return [
          doc({ _id: "entry-1", user: query.user, title: "Kava", amount: 10, category: "Maistas", date: "2026-08-05" }),
          doc({
            _id: "entry-2",
            user: query.user,
            title: "Nuoma",
            amount: 40,
            category: "Būstas",
            date: "2026-08-06",
            importSource: { system: "recurring-expense", entryId: "rent" },
          }),
          doc({ _id: "entry-other-month", user: query.user, title: "Kita", amount: 99, category: "Kita", date: "2026-09-01" }),
        ];
      },
      budgetFind(query) {
        calls.push(["budgets", query]);
        return [doc({ _id: "budget-1", user: query.user, month: query.month, category: "Maistas", limitAmount: 25 })];
      },
      recurringFind(query) {
        calls.push(["recurring", query]);
        return [doc({ _id: "rent", user: query.user, title: "Nuoma", amount: 40, category: "Būstas", frequency: "monthly" })];
      },
      goalFind(query) {
        calls.push(["goals", query]);
        return [doc({ _id: "goal-1", user: query.user, title: "Rezervas", targetAmount: 100, currentAmount: 20 })];
      },
      profileFindOneAndUpdate(query) {
        calls.push(["profile", query]);
        return doc({ _id: "profile-1", user: query.user, monthlyIncome: 100, monthlySavingsTarget: 20 });
      },
    },
    async () => {
      const response = makeResponse();
      await downloadSavingsSummaryDocument(
        { query: { frequency: "monthly", format: "txt", month: "2026-08" }, user: { _id: "user-a", name: "Ona" } },
        response
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.headers["Content-Type"], "text/plain; charset=utf-8");
      assert.match(response.headers["Content-Disposition"], /stilloak-monthly-summary-2026-08/);
      assert.match(response.body, /Mėnesio ataskaita: 2026-08/);
      assert.match(response.body, /Pajamos: 100,00\s*€/);
      assert.match(response.body, /Faktinės mėnesio išlaidos: 50,00\s*€/);
      assert.match(response.body, /Likusi pasikartojančių išlaidų prognozė: 0,00\s*€/);
      assert.match(response.body, /Bendra mėnesio prognozė: 50,00\s*€/);
      assert.match(response.body, /Pasikartojančių išlaidų prognozė rodoma atskirai/);
      assert.equal(calls.every(([, query]) => String(query.user) === "user-a"), true);
      assert.equal(calls.find(([name]) => name === "budgets")[1].month, "2026-08");
    }
  );
});

test("Saving Studio TXT report defaults to monthly and rejects weekly, invalid month, or non-TXT format", async () => {
  await withSavingsStubs(
    {
      entryFind: () => [],
      budgetFind: (query) => {
        assert.equal(query.month, new Date().toISOString().slice(0, 7));
        return [];
      },
    },
    async () => {
      const response = makeResponse();
      await downloadSavingsSummaryDocument({ query: {}, user: { _id: "user-a", name: "Ona" } }, response);
      assert.match(response.body, new RegExp(`Mėnesio ataskaita: ${new Date().toISOString().slice(0, 7)}`));
      assert.match(response.headers["Content-Disposition"], /stilloak-monthly-summary-/);
      assert.doesNotMatch(response.body, /Savaitės ataskaita/);

      await assert.rejects(
        () => downloadSavingsSummaryDocument({ query: { month: "2026-13" }, user: { _id: "user-a" } }, makeResponse()),
        (error) => error.statusCode === 400
      );
      await assert.rejects(
        () =>
          downloadSavingsSummaryDocument(
            { query: { month: "2026-08", frequency: "weekly" }, user: { _id: "user-a" } },
            makeResponse()
          ),
        (error) => error.statusCode === 400
      );
      await assert.rejects(
        () =>
          downloadSavingsSummaryDocument(
            { query: { month: "2026-08", format: "html" }, user: { _id: "user-a" } },
            makeResponse()
          ),
        (error) => error.statusCode === 400
      );
    }
  );
});

test("Saving Studio monthly TXT report includes all loaded categories, budgets, and goals without silent slicing", async () => {
  const categories = Array.from({ length: 10 }, (_value, index) => `Kategorija ${index + 1}`);

  await withSavingsStubs(
    {
      entryFind(query) {
        return categories.map((category, index) =>
          doc({
            _id: `entry-${index + 1}`,
            user: query.user,
            title: `Įrašas ${index + 1}`,
            amount: index + 1,
            category,
            date: "2026-08-20",
          })
        );
      },
      budgetFind(query) {
        return categories.map((category, index) =>
          doc({
            _id: `budget-${index + 1}`,
            user: query.user,
            month: query.month,
            category,
            limitAmount: 100 + index,
          })
        );
      },
      goalFind(query) {
        return Array.from({ length: 10 }, (_value, index) =>
          doc({
            _id: `goal-${index + 1}`,
            user: query.user,
            title: `Tikslas ${index + 1}`,
            targetAmount: 1000,
            currentAmount: index,
          })
        );
      },
    },
    async () => {
      const response = makeResponse();
      await downloadSavingsSummaryDocument({ query: { month: "2026-08" }, user: { _id: "user-a" } }, response);

      assert.match(response.body, /Kategorija 10/);
      assert.match(response.body, /Tikslas 10/);
      assert.doesNotMatch(response.body, /nerodoma|paslėpta|paslepta/i);
    }
  );
});

test("Saving Studio CSV export is user-scoped, month-scoped, escaped, formula-safe, and spreadsheet-friendly", async () => {
  const queries = [];

  await withSavingsStubs(
    {
      entryFind(query) {
        queries.push(query);
        return chain([
          doc({
            _id: "entry-1",
            user: query.user,
            date: "2026-08-20",
            title: '=SUM(1,2)',
            category: "+Maistas",
            amount: -12.5,
            notes: 'Lietuviškas tekstas, "kabutės"\nir nauja eilutė',
            importSource: { system: "csv-upload" },
          }),
          doc({
            _id: "entry-2",
            user: query.user,
            date: "2026-08-21",
            title: "-Refund",
            category: "@Kita",
            amount: 0,
            notes: " @po tarpo",
            importSource: { system: "\t=bank" },
          }),
        ]);
      },
    },
    async () => {
      const response = makeResponse();
      await exportSavingsEntriesCsv({ query: { month: "2026-08" }, user: { _id: "user-a" } }, response);

      assert.equal(queries[0].user, "user-a");
      assert.deepEqual(queries[0].date, { $gte: "2026-08-01", $lte: "2026-08-31" });
      assert.equal(response.headers["Content-Type"], "text/csv; charset=utf-8");
      assert.match(response.headers["Content-Disposition"], /stilloak-savings-studio-entries-2026-08\.csv/);
      assert.equal(response.body.charCodeAt(0), 0xfeff);
      assert.match(response.body, /"date","title","category","amount_eur","notes","source"/);
      assert.match(response.body, /"'=SUM\(1,2\)"/);
      assert.match(response.body, /"'\+Maistas"/);
      assert.match(response.body, /"'-Refund"/);
      assert.match(response.body, /"'@Kita"/);
      assert.match(response.body, /"' @po tarpo"/);
      assert.match(response.body, /"'\t=bank"/);
      assert.match(response.body, /"Lietuviškas tekstas, ""kabutės""\nir nauja eilutė"/);
      assert.match(response.body, /,-12\.50,/);
      assert.doesNotMatch(response.body, /'-12\.50/);
    }
  );
});

test("Saving Studio CSV export separates all-data scope and rejects invalid query params", async () => {
  await withSavingsStubs(
    {
      entryFind(query) {
        assert.deepEqual(query, { user: "user-a" });
        return chain([]);
      },
    },
    async () => {
      const response = makeResponse();
      await exportSavingsEntriesCsv({ query: { scope: "all" }, user: { _id: "user-a" } }, response);
      assert.match(response.headers["Content-Disposition"], /entries-all\.csv/);
      assert.match(response.body, /"date","title","category","amount_eur","notes","source"/);

      await assert.rejects(
        () => exportSavingsEntriesCsv({ query: { month: "2026-00" }, user: { _id: "user-a" } }, makeResponse()),
        (error) => error.statusCode === 400
      );
      await assert.rejects(
        () =>
          exportSavingsEntriesCsv({ query: { scope: "all", month: "2026-08" }, user: { _id: "user-a" } }, makeResponse()),
        (error) => error.statusCode === 400
      );
    }
  );
});

test("Saving Studio CSV export rejects non-finite amounts before writing the file", async () => {
  await withSavingsStubs(
    {
      entryFind() {
        return chain([
          doc({ _id: "entry-bad", date: "2026-08-20", title: "Bad", category: "Kita", amount: Number.POSITIVE_INFINITY }),
        ]);
      },
    },
    async () => {
      await assert.rejects(
        () => exportSavingsEntriesCsv({ query: { month: "2026-08" }, user: { _id: "user-a" } }, makeResponse()),
        (error) => error.statusCode === 500
      );
    }
  );
});

test("Saving Studio backup includes schema metadata and only scoped financial documents without auth secrets", async () => {
  const calls = [];

  await withSavingsStubs(
    {
      entryFind(query) {
        calls.push(["entries", query]);
        return [
          doc({
            _id: "entry-1",
            user: query.user,
            title: "Kava",
            amount: 2,
            category: "Maistas",
            date: "2026-08-01",
            notes: "ok",
            importSource: { system: "recurring-expense", entryId: "recurring-1", token: "nested-token" },
            importFingerprint: "fingerprint-1",
            unknownTopLevel: "drop-me",
            nested: { secret: "drop-me" },
          }),
        ].filter((entry) => String(entry.user) === String(query.user));
      },
      budgetFind(query) {
        calls.push(["budgets", query]);
        if (query.month) {
          return [];
        }
        return {
          sort() {
            return [
              doc({
                _id: "budget-1",
                user: query.user,
                month: "2026-08",
                category: "Maistas",
                limitAmount: 20,
                nested: { token: "drop-me" },
              }),
              doc({
                _id: "budget-other",
                user: "user-b",
                month: "2026-08",
                category: "Kita",
                limitAmount: 999,
              }),
            ].filter((budget) => String(budget.user) === String(query.user));
          },
        };
      },
      goalFind(query) {
        calls.push(["goals", query]);
        return [
          doc({
            _id: "goal-1",
            user: query.user,
            title: "Rezervas",
            targetAmount: 100,
            currentAmount: 10,
            targetDate: "2026-12-31",
            notes: "safe",
            tokenData: { token: "drop-me" },
          }),
        ].filter((goal) => String(goal.user) === String(query.user));
      },
      recurringFind(query) {
        calls.push(["recurring", query]);
        return [
          doc({
            _id: "recurring-1",
            user: query.user,
            title: "Nuoma",
            amount: 40,
            category: "Būstas",
            frequency: "monthly",
            notes: "safe",
            lastLoggedMonth: "2026-08",
            webhookSecret: "drop-me",
          }),
        ].filter((expense) => String(expense.user) === String(query.user));
      },
      profileFindOneAndUpdate(query) {
        calls.push(["profile", query]);
        return doc({
          _id: "profile-1",
          user: query.user,
          monthlyIncome: 100,
          monthlySavingsTarget: 25,
          primaryFocus: "Rezervas",
          summaryEmailsEnabled: true,
          summaryEmailFrequency: "weekly",
          nested: { secret: "drop-me" },
          stripeSecret: "sk_test_bad",
        });
      },
    },
    async () => {
      const response = makeResponse();
      await exportSavingsBackup(
        {
          query: {},
          user: {
            _id: "user-a",
            email: "ona@example.test",
            password: "hash",
            jwt: "token",
            stripeCustomerId: "cus_secret",
            subscription: { plan: "personal" },
          },
        },
        response
      );

      assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
      assert.match(response.headers["Content-Disposition"], /savings-studio-backup-\d{4}-\d{2}-\d{2}\.json/);

      const backup = JSON.parse(response.body);
      assert.equal(backup.schemaVersion, "saving-studio-backup.v1");
      assert.ok(Date.parse(backup.generatedAt));
      assert.equal(backup.entries[0].id, "entry-1");
      assert.deepEqual(Object.keys(backup.entries[0]).sort(), [
        "amount",
        "category",
        "createdAt",
        "date",
        "id",
        "importFingerprint",
        "importSource",
        "notes",
        "title",
        "updatedAt",
      ]);
      assert.deepEqual(backup.entries[0].importSource, { system: "recurring-expense", entryId: "recurring-1" });
      assert.deepEqual(Object.keys(backup.profile).sort(), [
        "createdAt",
        "id",
        "monthlyIncome",
        "monthlySavingsTarget",
        "onboardingCompleted",
        "primaryFocus",
        "summaryEmailFrequency",
        "summaryEmailLastSentAt",
        "summaryEmailsEnabled",
        "updatedAt",
      ]);
      assert.equal(backup.profile.summaryEmailFrequency, "weekly");
      assert.equal(backup.entries[0].user, undefined);
      assert.equal(backup.profile.user, undefined);
      assert.equal(backup.user, undefined);
      assert.equal(backup.auditLogs, undefined);
      assert.equal(JSON.stringify(backup).includes("drop-me"), false);
      assert.equal(JSON.stringify(backup).includes("nested-token"), false);
      assert.equal(JSON.stringify(backup).includes("budget-other"), false);
      assert.equal(JSON.stringify(backup).includes("user-b"), false);
      assert.equal(JSON.stringify(backup).includes("password"), false);
      assert.equal(JSON.stringify(backup).includes("jwt"), false);
      assert.equal(JSON.stringify(backup).includes("ona@example.test"), false);
      assert.equal(calls.every(([, query]) => String(query.user) === "user-a"), true);
    }
  );
});

test("Saving Studio backup summaryEmailFrequency matches the real profile enum", async () => {
  const enumValues = SavingsStudioProfile.schema.path("summaryEmailFrequency").enumValues.slice().sort();

  assert.deepEqual(enumValues, ["monthly", "weekly"]);

  await withSavingsStubs(
    {
      entryFind() {
        return [];
      },
      budgetFind(query) {
        if (query.month) {
          return [];
        }
        return {
          sort() {
            return [];
          },
        };
      },
      goalFind() {
        return [];
      },
      recurringFind() {
        return [];
      },
      profileFindOneAndUpdate(query) {
        return doc({
          _id: "profile-monthly",
          user: query.user,
          summaryEmailFrequency: "monthly",
          summaryEmailsEnabled: true,
        });
      },
    },
    async () => {
      const response = makeResponse();
      await exportSavingsBackup(
        {
          query: {},
          user: {
            _id: "user-a",
            email: "ona@example.test",
          },
        },
        response
      );

      const backup = JSON.parse(response.body);
      assert.equal(backup.profile.summaryEmailFrequency, "monthly");
      assert.equal(JSON.stringify(backup).includes("yearly"), false);
    }
  );
});
