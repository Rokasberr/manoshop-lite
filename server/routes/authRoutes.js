const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, requireVerifiedEmail } = require("../middleware/authMiddleware");
const {
  validateChangePasswordInput,
  validateDeleteAccountInput,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
  validateVerifyEmailInput,
} = require("../middleware/authValidation");
const { createWindowRateLimiter } = require("../middleware/rateLimit");
const {
  changeUserPassword,
  deleteCurrentUser,
  exportCurrentUserData,
  forgotPassword,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  resendUserEmailVerification,
  resetUserPassword,
  verifyUserEmail,
} = require("../controllers/authController");
const { getAdminAuthDebug } = require("../controllers/debugController");

const router = express.Router();

const registerLimiter = createWindowRateLimiter({
  keyPrefix: "auth:register",
  max: 10,
  windowMs: 15 * 60_000,
  message: "Per daug registracijos bandymu. Pabandyk veliau.",
});

const loginLimiter = createWindowRateLimiter({
  keyPrefix: "auth:login",
  max: 20,
  windowMs: 15 * 60_000,
  message: "Per daug prisijungimo bandymu. Pabandyk veliau.",
});

const passwordRecoveryLimiter = createWindowRateLimiter({
  keyPrefix: "auth:password-recovery",
  max: 5,
  windowMs: 15 * 60_000,
  message: "Per daug slaptazodzio atkurimo bandymu. Pabandyk veliau.",
});

const passwordResetLimiter = createWindowRateLimiter({
  keyPrefix: "auth:password-reset",
  max: 10,
  windowMs: 15 * 60_000,
  message: "Per daug slaptazodzio keitimo bandymu. Pabandyk veliau.",
});

const changePasswordLimiter = createWindowRateLimiter({
  keyPrefix: "auth:change-password",
  max: 8,
  windowMs: 15 * 60_000,
  message: "Per daug slaptazodzio keitimo bandymu. Pabandyk veliau.",
});

const verifyEmailLimiter = createWindowRateLimiter({
  keyPrefix: "auth:verify-email",
  max: 20,
  windowMs: 15 * 60_000,
  message: "Per daug el. pasto patvirtinimo bandymu. Pabandyk veliau.",
});

const resendVerificationLimiter = createWindowRateLimiter({
  keyPrefix: "auth:resend-verification",
  max: 3,
  windowMs: 15 * 60_000,
  message: "Per daug patvirtinimo laisku uzklausu. Pabandyk veliau.",
});

const exportDataLimiter = createWindowRateLimiter({
  keyPrefix: "auth:data-export",
  max: 3,
  windowMs: 60 * 60_000,
  message: "Per daug duomenu eksporto uzklausu. Pabandyk veliau.",
});

const deleteAccountLimiter = createWindowRateLimiter({
  keyPrefix: "auth:delete-account",
  max: 3,
  windowMs: 60 * 60_000,
  message: "Per daug paskyros istrynimo bandymu. Pabandyk veliau.",
});

router.post("/register", registerLimiter, validateRegisterInput, asyncHandler(registerUser));
router.post("/login", loginLimiter, validateLoginInput, asyncHandler(loginUser));
router.post("/forgot-password", passwordRecoveryLimiter, validateForgotPasswordInput, asyncHandler(forgotPassword));
router.post("/reset-password", passwordResetLimiter, validateResetPasswordInput, asyncHandler(resetUserPassword));
router.post("/verify-email", verifyEmailLimiter, validateVerifyEmailInput, asyncHandler(verifyUserEmail));
router.post("/resend-verification", protect, resendVerificationLimiter, asyncHandler(resendUserEmailVerification));
router.post("/logout", protect, asyncHandler(logoutUser));
router.post(
  "/change-password",
  protect,
  changePasswordLimiter,
  validateChangePasswordInput,
  asyncHandler(changeUserPassword)
);
router.get("/export-data", protect, requireVerifiedEmail, exportDataLimiter, asyncHandler(exportCurrentUserData));
router.delete(
  "/account",
  protect,
  deleteAccountLimiter,
  validateDeleteAccountInput,
  asyncHandler(deleteCurrentUser)
);
router.get("/profile", protect, asyncHandler(getCurrentUser));
router.get("/me", protect, asyncHandler(getCurrentUser));
router.get("/debug/admin-auth", protect, asyncHandler(getAdminAuthDebug));

module.exports = router;
