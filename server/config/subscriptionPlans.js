const subscriptionPlans = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Startinis planas ankstyvam testavimui.",
    features: ["Basic access", "No recurring charge", "Profile and starter tools"],
    provider: "internal",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 10,
    currency: "eur",
    interval: "month",
    description: "Pagrindinis SaaS planas individualiems naudotojams.",
    features: ["Stripe subscription", "Monthly billing", "Priority account access"],
    provider: "stripe",
  },
  business: {
    id: "business",
    name: "Business",
    price: 20,
    currency: "eur",
    interval: "month",
    description: "Išplėstas planas komandoms ir augančiam verslui.",
    features: ["Everything in Pro", "Business tier subscription", "Team-ready billing"],
    provider: "stripe",
  },
};

const planAliases = {
  guest: "free",
  circle: "pro",
  private: "business",
};

const normalizePlanId = (planId = "") => {
  const normalizedValue = String(planId || "").trim().toLowerCase();

  return planAliases[normalizedValue] || normalizedValue;
};

const getPlanById = (planId) => subscriptionPlans[normalizePlanId(planId)] || null;

module.exports = {
  subscriptionPlans,
  normalizePlanId,
  getPlanById,
};
