const jwt = require("jsonwebtoken");

const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const serializeSubscription = (subscription) => ({
  plan: subscription?.plan || "free",
  status: subscription?.status || "active",
  provider: subscription?.provider || "internal",
  currentPeriodEnd: subscription?.currentPeriodEnd || null,
});

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

  res.json(formatAuthResponse(user));
};

const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Vartotojas nerastas.");
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    subscription: serializeSubscription(user.subscription),
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
