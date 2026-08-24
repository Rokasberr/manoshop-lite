const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, requireVerifiedEmail } = require("../middleware/authMiddleware");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const { validateBillingSessionPayload } = require("../middleware/requestValidation");
const {
  activateDemoPlan,
  createCustomerPortalSession,
  createPaymentSession,
  getBillingProfile,
  listSubscriptionInvoices,
  syncStripeMembership,
} = require("../controllers/billingController");

const router = express.Router();
const billingPortalLimiter = createWindowRateLimiter({
  keyPrefix: "billing-portal",
  max: 5,
  windowMs: 60_000,
  message: "Per daug prenumeratos savitarnos užklausų. Bandyk dar kartą po minutės.",
});
const billingSyncLimiter = createWindowRateLimiter({
  keyPrefix: "billing-sync",
  max: 10,
  windowMs: 60_000,
  message: "Per daug narystės sinchronizavimo užklausų. Bandyk dar kartą po minutės.",
});
const billingInvoicesLimiter = createWindowRateLimiter({
  keyPrefix: "billing-invoices",
  max: 20,
  windowMs: 60_000,
  message: "Per daug prenumeratos sąskaitų užklausų. Bandyk dar kartą po minutės.",
});

router.post(
  "/create-payment-session",
  protect,
  requireVerifiedEmail,
  validateBillingSessionPayload,
  asyncHandler(createPaymentSession)
);
router.post("/create-portal-session", protect, requireVerifiedEmail, billingPortalLimiter, asyncHandler(createCustomerPortalSession));
router.post("/activate-demo-plan", protect, asyncHandler(activateDemoPlan));
router.post("/sync-stripe-membership", protect, requireVerifiedEmail, billingSyncLimiter, asyncHandler(syncStripeMembership));
router.get("/subscription-invoices", protect, requireVerifiedEmail, billingInvoicesLimiter, asyncHandler(listSubscriptionInvoices));
router.get("/me", protect, asyncHandler(getBillingProfile));

module.exports = router;
