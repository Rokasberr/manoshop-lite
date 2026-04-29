const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { findLatestStripeSubscriptionForUser, serializeSubscription } = require("../services/stripeMembershipService");
const { getStripeClient } = require("../utils/stripeClient");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

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

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Užpildyk vardą, el. paštą ir slaptažodį.");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Slaptažodis turi būti bent 6 simbolių.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("Toks vartotojas jau egzistuoja.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json(formatAuthResponse(user));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Įvesk el. paštą ir slaptažodį.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Neteisingi prisijungimo duomenys.");
  }

  const refreshedUser = await refreshMembershipFromStripeIfNeeded(user);

  res.json(formatAuthResponse(refreshedUser));
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Vartotojas nerastas.");
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

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
