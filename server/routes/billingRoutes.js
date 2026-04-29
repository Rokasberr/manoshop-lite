const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const {
  createPaymentSession,
  getBillingProfile,
  syncStripeMembership,
} = require("../controllers/billingController");

const router = express.Router();

router.post("/create-payment-session", protect, asyncHandler(createPaymentSession));
router.post("/sync-stripe-membership", protect, asyncHandler(syncStripeMembership));
router.get("/me", protect, asyncHandler(getBillingProfile));

module.exports = router;
