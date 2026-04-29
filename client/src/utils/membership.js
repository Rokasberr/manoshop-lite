export const memberAccessStatuses = ["active", "trialing", "past_due"];

export const hasActiveMembership = (user) => {
  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const plan = user.subscription?.plan || "free";
  const status = user.subscription?.status || "inactive";

  return plan !== "free" && memberAccessStatuses.includes(status);
};
