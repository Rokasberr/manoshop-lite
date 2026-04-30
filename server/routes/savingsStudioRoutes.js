const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, memberOnly } = require("../middleware/authMiddleware");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
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
  getSavingsActivity,
  exportSavingsBackup,
  downloadSavingsSummaryDocument,
  sendSavingsSummaryEmailNow,
  upsertSavingsBudgets,
} = require("../controllers/savingsStudioController");

const router = express.Router();
const mutationLimiter = createWindowRateLimiter({
  keyPrefix: "savings-mutation",
  max: 30,
  windowMs: 60 * 1000,
      message: "Per daug Stilloak pakeitimų per trumpą laiką.",
});
const importLimiter = createWindowRateLimiter({
  keyPrefix: "savings-import",
  max: 4,
  windowMs: 15 * 60 * 1000,
  message: "CSV importų per daug. Pabandyk po keliolikos minučių.",
});
const emailLimiter = createWindowRateLimiter({
  keyPrefix: "savings-email",
  max: 4,
  windowMs: 60 * 60 * 1000,
  message: "Suvestinių laiškų limitas laikinai pasiektas.",
});
const backupLimiter = createWindowRateLimiter({
  keyPrefix: "savings-backup",
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: "Backup eksportų limitas laikinai pasiektas.",
});

router.get("/meta", protect, memberOnly, asyncHandler(getSavingsMeta));
router.get("/profile", protect, memberOnly, asyncHandler(getSavingsProfile));
router.put("/profile", protect, memberOnly, mutationLimiter, asyncHandler(updateSavingsProfile));
router.put("/email-settings", protect, memberOnly, mutationLimiter, asyncHandler(updateSavingsEmailSettings));
router.get("/budgets", protect, memberOnly, asyncHandler(getSavingsBudgets));
router.put("/budgets", protect, memberOnly, mutationLimiter, asyncHandler(upsertSavingsBudgets));
router.get("/entries", protect, memberOnly, asyncHandler(getSavingsEntries));
router.post("/entries", protect, memberOnly, mutationLimiter, asyncHandler(createSavingsEntry));
router.post("/entries/import-preview", protect, memberOnly, importLimiter, asyncHandler(previewSavingsEntriesImport));
router.post("/entries/import", protect, memberOnly, importLimiter, asyncHandler(importSavingsEntries));
router.put("/entries/:entryId", protect, memberOnly, mutationLimiter, asyncHandler(updateSavingsEntry));
router.delete("/entries/:entryId", protect, memberOnly, mutationLimiter, asyncHandler(deleteSavingsEntry));
router.get("/goals", protect, memberOnly, asyncHandler(getSavingsGoals));
router.post("/goals", protect, memberOnly, mutationLimiter, asyncHandler(createSavingsGoal));
router.put("/goals/:goalId", protect, memberOnly, mutationLimiter, asyncHandler(updateSavingsGoal));
router.delete("/goals/:goalId", protect, memberOnly, mutationLimiter, asyncHandler(deleteSavingsGoal));
router.get("/recurring", protect, memberOnly, asyncHandler(getRecurringExpenses));
router.post("/recurring", protect, memberOnly, mutationLimiter, asyncHandler(createRecurringExpense));
router.post("/recurring/:recurringId/log", protect, memberOnly, mutationLimiter, asyncHandler(logRecurringExpenseAsEntry));
router.put("/recurring/:recurringId", protect, memberOnly, mutationLimiter, asyncHandler(updateRecurringExpense));
router.delete("/recurring/:recurringId", protect, memberOnly, mutationLimiter, asyncHandler(deleteRecurringExpense));
router.get("/summary", protect, memberOnly, asyncHandler(getSavingsSummary));
router.get("/activity", protect, memberOnly, asyncHandler(getSavingsActivity));
router.get("/summary-export", protect, memberOnly, asyncHandler(downloadSavingsSummaryDocument));
router.get("/backup", protect, memberOnly, backupLimiter, asyncHandler(exportSavingsBackup));
router.post("/summary-email", protect, memberOnly, emailLimiter, asyncHandler(sendSavingsSummaryEmailNow));

module.exports = router;
