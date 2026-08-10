const { isAdminUser } = require("../utils/userRole");

const PLAN_CODES = {
  FREE: "free",
  BASIC: "basic",
  PERSONAL: "personal",
  PRIVATE_BUSINESS: "private_business",
};

const LEGACY_PLAN_ALIASES = {
  guest: PLAN_CODES.FREE,
  bazinis: PLAN_CODES.BASIC,
  basic: PLAN_CODES.BASIC,
  asmeninis: PLAN_CODES.PERSONAL,
  personal: PLAN_CODES.PERSONAL,
  privatus_verslas: PLAN_CODES.PRIVATE_BUSINESS,
  "privatus-verslas": PLAN_CODES.PRIVATE_BUSINESS,
  private_business: PLAN_CODES.PRIVATE_BUSINESS,
  "private-business": PLAN_CODES.PRIVATE_BUSINESS,
};

const ACTIVE_PLAN_STATUSES = new Set(["active", "trialing"]);

const normalizePlan = (plan = "") => {
  const normalizedValue = String(plan || PLAN_CODES.FREE)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  return LEGACY_PLAN_ALIASES[normalizedValue] || normalizedValue || PLAN_CODES.FREE;
};

const getUserPlan = (user) => normalizePlan(user?.subscription?.plan || PLAN_CODES.FREE);

const hasActivePlanStatus = (user) => {
  if (isAdminUser(user)) {
    return true;
  }

  const status = String(user?.subscription?.status || "inactive").trim().toLowerCase();

  return ACTIVE_PLAN_STATUSES.has(status);
};

const canAccessSavingStudio = (plan) =>
  [PLAN_CODES.BASIC, PLAN_CODES.PERSONAL, PLAN_CODES.PRIVATE_BUSINESS].includes(normalizePlan(plan));

const canAccessSavingStudioPro = (plan) =>
  [PLAN_CODES.PERSONAL, PLAN_CODES.PRIVATE_BUSINESS].includes(normalizePlan(plan));

const canAccessBusinessStudio = (plan) => normalizePlan(plan) === PLAN_CODES.PRIVATE_BUSINESS;

const canResellProducts = canAccessBusinessStudio;

const canUserAccessSavingStudio = (user) =>
  isAdminUser(user) || (hasActivePlanStatus(user) && canAccessSavingStudio(getUserPlan(user)));

const canUserAccessSavingStudioPro = (user) =>
  isAdminUser(user) || (hasActivePlanStatus(user) && canAccessSavingStudioPro(getUserPlan(user)));

const canUserAccessBusinessStudio = (user) =>
  isAdminUser(user) || (hasActivePlanStatus(user) && canAccessBusinessStudio(getUserPlan(user)));

module.exports = {
  ACTIVE_PLAN_STATUSES,
  PLAN_CODES,
  canAccessBusinessStudio,
  canAccessSavingStudio,
  canAccessSavingStudioPro,
  canResellProducts,
  canUserAccessBusinessStudio,
  canUserAccessSavingStudio,
  canUserAccessSavingStudioPro,
  getUserPlan,
  hasActivePlanStatus,
  normalizePlan,
};
