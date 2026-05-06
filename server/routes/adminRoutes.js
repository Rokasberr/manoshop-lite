const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/requestValidation");
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
router.post("/payments/:id/refund", validateObjectId("id"), asyncHandler(refundPayment));
router.post("/subscriptions/:id/cancel", validateObjectId("id"), asyncHandler(cancelSubscription));

module.exports = router;
