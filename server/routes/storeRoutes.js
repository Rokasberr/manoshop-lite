const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const {
  createStoreCheckoutSession,
  getPublicStore,
} = require("../controllers/businessController");

const router = express.Router();

router.get("/:slug", asyncHandler(getPublicStore));
router.post("/:slug/checkout", asyncHandler(createStoreCheckoutSession));

module.exports = router;
