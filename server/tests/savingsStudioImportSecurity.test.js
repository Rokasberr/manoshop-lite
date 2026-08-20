const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const SavingsEntry = require("../models/SavingsEntry");
const RecurringExpense = require("../models/RecurringExpense");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const { validateObjectId } = require("../middleware/requestValidation");
const {
  createRecurringExpense,
  createSavingsEntry,
  createSavingsGoal,
  buildEntryImportFingerprint,
  importSavingsEntries,
  logRecurringExpenseAsEntry,
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

const withSavingsEntryStubs = async ({ existingEntries = [], create = async (entry) => entry }, callback) => {
  const originalFind = SavingsEntry.find;
  const originalCreate = SavingsEntry.create;
  const originalAuditCreate = SavingsStudioAuditLog.create;

  SavingsEntry.find = () => ({
    select: async () => existingEntries,
  });
  SavingsEntry.create = create;
  SavingsStudioAuditLog.create = async () => ({});

  try {
    await callback();
  } finally {
    SavingsEntry.find = originalFind;
    SavingsEntry.create = originalCreate;
    SavingsStudioAuditLog.create = originalAuditCreate;
  }
};

const makeRecurringDocument = (overrides = {}) => {
  const document = {
    _id: overrides._id || "recurring-1",
    title: overrides.title || "Rent",
    amount: overrides.amount ?? 300,
    category: overrides.category || "Būstas",
    frequency: overrides.frequency || "monthly",
    notes: overrides.notes || "",
    lastLoggedMonth: overrides.lastLoggedMonth || "",
    user: overrides.user || "user-1",
  };

  document.toObject = () => ({ ...document });
  return document;
};

const withRecurringLogStubs = async (
  {
    createEntry = async (entry) => entry,
    entryFindOne = async () => null,
    recurring = makeRecurringDocument(),
    recurringFindOne = null,
    recurringFindOneAndUpdate = null,
  },
  callback
) => {
  const originalEntryCreate = SavingsEntry.create;
  const originalEntryFindOne = SavingsEntry.findOne;
  const originalRecurringFindOne = RecurringExpense.findOne;
  const originalRecurringFindOneAndUpdate = RecurringExpense.findOneAndUpdate;
  const originalAuditCreate = SavingsStudioAuditLog.create;
  const auditLogs = [];
  const updates = [];

  SavingsEntry.create = createEntry;
  SavingsEntry.findOne = entryFindOne;
  RecurringExpense.findOne =
    recurringFindOne ||
    (async (query) => {
      if (String(query._id) !== String(recurring._id) || String(query.user) !== String(recurring.user)) {
        return null;
      }

      return recurring;
    });
  RecurringExpense.findOneAndUpdate =
    recurringFindOneAndUpdate ||
    (async (query, update) => {
      updates.push({ query, update });

      if (String(query._id) !== String(recurring._id) || String(query.user) !== String(recurring.user)) {
        return null;
      }

      recurring.lastLoggedMonth = update.$set.lastLoggedMonth;
      return recurring;
    });
  SavingsStudioAuditLog.create = async (payload) => {
    auditLogs.push(payload);
    return payload;
  };

  try {
    await callback({ auditLogs, recurring, updates });
  } finally {
    SavingsEntry.create = originalEntryCreate;
    SavingsEntry.findOne = originalEntryFindOne;
    RecurringExpense.findOne = originalRecurringFindOne;
    RecurringExpense.findOneAndUpdate = originalRecurringFindOneAndUpdate;
    SavingsStudioAuditLog.create = originalAuditCreate;
  }
};

test("Savings Studio CSV preview rejects exact normalized duplicates without writing entries", async () => {
  let createCalled = false;

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: " coffee ", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      create: async () => {
        createCalled = true;
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

      assert.equal(createCalled, false);
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
  const createdPayloads = [];

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: " coffee ", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      create: async (entry) => {
        createdPayloads.push(entry);
        return { _id: `entry-${createdPayloads.length}`, ...entry };
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
      assert.equal(createdPayloads.length, 2);
      assert.deepEqual(
        createdPayloads.map((entry) => [entry.title, entry.category]),
        [
          ["Coffee", "Kita"],
          ["Groceries", "Maistas"],
        ]
      );
      assert.deepEqual(createdPayloads[0].importSource, {
        system: "csv-upload",
        entryId: "",
      });
      assert.equal(createdPayloads.every((entry) => /^[a-f0-9]{64}$/.test(entry.importFingerprint)), true);
    }
  );
});

test("Savings Studio CSV confirm with only invalid rows does not call create", async () => {
  let createCalled = false;

  await withSavingsEntryStubs(
    {
      create: async () => {
        createCalled = true;
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

      assert.equal(createCalled, false);
      assert.equal(res.body.importedCount, 0);
      assert.equal(res.body.rejectedCount, 1);
      assert.equal(res.body.invalidRows.length, 1);
      assert.equal(res.body.duplicateRows.length, 0);
    }
  );
});

test("Savings Studio CSV confirm with only duplicate rows does not call create", async () => {
  let createCalled = false;

  await withSavingsEntryStubs(
    {
      existingEntries: [{ title: "Coffee", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" }],
      create: async () => {
        createCalled = true;
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

      assert.equal(createCalled, false);
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

test("Savings Studio CSV import uses a deterministic user-scoped unique fingerprint", () => {
  const modelSource = fs.readFileSync(path.join(root, "server", "models", "SavingsEntry.js"), "utf8");
  const first = { title: "  Coffee  ", amount: 4.5, category: " MAISTAS ", date: "2026-08-10" };
  const second = { title: "coffee", amount: "4.50", category: "maistas", date: "2026-08-10" };
  const differentCategory = { title: "coffee", amount: "4.50", category: "Kita", date: "2026-08-10" };

  assert.equal(buildEntryImportFingerprint(first), buildEntryImportFingerprint(second));
  assert.notEqual(buildEntryImportFingerprint(first), buildEntryImportFingerprint(differentCategory));
  assert.match(modelSource, /importFingerprint/);
  assert.match(modelSource, /savingsEntrySchema\.index\(\s*\{\s*user: 1,\s*importFingerprint: 1\s*\}/);
  assert.match(modelSource, /unique: true/);
  assert.match(modelSource, /partialFilterExpression/);
});

test("Savings Studio CRUD controllers always scope object mutations by user", () => {
  const controllerSource = fs.readFileSync(path.join(root, "server", "controllers", "savingsStudioController.js"), "utf8");

  for (const functionName of [
    "updateSavingsEntry",
    "deleteSavingsEntry",
    "updateSavingsGoal",
    "deleteSavingsGoal",
    "updateRecurringExpense",
    "deleteRecurringExpense",
    "logRecurringExpenseAsEntry",
  ]) {
    const start = controllerSource.indexOf(`const ${functionName} = async`);
    assert.notEqual(start, -1, `Missing ${functionName}`);
    const end = controllerSource.indexOf("\n};", start);
    const block = controllerSource.slice(start, end);

    assert.match(block, /_id: req\.params\.(entryId|goalId|recurringId)/, `${functionName} must filter by object id`);
    assert.match(block, /user: req\.user\._id/, `${functionName} must filter by authenticated user`);
  }
});

test("Savings Studio profile and budget writes are scoped upserts, not client-owned writes", () => {
  const controllerSource = fs.readFileSync(path.join(root, "server", "controllers", "savingsStudioController.js"), "utf8");
  const profileBlock = controllerSource.slice(
    controllerSource.indexOf("const updateSavingsProfile = async"),
    controllerSource.indexOf("const updateSavingsEmailSettings = async")
  );
  const budgetBlock = controllerSource.slice(
    controllerSource.indexOf("const upsertSavingsBudgets = async"),
    controllerSource.indexOf("const getSavingsEntries = async")
  );

  assert.match(profileBlock, /findOneAndUpdate\(\s*\{\s*user: req\.user\._id\s*\}/);
  assert.doesNotMatch(profileBlock, /req\.body\.user|req\.query\.user/);
  assert.match(budgetBlock, /bulkWrite/);
  assert.match(budgetBlock, /filter: \{\s*user: req\.user\._id,\s*month,\s*category: budget\.category/);
  assert.match(budgetBlock, /deleteMany\(\{\s*user: req\.user\._id,\s*month,\s*category: \{ \$nin:/);
});

test("Savings Studio recurring-to-entry creates one entry and updates lastLoggedMonth after success", async () => {
  const createdEntries = [];
  const recurring = makeRecurringDocument();
  const res = makeResponse();

  await withRecurringLogStubs(
    {
      recurring,
      createEntry: async (entry) => {
        createdEntries.push(entry);
        return { _id: "entry-1", ...entry };
      },
    },
    async ({ auditLogs, updates }) => {
      await logRecurringExpenseAsEntry(
        {
          params: { recurringId: "recurring-1" },
          user: { _id: "user-1" },
          body: { month: "2026-08" },
        },
        res
      );

      assert.equal(res.statusCode, 201);
      assert.equal(createdEntries.length, 1);
      assert.equal(createdEntries[0].user, "user-1");
      assert.equal(createdEntries[0].importSource.system, "recurring-expense");
      assert.equal(createdEntries[0].importSource.entryId, "recurring-1");
      assert.equal(/^[a-f0-9]{64}$/.test(createdEntries[0].importFingerprint), true);
      assert.equal(recurring.lastLoggedMonth, "2026-08");
      assert.equal(updates.length, 1);
      assert.equal(updates[0].query.user, "user-1");
      assert.equal(auditLogs[0].metadata.createdEntry, true);
      assert.equal(res.body.recurringExpense.lastLoggedMonth, "2026-08");
    }
  );
});

test("Savings Studio recurring-to-entry duplicate request reuses existing entry without creating another one", async () => {
  const createdEntries = [];
  const recurring = makeRecurringDocument();
  let createAttempts = 0;
  let savedEntry = null;

  await withRecurringLogStubs(
    {
      recurring,
      recurringFindOne: async (query) => {
        if (String(query._id) !== "recurring-1" || String(query.user) !== "user-1") {
          return null;
        }

        return makeRecurringDocument({ lastLoggedMonth: "" });
      },
      createEntry: async (entry) => {
        createAttempts += 1;

        if (createAttempts > 1) {
          const error = new Error("duplicate key");
          error.code = 11000;
          throw error;
        }

        savedEntry = { _id: "entry-1", ...entry };
        createdEntries.push(savedEntry);
        return savedEntry;
      },
      entryFindOne: async (query) => {
        assert.equal(query.user, "user-1");
        assert.equal(query.importFingerprint, savedEntry.importFingerprint);
        return savedEntry;
      },
    },
    async () => {
      const firstResponse = makeResponse();
      const secondResponse = makeResponse();
      const request = {
        params: { recurringId: "recurring-1" },
        user: { _id: "user-1" },
        body: { month: "2026-08" },
      };

      await logRecurringExpenseAsEntry(request, firstResponse);
      await logRecurringExpenseAsEntry(request, secondResponse);

      assert.equal(firstResponse.statusCode, 201);
      assert.equal(secondResponse.statusCode, 200);
      assert.equal(createAttempts, 2);
      assert.equal(createdEntries.length, 1);
      assert.equal(secondResponse.body.entry._id, "entry-1");
      assert.equal(recurring.lastLoggedMonth, "2026-08");
    }
  );
});

test("Savings Studio recurring-to-entry entry create failure does not mark recurring as logged", async () => {
  const recurring = makeRecurringDocument();
  let updateCalled = false;

  await withRecurringLogStubs(
    {
      recurring,
      createEntry: async () => {
        throw new Error("entry create failed");
      },
      recurringFindOneAndUpdate: async () => {
        updateCalled = true;
        return recurring;
      },
    },
    async () => {
      await assert.rejects(
        () =>
          logRecurringExpenseAsEntry(
            {
              params: { recurringId: "recurring-1" },
              user: { _id: "user-1" },
              body: { month: "2026-08" },
            },
            makeResponse()
          ),
        /entry create failed/
      );

      assert.equal(updateCalled, false);
      assert.equal(recurring.lastLoggedMonth, "");
    }
  );
});

test("Savings Studio recurring-to-entry cannot access another user's recurring expense", async () => {
  let createCalled = false;
  let updateCalled = false;

  await withRecurringLogStubs(
    {
      recurring: makeRecurringDocument({ user: "other-user" }),
      createEntry: async () => {
        createCalled = true;
        return {};
      },
      recurringFindOneAndUpdate: async () => {
        updateCalled = true;
        return null;
      },
    },
    async () => {
      await assert.rejects(
        () =>
          logRecurringExpenseAsEntry(
            {
              params: { recurringId: "recurring-1" },
              user: { _id: "user-1" },
              body: { month: "2026-08" },
            },
            makeResponse()
          ),
        (error) => error.statusCode === 404
      );

      assert.equal(createCalled, false);
      assert.equal(updateCalled, false);
    }
  );
});

test("Savings Studio recurring-to-entry has no unreachable duplicate recurringExpense 409 guard", () => {
  const controllerSource = fs.readFileSync(path.join(root, "server", "controllers", "savingsStudioController.js"), "utf8");
  const block = controllerSource.slice(
    controllerSource.indexOf("const logRecurringExpenseAsEntry = async"),
    controllerSource.indexOf("const deleteRecurringExpense = async")
  );

  assert.equal((block.match(/if \(!recurringExpense\)/g) || []).length, 0);
  assert.equal((block.match(/jau/g) || []).length, 1);
  assert.ok(block.indexOf("SavingsEntry.create") < block.indexOf("RecurringExpense.findOneAndUpdate"));
});

test("Savings Studio CSV confirm handles duplicate key as duplicate result instead of 500", async () => {
  let createAttempts = 0;

  await withSavingsEntryStubs(
    {
      create: async (entry) => {
        createAttempts += 1;

        if (createAttempts === 2) {
          const error = new Error("duplicate key");
          error.code = 11000;
          throw error;
        }

        return { _id: `entry-${createAttempts}`, ...entry };
      },
    },
    async () => {
      const res = makeResponse();

      await importSavingsEntries(
        {
          user: { _id: "user-1" },
          body: {
            rows: [
              { title: "Coffee", amount: 4.5, category: "Maistas", date: "2026-08-10" },
              { title: "Groceries", amount: 30, category: "Maistas", date: "2026-08-11" },
            ],
          },
        },
        res
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.importedCount, 1);
      assert.equal(res.body.duplicateCount, 1);
      assert.equal(res.body.rejectedCount, 1);
      assert.equal(res.body.duplicateRows[0].rowNumber, 2);
    }
  );
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

test("Savings Studio rejects invalid calendar dates and months before DB writes", async () => {
  const user = { _id: "user-1" };
  const res = makeResponse();

  await assert.rejects(
    () =>
      createSavingsEntry(
        {
          user,
          body: { title: "Invalid date", amount: 10, category: "Maistas", date: "2026-02-31" },
        },
        res
      ),
    /dat/
  );
  await assert.rejects(
    () =>
      createSavingsGoal(
        {
          user,
          body: { title: "Invalid goal date", targetAmount: 100, currentAmount: 0, targetDate: "2026-04-31" },
        },
        res
      ),
    /dat/
  );
  await assert.rejects(
    () =>
      upsertSavingsBudgets(
        {
          user,
          body: { month: "2026-13", budgets: [{ category: "Maistas", limitAmount: 100 }] },
        },
        res
      ),
    /m/
  );
});
