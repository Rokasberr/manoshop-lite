const User = require("../models/User");

const getAdminUsers = async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

module.exports = {
  getAdminUsers,
};

