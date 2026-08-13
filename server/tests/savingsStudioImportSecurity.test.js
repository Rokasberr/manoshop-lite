const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const SavingsEntry = require("../models/SavingsEntry");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const { validateObjectId } = require("../middleware/requestValidation");
const {
  createRecurringExpense,
  createSavingsEntry,
  createSavingsGoal,
  importSavingsEntries,
  previewSavingsEntriesImport,
  upsertSavingsBudgets,
} = require("../controllers/savingsStudioController");

const root = path.resolve(__dirname, "..", "..");

const baseRows = [
  { title: "Coffee", amount: 4.5, category: "Maistas", date: "2026-08-10" },
  { title: "Coffee", amount: 4.5, category: "Kita", date: "2026-08-10" },
  { title: "Groceries", amount: 30, category: "Maistas", date: "2026-08-11" },
  { title: "  groceries  ", amount: 30, category: "Maistas", date: "2026-08-11" },
  { title: "X", amount: -1, category: "Maistas", date: "2026-08-12" },
];

const makeResponse = () => {
  const response = {
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
  };

  return response;
};

const withSavingsEntryStubs = async ({ existingEntries = [], insertMany = async (entries) => entries }, callback) => {
  const originalFind = SavingsEntry.find;
  const originalInsertMany = SavingsEntry.insertMany;
  const originalAuditCreate = SavingsStudioAuditLog.create;

  SavingsEntry.find = () => ({
    select: async () => existingEntries,
  });
  SavingsEntry.insertMany = insertMany;
  SavingsStudioAuditLog.create = async () => ({});

  try {
    await callback();
  } finally {
    SavingsEntry.find = originalFind;
    SavingsEntry.insertMany = originalInsertMany;
    SavingsStudioAuditLog.create = originalAuditCreate;
  }
};

test("Savings Studio CSV preview rejects exact normalized duplicates without writing entries", async () => {
  let insertCalled = false;

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: " coffee ", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      insertMany: async () => {
        insertCalled = true;
        return [];
      },
    },
    async () => {
      const res = makeResponse();

      await previewSavingsEntriesImport(
        {
          user: { _id: "user-1" },
          body: { rows: baseRows },
        },
        res
      );

      assert.equal(insertCalled, false);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.totalRows, 5);
      assert.equal(res.body.validCount, 2);
      assert.equal(res.body.invalidCount, 1);
      assert.equal(res.body.duplicateCount, 2);
      assert.deepEqual(
        res.body.preview.map((row) => row.status),
        ["duplicate", "ok", "ok", "duplicate", "error"]
      );
      assert.equal(res.body.validRows.some((row) => row.category === "Kita"), true);
    }
  );
});

test("Savings Studio CSV confirm imports accepted rows and returns precise rejection counts", async () => {
  const insertedPayloads = [];

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: " coffee ", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      insertMany: async (entries) => {
        insertedPayloads.push(...entries);
        return entries.map((entry, index) => ({ _id: `entry-${index + 1}`, ...entry }));
      },
    },
    async () => {
      const res = makeResponse();

      await importSavingsEntries(
        {
          user: { _id: "user-1" },
          body: { rows: baseRows },
        },
        res
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.importedCount, 2);
      assert.equal(res.body.rejectedCount, 3);
      assert.equal(res.body.invalidRows.length, 1);
      assert.equal(res.body.duplicateRows.length, 2);
      assert.equal(insertedPayloads.length, 2);
      assert.deepEqual(
        insertedPayloads.map((entry) => [entry.title, entry.category]),
        [
          ["Coffee", "Kita"],
          ["Groceries", "Maistas"],
        ]
      );
      assert.deepEqual(insertedPayloads[0].importSource, {
        system: "csv-upload",
        entryId: "",
      });
    }
  );
});

test("Savings Studio CSV confirm with only invalid rows does not call insertMany", async () => {
  let insertCalled = false;

  await withSavingsEntryStubs(
    {
      insertMany: async () => {
        insertCalled = true;
        return [];
      },
    },
    async () => {
      const res = makeResponse();

      await importSavingsEntries(
        {
          user: { _id: "user-1" },
          body: {
            rows: [{ title: "X", amount: -1, category: "Maistas", date: "2026-08-12" }],
          },
        },
        res
      );

      assert.equal(insertCalled, false);
      assert.equal(res.body.importedCount, 0);
      assert.equal(res.body.rejectedCount, 1);
      assert.equal(res.body.invalidRows.length, 1);
      assert.equal(res.body.duplicateRows.length, 0);
    }
  );
});

test("Savings Studio CSV confirm with only duplicate rows does not call insertMany", async () => {
  let insertCalled = false;

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: "Coffee", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      insertMany: async () => {
        insertCalled = true;
        return [];
      },
    },
    async () => {
      const res = makeResponse();

      await importSavingsEntries(
        {
          user: { _id: "user-1" },
          body: {
            rows: [{ title: " coffee ", amount: 4.5, category: "Maistas", date: "2026-08-10" }],
          },
        },
        res
      );

      assert.equal(insertCalled, false);
      assert.equal(res.body.importedCount, 0);
      assert.equal(res.body.rejectedCount, 1);
      assert.equal(res.body.invalidRows.length, 0);
      assert.equal(res.body.duplicateRows.length, 1);
    }
  );
});

test("Savings Studio mutable entity routes include ObjectId validators", () => {
  const routeSource = fs.readFileSync(path.join(root, "server", "routes", "savingsStudioRoutes.js"), "utf8");

  assert.match(routeSource, /validateObjectId\("entryId"\), asyncHandler\(updateSavingsEntry\)/);
  assert.match(routeSource, /validateObjectId\("entryId"\), asyncHandler\(deleteSavingsEntry\)/);
  assert.match(routeSource, /validateObjectId\("goalId"\), asyncHandler\(updateSavingsGoal\)/);
  assert.match(routeSource, /validateObjectId\("goalId"\), asyncHandler\(deleteSavingsGoal\)/);
  assert.match(routeSource, /validateObjectId\("recurringId"\), asyncHandler\(logRecurringExpenseAsEntry\)/);
  assert.match(routeSource, /validateObjectId\("recurringId"\), asyncHandler\(updateRecurringExpense\)/);
  assert.match(routeSource, /validateObjectId\("recurringId"\), asyncHandler\(deleteRecurringExpense\)/);
});

test("Savings Studio ObjectId middleware returns 400 before controller work", async () => {
  for (const fieldName of ["entryId", "goalId", "recurringId"]) {
    let controllerReached = false;
    const middleware = validateObjectId(fieldName);
    const error = await new Promise((resolve) => {
      middleware({ params: { [fieldName]: "not-an-object-id" } }, {}, (nextError) => {
        if (!nextError) {
          controllerReached = true;
        }

        resolve(nextError);
      });
    });

    assert.equal(controllerReached, false);
    assert.equal(error.statusCode, 400);
  }
});

test("Savings Studio CSV duplicate protection is documented as best-effort", () => {
  const doc = fs.readFileSync(path.join(root, "codex-work", "PERSONAL_MEMBER_AREA.md"), "utf8");

  assert.match(doc, /best-effort/i);
  assert.match(doc, /ne atomin/i);
});

test("Savings Studio rejects unreasonably large money amounts before DB writes", async () => {
  const user = { _id: "user-1" };
  const hugeAmount = 100000001;
  const res = makeResponse();

  await assert.rejects(
    () =>
      createSavingsEntry(
        {
          user,
          body: { title: "Large expense", amount: hugeAmount, category: "Maistas", date: "2026-08-10" },
        },
        res
      ),
    /per didel/
  );
  await assert.rejects(
    () =>
      upsertSavingsBudgets(
        {
          user,
          body: { month: "2026-08", budgets: [{ category: "Maistas", limitAmount: hugeAmount }] },
        },
        res
      ),
    /per didel/
  );
  await assert.rejects(
    () =>
      createSavingsGoal(
        {
          user,
          body: { title: "Large goal", targetAmount: hugeAmount, currentAmount: 0, targetDate: "" },
        },
        res
      ),
    /per didel/
  );
  await assert.rejects(
    () =>
      createRecurringExpense(
        {
          user,
          body: { title: "Large recurring", amount: hugeAmount, category: "Maistas", frequency: "monthly" },
        },
        res
      ),
    /per didel/
  );
});
