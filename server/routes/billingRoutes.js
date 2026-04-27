const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const {
  createPaymentSession,
  getBillingProfile,
} = require("../controllers/billingController");

const router = express.Router();

router.post("/create-payment-session", protect, asyncHandler(createPaymentSession));
router.get("/me", protect, asyncHandler(getBillingProfile));

module.exports = router;

