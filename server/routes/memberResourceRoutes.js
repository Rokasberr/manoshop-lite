const express = require("express");

const { downloadMemberResource } = require("../controllers/memberResourceController");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:resourceId/download/:format", protect, asyncHandler(downloadMemberResource));

module.exports = router;
