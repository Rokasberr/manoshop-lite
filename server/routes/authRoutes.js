const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.get("/profile", protect, asyncHandler(getCurrentUser));

module.exports = router;

