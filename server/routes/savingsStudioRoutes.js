const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, requireSavingsStudioPro } = require("../middleware/authMiddleware");
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

router.use(protect, requireSavingsStudioPro);

router.get("/meta", asyncHandler(getSavingsMeta));
router.get("/profile", asyncHandler(getSavingsProfile));
router.put("/profile", mutationLimiter, asyncHandler(updateSavingsProfile));
router.put("/email-settings", mutationLimiter, asyncHandler(updateSavingsEmailSettings));
router.get("/budgets", asyncHandler(getSavingsBudgets));
router.put("/budgets", mutationLimiter, asyncHandler(upsertSavingsBudgets));
router.get("/entries", asyncHandler(getSavingsEntries));
router.post("/entries", mutationLimiter, asyncHandler(createSavingsEntry));
router.post("/entries/import-preview", importLimiter, asyncHandler(previewSavingsEntriesImport));
router.post("/entries/import", importLimiter, asyncHandler(importSavingsEntries));
router.put("/entries/:entryId", mutationLimiter, asyncHandler(updateSavingsEntry));
router.delete("/entries/:entryId", mutationLimiter, asyncHandler(deleteSavingsEntry));
router.get("/goals", asyncHandler(getSavingsGoals));
router.post("/goals", mutationLimiter, asyncHandler(createSavingsGoal));
router.put("/goals/:goalId", mutationLimiter, asyncHandler(updateSavingsGoal));
router.delete("/goals/:goalId", mutationLimiter, asyncHandler(deleteSavingsGoal));
router.get("/recurring", asyncHandler(getRecurringExpenses));
router.post("/recurring", mutationLimiter, asyncHandler(createRecurringExpense));
router.post("/recurring/:recurringId/log", mutationLimiter, asyncHandler(logRecurringExpenseAsEntry));
router.put("/recurring/:recurringId", mutationLimiter, asyncHandler(updateRecurringExpense));
router.delete("/recurring/:recurringId", mutationLimiter, asyncHandler(deleteRecurringExpense));
router.get("/summary", asyncHandler(getSavingsSummary));
router.get("/activity", asyncHandler(getSavingsActivity));
router.get("/summary-export", asyncHandler(downloadSavingsSummaryDocument));
router.get("/backup", backupLimiter, asyncHandler(exportSavingsBackup));
router.post("/summary-email", emailLimiter, asyncHandler(sendSavingsSummaryEmailNow));

module.exports = router;
