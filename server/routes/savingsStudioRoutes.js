const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, memberOnly } = require("../middleware/authMiddleware");
const {
  getSavingsMeta,
  getSavingsBudgets,
  getSavingsEntries,
  createSavingsEntry,
  updateSavingsEntry,
  deleteSavingsEntry,
  getSavingsSummary,
  upsertSavingsBudgets,
} = require("../controllers/savingsStudioController");

const router = express.Router();

router.get("/meta", protect, memberOnly, asyncHandler(getSavingsMeta));
router.get("/budgets", protect, memberOnly, asyncHandler(getSavingsBudgets));
router.put("/budgets", protect, memberOnly, asyncHandler(upsertSavingsBudgets));
router.get("/entries", protect, memberOnly, asyncHandler(getSavingsEntries));
router.post("/entries", protect, memberOnly, asyncHandler(createSavingsEntry));
router.put("/entries/:entryId", protect, memberOnly, asyncHandler(updateSavingsEntry));
router.delete("/entries/:entryId", protect, memberOnly, asyncHandler(deleteSavingsEntry));
router.get("/summary", protect, memberOnly, asyncHandler(getSavingsSummary));

module.exports = router;
