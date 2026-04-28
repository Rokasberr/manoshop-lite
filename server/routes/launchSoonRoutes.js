const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const { notifyLaunchSoonInterest } = require("../controllers/launchSoonController");

const router = express.Router();

router.post(
  "/notify",
  createWindowRateLimiter({
    keyPrefix: "launch-soon-notify",
    max: 6,
    windowMs: 10 * 60 * 1000,
    message: "Per daug launch soon registracijų per trumpą laiką. Pabandyk dar kartą vėliau.",
  }),
  asyncHandler(notifyLaunchSoonInterest)
);

module.exports = router;
