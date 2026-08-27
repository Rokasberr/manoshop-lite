const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const { validateObjectId } = require("../middleware/requestValidation");
const {
  createWebServiceRequest,
  getAdminWebServiceRequests,
  updateAdminWebServiceRequest,
} = require("../controllers/webServiceRequestController");

const router = express.Router();

const publicRequestLimiter = createWindowRateLimiter({
  keyPrefix: "web-service-request",
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Per daug užklausų per trumpą laiką. Pabandykite vėliau.",
});

router.post("/", publicRequestLimiter, asyncHandler(createWebServiceRequest));
router.get("/", protect, adminOnly, asyncHandler(getAdminWebServiceRequests));
router.patch(
  "/:id",
  protect,
  adminOnly,
  validateObjectId("id"),
  asyncHandler(updateAdminWebServiceRequest)
);

module.exports = router;
