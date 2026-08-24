const express = require("express");

const {
  createDigitalProductCheckout,
  downloadDigitalProductFile,
  getDigitalProductPurchases,
} = require("../controllers/digitalProductController");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, requireVerifiedEmail } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/purchases", protect, asyncHandler(getDigitalProductPurchases));
router.post("/checkout", protect, requireVerifiedEmail, asyncHandler(createDigitalProductCheckout));
router.get("/:productId/download/:format", protect, asyncHandler(downloadDigitalProductFile));

module.exports = router;
