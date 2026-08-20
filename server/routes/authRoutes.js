const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const {
  validateChangePasswordInput,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
} = require("../middleware/authValidation");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
  changeUserPassword,
  forgotPassword,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  resetUserPassword,
} = require("../controllers/authController");
const { getAdminAuthDebug } = require("../controllers/debugController");

const router = express.Router();

const registerLimiter = createWindowRateLimiter({
  keyPrefix: "auth:register",
  max: 10,
  windowMs: 15 * 60_000,
  message: "Per daug registracijos bandymų. Pabandyk vėliau.",
});

const loginLimiter = createWindowRateLimiter({
  keyPrefix: "auth:login",
  max: 20,
  windowMs: 15 * 60_000,
  message: "Per daug prisijungimo bandymų. Pabandyk vėliau.",
});

const passwordRecoveryLimiter = createWindowRateLimiter({
  keyPrefix: "auth:password-recovery",
  max: 5,
  windowMs: 15 * 60_000,
  message: "Per daug slaptažodžio atkūrimo bandymų. Pabandyk vėliau.",
});

const passwordResetLimiter = createWindowRateLimiter({
  keyPrefix: "auth:password-reset",
  max: 10,
  windowMs: 15 * 60_000,
  message: "Per daug slaptažodžio keitimo bandymų. Pabandyk vėliau.",
});

const changePasswordLimiter = createWindowRateLimiter({
  keyPrefix: "auth:change-password",
  max: 8,
  windowMs: 15 * 60_000,
  message: "Per daug slaptažodžio keitimo bandymų. Pabandyk vėliau.",
});

router.post("/register", registerLimiter, validateRegisterInput, asyncHandler(registerUser));
router.post("/login", loginLimiter, validateLoginInput, asyncHandler(loginUser));
router.post("/forgot-password", passwordRecoveryLimiter, validateForgotPasswordInput, asyncHandler(forgotPassword));
router.post("/reset-password", passwordResetLimiter, validateResetPasswordInput, asyncHandler(resetUserPassword));
router.post("/logout", protect, asyncHandler(logoutUser));
router.post(
  "/change-password",
  protect,
  changePasswordLimiter,
  validateChangePasswordInput,
  asyncHandler(changeUserPassword)
);
router.get("/profile", protect, asyncHandler(getCurrentUser));
router.get("/me", protect, asyncHandler(getCurrentUser));
router.get("/debug/admin-auth", protect, asyncHandler(getAdminAuthDebug));

module.exports = router;
