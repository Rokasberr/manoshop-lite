const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, memberOnly } = require("../middleware/authMiddleware");
const {
  getSavingsMeta,
  getSavingsProfile,
  updateSavingsProfile,
  updateSavingsEmailSettings,
  getSavingsBudgets,
  getSavingsEntries,
  createSavingsEntry,
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
  sendSavingsSummaryEmailNow,
  upsertSavingsBudgets,
} = require("../controllers/savingsStudioController");

const router = express.Router();

router.get("/meta", protect, memberOnly, asyncHandler(getSavingsMeta));
router.get("/profile", protect, memberOnly, asyncHandler(getSavingsProfile));
router.put("/profile", protect, memberOnly, asyncHandler(updateSavingsProfile));
router.put("/email-settings", protect, memberOnly, asyncHandler(updateSavingsEmailSettings));
router.get("/budgets", protect, memberOnly, asyncHandler(getSavingsBudgets));
router.put("/budgets", protect, memberOnly, asyncHandler(upsertSavingsBudgets));
router.get("/entries", protect, memberOnly, asyncHandler(getSavingsEntries));
router.post("/entries", protect, memberOnly, asyncHandler(createSavingsEntry));
router.post("/entries/import", protect, memberOnly, asyncHandler(importSavingsEntries));
router.put("/entries/:entryId", protect, memberOnly, asyncHandler(updateSavingsEntry));
router.delete("/entries/:entryId", protect, memberOnly, asyncHandler(deleteSavingsEntry));
router.get("/goals", protect, memberOnly, asyncHandler(getSavingsGoals));
router.post("/goals", protect, memberOnly, asyncHandler(createSavingsGoal));
router.put("/goals/:goalId", protect, memberOnly, asyncHandler(updateSavingsGoal));
router.delete("/goals/:goalId", protect, memberOnly, asyncHandler(deleteSavingsGoal));
router.get("/recurring", protect, memberOnly, asyncHandler(getRecurringExpenses));
router.post("/recurring", protect, memberOnly, asyncHandler(createRecurringExpense));
router.post("/recurring/:recurringId/log", protect, memberOnly, asyncHandler(logRecurringExpenseAsEntry));
router.put("/recurring/:recurringId", protect, memberOnly, asyncHandler(updateRecurringExpense));
router.delete("/recurring/:recurringId", protect, memberOnly, asyncHandler(deleteRecurringExpense));
router.get("/summary", protect, memberOnly, asyncHandler(getSavingsSummary));
router.post("/summary-email", protect, memberOnly, asyncHandler(sendSavingsSummaryEmailNow));

module.exports = router;
