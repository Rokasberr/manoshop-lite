const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateObjectId, validateOrderPayload } = require("../middleware/requestValidation");
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

router.post("/", protect, validateOrderPayload, asyncHandler(createOrder));
router.post("/stripe/checkout-session", protect, validateOrderPayload, asyncHandler(createStripeCheckoutSession));
router.get("/stripe/session/:sessionId", protect, asyncHandler(getStripeCheckoutSessionStatus));
router.post("/:id/cancel-checkout", protect, validateObjectId("id"), asyncHandler(cancelStripeCheckout));
router.post("/:id/admin-cancel-payment", protect, adminOnly, validateObjectId("id"), asyncHandler(adminCancelOrderPayment));
router.post("/:id/refund", protect, adminOnly, validateObjectId("id"), asyncHandler(refundStripeOrderPayment));
router.get("/user", protect, asyncHandler(getUserOrders));
router.get("/admin", protect, adminOnly, asyncHandler(getAdminOrders));
router.get("/:id/items/:productId/download", protect, validateObjectId("id"), validateObjectId("productId"), asyncHandler(getOrderDigitalAsset));
router.get("/:id/invoice", protect, validateObjectId("id"), asyncHandler(getOrderInvoicePdf));
router.put("/:id/status", protect, adminOnly, validateObjectId("id"), asyncHandler(updateOrderStatus));

module.exports = router;
