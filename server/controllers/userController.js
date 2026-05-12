const User = require("../models/User");
const { normalizeUserRole } = require("../utils/userRole");

const getAdminUsers = async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(
    users.map((user) => {
      const userObject = user.toObject();
      return {
        ...userObject,
        role: normalizeUserRole(userObject),
      };
    })
  );
};

module.exports = {
  getAdminUsers,
};

