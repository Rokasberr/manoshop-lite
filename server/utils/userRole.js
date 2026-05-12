const normalizeUserRole = (user) => {
  const role = String(user?.role || "").trim().toLowerCase();

  if (role === "admin" || user?.isAdmin === true || String(user?.isAdmin || "").toLowerCase() === "true") {
    return "admin";
  }

  return "customer";
};

const isAdminUser = (user) => normalizeUserRole(user) === "admin";

module.exports = {
  isAdminUser,
  normalizeUserRole,
};
