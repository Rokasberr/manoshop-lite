const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Reikalinga autentifikacija."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      return next(new Error("Vartotojas nebegalioja."));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Neteisingas arba pasibaigęs tokenas."));
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    return next(new Error("Tik admin gali atlikti šį veiksmą."));
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};

