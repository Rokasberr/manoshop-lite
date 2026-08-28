const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const { validateObjectId } = require("../middleware/requestValidation");
const {
  acceptPublicWebServiceProposal,
  confirmPublicWebServiceDeposit,
  createPublicWebServiceDepositSession,
  createWebServiceRequest,
  getAdminWebServiceRequests,
  getPublicWebServiceProposal,
  sendAdminWebServiceProposal,
  syncAdminWebServiceDeposit,
  updateAdminWebServiceRequest,
} = require("../controllers/webServiceRequestController");

const router = express.Router();

const publicRequestLimiter = createWindowRateLimiter({
  keyPrefix: "web-service-request",
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Per daug užklausų per trumpą laiką. Pabandykite vėliau.",
});

const publicProposalLimiter = createWindowRateLimiter({
  keyPrefix: "web-service-proposal",
  max: 30,
  windowMs: 15 * 60 * 1000,
  message: "Per daug pasiūlymo užklausų. Pabandykite vėliau.",
});

const publicProposalActionLimiter = createWindowRateLimiter({
  keyPrefix: "web-service-proposal-action",
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: "Per daug veiksmų per trumpą laiką. Pabandykite vėliau.",
});

router.post("/", publicRequestLimiter, asyncHandler(createWebServiceRequest));
router.get("/proposal/:token", publicProposalLimiter, asyncHandler(getPublicWebServiceProposal));
router.post(
  "/proposal/:token/accept",
  publicProposalActionLimiter,
  asyncHandler(acceptPublicWebServiceProposal)
);
router.post(
  "/proposal/:token/deposit",
  publicProposalActionLimiter,
  asyncHandler(createPublicWebServiceDepositSession)
);
router.post(
  "/proposal/:token/deposit/confirm",
  publicProposalActionLimiter,
  asyncHandler(confirmPublicWebServiceDeposit)
);

router.get("/", protect, adminOnly, asyncHandler(getAdminWebServiceRequests));
router.post(
  "/:id/proposal/send",
  protect,
  adminOnly,
  validateObjectId("id"),
  asyncHandler(sendAdminWebServiceProposal)
);
router.post(
  "/:id/proposal/deposit/sync",
  protect,
  adminOnly,
  validateObjectId("id"),
  asyncHandler(syncAdminWebServiceDeposit)
);
router.patch(
  "/:id",
  protect,
  adminOnly,
  validateObjectId("id"),
  asyncHandler(updateAdminWebServiceRequest)
);

module.exports = router;
