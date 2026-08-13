const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
  createStoreCheckoutSession,
  getPublicStore,
} = require("../controllers/businessController");

const router = express.Router();
const storeCheckoutLimiter = createWindowRateLimiter({
  keyPrefix: "store-checkout",
  max: 10,
  windowMs: 5 * 60 * 1000,
  message: "Per daug checkout bandymu per trumpa laika.",
});

router.get("/:slug", asyncHandler(getPublicStore));
router.post("/:slug/checkout", storeCheckoutLimiter, asyncHandler(createStoreCheckoutSession));

module.exports = router;
