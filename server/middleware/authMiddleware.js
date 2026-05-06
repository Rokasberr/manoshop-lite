const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { createHttpError } = require("../utils/httpError");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError("Reikalinga autentifikacija.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(createHttpError("Vartotojas nebegalioja.", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createHttpError("Neteisingas arba pasibaigęs tokenas.", 401));
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(createHttpError("Tik admin gali atlikti šį veiksmą.", 403));
  }

  next();
};

const hasActiveMembership = (user) => {
  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const plan = user.subscription?.plan || "free";
  const status = user.subscription?.status || "inactive";

  return plan !== "free" && ["active", "trialing"].includes(status);
};

const memberOnly = (req, res, next) => {
  if (!hasActiveMembership(req.user)) {
    return next(createHttpError("Ši sritis prieinama tik aktyviems nariams.", 403));
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  memberOnly,
  hasActiveMembership,
};
