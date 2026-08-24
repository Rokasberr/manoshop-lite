const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { buildUserDataExport, deleteCurrentUserAccount } = require("../services/accountLifecycleService");
const {
  getEmailVerificationDto,
  sendVerificationForUser,
  verifyEmailToken,
} = require("../services/emailVerificationService");
const { requestPasswordReset, resetPassword } = require("../services/passwordRecoveryService");
const { serializeSubscription } = require("../services/stripeMembershipService");
const { createHttpError } = require("../utils/httpError");
const { normalizeUserRole } = require("../utils/userRole");

const DUPLICATE_EMAIL_MESSAGE = "Toks vartotojas jau egzistuoja.";
const LOGIN_FAILED_MESSAGE = "Neteisingi prisijungimo duomenys.";

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: normalizeUserRole(user),
      authVersion: Number(user.authVersion || 0),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

const formatAuthResponse = (user) => ({
  token: signToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeUserRole(user),
    subscription: serializeSubscription(user.subscription),
    ...getEmailVerificationDto(user),
  },
});

const formatProfileResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeUserRole(user),
  createdAt: user.createdAt,
  subscription: serializeSubscription(user.subscription),
  ...getEmailVerificationDto(user),
});

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email, isDeleted: { $ne: true } });

  if (existingUser) {
    throw createHttpError(DUPLICATE_EMAIL_MESSAGE, 409);
  }

  let user;

  try {
    user = await User.create({
      name,
      email,
      password,
      role: "customer",
      emailVerificationRequired: true,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw createHttpError(DUPLICATE_EMAIL_MESSAGE, 409);
    }

    throw error;
  }

  const verification = await sendVerificationForUser({ user });

  res.status(201).json({
    ...formatAuthResponse(user),
    message: verification.sent
      ? "Paskyra sukurta. Į el. paštą išsiuntėme patvirtinimo nuorodą."
      : "Paskyra sukurta. Patvirtinimo laiško išsiųsti nepavyko, todėl gali jį išsiųsti dar kartą profilyje.",
    emailVerificationEmailSent: Boolean(verification.sent),
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.isDeleted || !(await user.comparePassword(password))) {
    throw createHttpError(LOGIN_FAILED_MESSAGE, 401);
  }

  res.json(formatAuthResponse(user));
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user || user.isDeleted) {
    throw createHttpError("Vartotojas nerastas.", 404);
  }

  res.json(formatProfileResponse(user));
};

const logoutUser = async (req, res) => {
  await User.updateOne(
    { _id: req.user._id, isDeleted: { $ne: true } },
    {
      $inc: {
        authVersion: 1,
      },
    }
  );

  res.json({ message: "Atsijungta is visu aktyviu sesiju." });
};

const forgotPassword = async (req, res) => {
  const result = await requestPasswordReset({ email: req.body.email });
  res.json({ message: result.message });
};

const resetUserPassword = async (req, res) => {
  const result = await resetPassword({
    token: req.body.token,
    password: req.body.password,
  });

  res.json({ message: result.message });
};

const changeUserPassword = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+password +passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (!user || user.isDeleted) {
    throw createHttpError("Vartotojas nerastas.", 401);
  }

  const passwordMatches = await user.comparePassword(req.body.currentPassword);

  if (!passwordMatches) {
    throw createHttpError("Dabartinis slaptažodis neteisingas.", 401);
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.authVersion = Number(user.authVersion || 0) + 1;

  await user.save();

  res.json({ message: "Slaptažodis pakeistas. Prisijunk iš naujo." });
};

const verifyUserEmail = async (req, res) => {
  const result = await verifyEmailToken({ token: req.body.token });

  res.json({
    message: result.message,
    user: formatProfileResponse(result.user),
  });
};

const resendUserEmailVerification = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+emailVerificationTokenHash +emailVerificationExpiresAt +emailVerificationSentAt"
  );

  if (!user || user.isDeleted) {
    throw createHttpError("Vartotojas nerastas.", 404);
  }

  if (getEmailVerificationDto(user).emailVerified) {
    return res.json({ message: "El. paštas jau patvirtintas.", emailVerificationEmailSent: false });
  }

  const result = await sendVerificationForUser({ user });

  res.json({
    message: result.sent
      ? "Patvirtinimo laiškas išsiųstas."
      : "Patvirtinimo laiško išsiųsti nepavyko. Bandyk dar kartą vėliau.",
    emailVerificationEmailSent: Boolean(result.sent),
  });
};

const exportCurrentUserData = async (req, res) => {
  const payload = await buildUserDataExport(req.user);
  const stamp = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="stilloak-user-data-${stamp}.json"`);
  res.setHeader("Cache-Control", "no-store");
  res.json(payload);
};

const deleteCurrentUser = async (req, res) => {
  const result = await deleteCurrentUserAccount({
    userId: req.user._id,
    currentPassword: req.body.currentPassword,
    confirmationText: req.body.confirmationText,
  });

  res.json(result);
};

module.exports = {
  changeUserPassword,
  deleteCurrentUser,
  exportCurrentUserData,
  forgotPassword,
  formatAuthResponse,
  formatProfileResponse,
  registerUser,
  loginUser,
  logoutUser,
  resendUserEmailVerification,
  signToken,
  getCurrentUser,
  resetUserPassword,
  verifyUserEmail,
};
