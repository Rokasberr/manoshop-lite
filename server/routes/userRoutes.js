const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getAdminUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/admin/list", protect, adminOnly, asyncHandler(getAdminUsers));

module.exports = router;
