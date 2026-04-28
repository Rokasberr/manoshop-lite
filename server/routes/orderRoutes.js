const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createOrder,
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
  cancelStripeCheckout,
  adminCancelOrderPayment,
  refundStripeOrderPayment,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  getOrderInvoicePdf,
  getOrderDigitalAsset,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", protect, asyncHandler(createOrder));
router.post("/stripe/checkout-session", protect, asyncHandler(createStripeCheckoutSession));
router.get("/stripe/session/:sessionId", protect, asyncHandler(getStripeCheckoutSessionStatus));
router.post("/:id/cancel-checkout", protect, asyncHandler(cancelStripeCheckout));
router.post("/:id/admin-cancel-payment", protect, adminOnly, asyncHandler(adminCancelOrderPayment));
router.post("/:id/refund", protect, adminOnly, asyncHandler(refundStripeOrderPayment));
router.get("/user", protect, asyncHandler(getUserOrders));
router.get("/admin", protect, adminOnly, asyncHandler(getAdminOrders));
router.get("/:id/items/:productId/download", protect, asyncHandler(getOrderDigitalAsset));
router.get("/:id/invoice", protect, asyncHandler(getOrderInvoicePdf));
router.put("/:id/status", protect, adminOnly, asyncHandler(updateOrderStatus));

module.exports = router;
