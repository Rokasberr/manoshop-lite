const jwt = require("jsonwebtoken");

const {
  canUserAccessSavingStudioPro,
  canUserAccessBusinessStudio,
  hasActivePlanStatus,
  normalizePlan,
} = require("../config/planAccess");
const User = require("../models/User");
const { createHttpError } = require("../utils/httpError");
const { isAdminUser, normalizeUserRole } = require("../utils/userRole");
const { isEmailVerifiedForAccess } = require("../services/emailVerificationService");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError("Reikalinga autentifikacija.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted) {
      return next(createHttpError("Vartotojas nebegalioja.", 401));
    }

    if (Number(decoded.authVersion || 0) !== Number(user.authVersion || 0)) {
      return next(createHttpError("Sesija nebegalioja. Prisijunk iš naujo.", 401));
    }

    req.user = user;
    req.userRole = normalizeUserRole(user);
    next();
  } catch (error) {
    next(createHttpError("Neteisingas arba pasibaigęs tokenas.", 401));
  }
};

const requireAuth = protect;

const adminOnly = (req, res, next) => {
  if (!isAdminUser(req.user)) {
    return next(createHttpError("Tik admin gali atlikti šį veiksmą.", 403));
  }

  next();
};

const hasActiveMembership = (user) => {
  if (isAdminUser(user)) {
    return true;
  }

  return (
    Boolean(user) &&
    hasActivePlanStatus(user) &&
    ["basic", "personal", "private_business"].includes(normalizePlan(user.subscription?.plan))
  );
};

const memberOnly = (req, res, next) => {
  if (!hasActiveMembership(req.user)) {
    return next(createHttpError("Ši sritis prieinama tik aktyviems nariams.", 403));
  }

  next();
};

const requirePlan = (...allowedPlans) => (req, res, next) => {
  if (isAdminUser(req.user)) {
    return next();
  }

  if (!hasActivePlanStatus(req.user)) {
    return next(createHttpError("Reikalinga aktyvi naryste.", 403));
  }

  const normalizedPlan = normalizePlan(req.user?.subscription?.plan);
  const normalizedAllowedPlans = allowedPlans.map(normalizePlan);

  if (!normalizedAllowedPlans.includes(normalizedPlan)) {
    return next(createHttpError("Šiam planui ši zona neprieinama.", 403));
  }

  return next();
};

const requireBusinessPlan = (req, res, next) => {
  if (!canUserAccessBusinessStudio(req.user)) {
    return next(createHttpError("Business plan required.", 403));
  }

  return next();
};

const requireSavingsStudioPro = (req, res, next) => {
  if (!canUserAccessSavingStudioPro(req.user)) {
    return next(createHttpError("Asmeninis arba Verslas planas reikalingas pilnai Saving Studio prieigai.", 403));
  }

  return next();
};

const requireVerifiedEmail = (req, res, next) => {
  if (isAdminUser(req.user) || isEmailVerifiedForAccess(req.user)) {
    return next();
  }

  return next(createHttpError("Patvirtink el. paštą prieš tęsiant šį veiksmą.", 403));
};

module.exports = {
  requireAuth,
  protect,
  adminOnly,
  memberOnly,
  hasActiveMembership,
  requirePlan,
  requireVerifiedEmail,
  requireBusinessPlan,
  requireSavingsStudioPro,
};
