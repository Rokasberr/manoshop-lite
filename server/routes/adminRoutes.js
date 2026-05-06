const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  cancelSubscription,
  getAdminOrders,
  getAdminPayments,
  getAdminSubscriptions,
  refundPayment,
} = require("../controllers/adminPaymentController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/orders", asyncHandler(getAdminOrders));
router.get("/payments", asyncHandler(getAdminPayments));
router.get("/subscriptions", asyncHandler(getAdminSubscriptions));
router.post("/payments/:id/refund", asyncHandler(refundPayment));
router.post("/subscriptions/:id/cancel", asyncHandler(cancelSubscription));

module.exports = router;
