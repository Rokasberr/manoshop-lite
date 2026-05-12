const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const { validateLoginInput, validateRegisterInput } = require("../middleware/authValidation");
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/authController");
const { getAdminAuthDebug } = require("../controllers/debugController");

const router = express.Router();

router.post("/register", validateRegisterInput, asyncHandler(registerUser));
router.post("/login", validateLoginInput, asyncHandler(loginUser));
router.post("/logout", protect, asyncHandler(logoutUser));
router.get("/profile", protect, asyncHandler(getCurrentUser));
router.get("/me", protect, asyncHandler(getCurrentUser));
router.get("/debug/admin-auth", protect, asyncHandler(getAdminAuthDebug));

module.exports = router;
