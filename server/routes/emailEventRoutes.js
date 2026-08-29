const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const { handleEmailEventWebhook } = require("../controllers/emailEventWebhookController");

const router = express.Router();
router.post("/webhook", createWindowRateLimiter({ keyPrefix: "email-event-webhook", max: 120, windowMs: 60 * 1000, message: "Per daug webhook užklausų." }), asyncHandler(handleEmailEventWebhook));
module.exports = router;
