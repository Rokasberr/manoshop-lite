export const memberAccessStatuses = ["active", "trialing"];

export const planAliases = {
  guest: "free",
  bazinis: "basic",
  basic: "basic",
  asmeninis: "personal",
  personal: "personal",
  privatus_verslas: "private_business",
  "privatus-verslas": "private_business",
  private_business: "private_business",
  "private-business": "private_business",
};

export const planDisplayNames = {
  free: "Be aktyvios narystės",
  basic: "Demo versija",
  personal: "Asmeninis",
  private_business: "Privatus verslas",
};

export const normalizePlan = (plan = "") => {
  const value = String(plan || "free")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  return planAliases[value] || value || "free";
};

export const normalizeUserRole = (user) => {
  const role = String(user?.role || "").trim().toLowerCase();

  if (role === "admin" || user?.isAdmin === true || String(user?.isAdmin || "").toLowerCase() === "true") {
    return "admin";
  }

  return "customer";
};

export const isAdminUser = (user) => normalizeUserRole(user) === "admin";

export const hasPaidMembershipSignal = (user) => {
  if (!user) {
    return false;
  }

  return normalizePlan(user.subscription?.plan || "free") !== "free";
};

export const hasActiveMembership = (user) => {
  if (!user) {
    return false;
  }

  if (isAdminUser(user)) {
    return true;
  }

  const plan = normalizePlan(user.subscription?.plan || "free");
  const status = String(user.subscription?.status || "inactive").trim().toLowerCase();

  return ["basic", "personal", "private_business"].includes(plan) && memberAccessStatuses.includes(status);
};

export const canAccessSavingStudio = (plan) =>
  ["basic", "personal", "private_business"].includes(normalizePlan(plan));

export const canAccessSavingStudioPro = (plan) =>
  ["personal", "private_business"].includes(normalizePlan(plan));

export const canAccessBusinessStudio = (plan) => normalizePlan(plan) === "private_business";

export const canResellProducts = canAccessBusinessStudio;

export const userCanAccessBusinessStudio = (user) =>
  isAdminUser(user) || (hasActiveMembership(user) && canAccessBusinessStudio(user.subscription?.plan));
