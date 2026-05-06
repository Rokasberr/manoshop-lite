const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { findLatestStripeSubscriptionForUser, serializeSubscription } = require("../services/stripeMembershipService");
const { getStripeClient } = require("../utils/stripeClient");
const { createHttpError } = require("../utils/httpError");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const shouldAttemptStripeRefresh = (user) => {
  if (!user || user.role === "admin") {
    return false;
  }

  return Boolean(user.email);
};

const refreshMembershipFromStripeIfNeeded = async (user) => {
  if (!shouldAttemptStripeRefresh(user)) {
    return user;
  }

  try {
    const stripe = getStripeClient();
    return (await findLatestStripeSubscriptionForUser(stripe, user)) || user;
  } catch (_error) {
    return user;
  }
};

const formatAuthResponse = (user) => ({
  token: signToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscription: serializeSubscription(user.subscription),
  },
});

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError("Toks vartotojas jau egzistuoja.", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "customer",
  });

  res.status(201).json(formatAuthResponse(user));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw createHttpError("Neteisingi prisijungimo duomenys.", 401);
  }

  const refreshedUser = await refreshMembershipFromStripeIfNeeded(user);

  res.json(formatAuthResponse(refreshedUser));
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw createHttpError("Vartotojas nerastas.", 404);
  }

  const refreshedUser = await refreshMembershipFromStripeIfNeeded(user);

  res.json({
    id: refreshedUser._id,
    name: refreshedUser.name,
    email: refreshedUser.email,
    role: refreshedUser.role,
    createdAt: refreshedUser.createdAt,
    subscription: serializeSubscription(refreshedUser.subscription),
  });
};

const logoutUser = async (_req, res) => {
  res.json({ message: "Atsijungta." });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
