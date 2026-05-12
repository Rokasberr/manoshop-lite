const { normalizePlan } = require("../config/planAccess");
const { normalizeUserRole, isAdminUser } = require("../utils/userRole");

const getAdminAuthDebug = (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404);
    throw new Error("Kelias nerastas.");
  }

  res.json({
    authenticated: Boolean(req.user),
    userId: req.user?._id || null,
    email: req.user?.email || "",
    rawRole: req.user?.role || "",
    normalizedRole: normalizeUserRole(req.user),
    hasLegacyIsAdminFlag: req.user?.isAdmin === true,
    adminRecognized: isAdminUser(req.user),
    subscriptionPlan: normalizePlan(req.user?.subscription?.plan || "free"),
    subscriptionStatus: req.user?.subscription?.status || "inactive",
  });
};

module.exports = {
  getAdminAuthDebug,
};
