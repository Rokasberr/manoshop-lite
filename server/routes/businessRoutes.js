const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, requireBusinessPlan } = require("../middleware/authMiddleware");
const {
  getBusinessDashboard,
  getMyStore,
  getMyStoreOrders,
  getResaleProducts,
  upsertMyStore,
} = require("../controllers/businessController");

const router = express.Router();

router.use(protect, requireBusinessPlan);

router.get("/dashboard", asyncHandler(getBusinessDashboard));
router.get("/products", asyncHandler(getResaleProducts));
router.get("/store", asyncHandler(getMyStore));
router.put("/store", asyncHandler(upsertMyStore));
router.get("/orders", asyncHandler(getMyStoreOrders));

module.exports = router;
