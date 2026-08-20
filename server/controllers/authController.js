const jwt = require("jsonwebtoken");

const User = require("../models/User");
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
  },
});

const formatProfileResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeUserRole(user),
  createdAt: user.createdAt,
  subscription: serializeSubscription(user.subscription),
});

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

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
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw createHttpError(DUPLICATE_EMAIL_MESSAGE, 409);
    }

    throw error;
  }

  res.status(201).json(formatAuthResponse(user));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw createHttpError(LOGIN_FAILED_MESSAGE, 401);
  }

  res.json(formatAuthResponse(user));
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw createHttpError("Vartotojas nerastas.", 404);
  }

  res.json(formatProfileResponse(user));
};

const logoutUser = async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
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

  if (!user) {
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

module.exports = {
  changeUserPassword,
  forgotPassword,
  formatAuthResponse,
  formatProfileResponse,
  registerUser,
  loginUser,
  logoutUser,
  signToken,
  getCurrentUser,
  resetUserPassword,
};
