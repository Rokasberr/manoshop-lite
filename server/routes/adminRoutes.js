const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/requestValidation");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
  getAdminBusinessAnalytics,
} = require("../controllers/businessController");
const {
  cancelSubscription,
  getAdminOrders,
  getAdminPayments,
  getAdminSubscriptions,
  refundPayment,
} = require("../controllers/adminPaymentController");
const {
  downloadAdminDigitalProductFile,
  listAdminDigitalProducts,
  previewAdminDigitalProductPdf,
} = require("../controllers/adminDigitalProductController");
const {
  downloadAdminInstagramPost,
  generateAdminInstagramPost,
  getRecentAdminInstagramPosts,
} = require("../controllers/instagramPostController");
const { getAdminOperations, resolveAdminOperationalEvent, runAdminDatabaseBackup } = require("../controllers/adminOperationsController");
const { sendAdminTestEmail } = require("../controllers/adminEmailController");

const router = express.Router();
const instagramGenerationRateLimiter = createWindowRateLimiter({
  keyPrefix: "admin-instagram-generator",
  max: 8,
  windowMs: 60 * 1000,
  message: "Per daug Instagram generatoriaus užklausų. Bandyk dar kartą po minutės.",
});

router.use(protect, adminOnly);

router.get("/orders", asyncHandler(getAdminOrders));
router.get("/business/orders", asyncHandler(getAdminBusinessAnalytics));
router.get("/payments", asyncHandler(getAdminPayments));
router.get("/subscriptions", asyncHandler(getAdminSubscriptions));
router.post("/payments/:id/refund", validateObjectId("id"), asyncHandler(refundPayment));
router.post("/subscriptions/:id/cancel", validateObjectId("id"), asyncHandler(cancelSubscription));
router.get("/digital-products", asyncHandler(listAdminDigitalProducts));
router.get("/digital-products/:productId/preview/pdf", asyncHandler(previewAdminDigitalProductPdf));
router.get("/digital-products/:productId/download/:format", asyncHandler(downloadAdminDigitalProductFile));
router.post(
  "/instagram-posts/generate",
  instagramGenerationRateLimiter,
  asyncHandler(generateAdminInstagramPost)
);
router.get("/instagram-posts/recent", asyncHandler(getRecentAdminInstagramPosts));
router.get("/instagram-posts/download/:filename", asyncHandler(downloadAdminInstagramPost));
router.get("/operations", asyncHandler(getAdminOperations));
router.post("/email-test", asyncHandler(sendAdminTestEmail));
router.post("/operations/backup", asyncHandler(runAdminDatabaseBackup));
router.patch("/operations/:id/resolve", validateObjectId("id"), asyncHandler(resolveAdminOperationalEvent));

module.exports = router;
