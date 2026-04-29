export const memberAccessStatuses = ["active", "trialing", "past_due"];

export const hasPaidMembershipSignal = (user) => {
  if (!user) {
    return false;
  }

  return (user.subscription?.plan || "free") !== "free";
};

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
