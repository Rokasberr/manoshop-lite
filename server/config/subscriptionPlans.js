const subscriptionPlans = {
  free: {
    id: "free",
    name: "Guest",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Trumpa įžanga į Stilloak pasaulį prieš pasirenkant pilną narystę.",
    features: ["Private account", "Launch previews", "Secure checkout history"],
    provider: "internal",
  },
  circle: {
    id: "circle",
    name: "Circle",
    price: 10,
    currency: "eur",
    interval: "month",
    description: "Pagrindinė narystė pilnai Stilloak patirčiai: aiškesniems mėnesiams, tikslams ir privačiam archyvui.",
    features: [
      "Full Stilloak dashboard",
      "Budgets, goals, and recurring spend",
      "CSV import and monthly overview",
      "Weekly and monthly summaries",
      "Members-only Journal",
      "Priority account care",
    ],
    provider: "stripe",
  },
  private: {
    id: "private",
    name: "Private",
    price: 20,
    currency: "eur",
    interval: "month",
    description: "Aukštesnis narystės lygis tiems, kurie nori daugiau priežiūros, ramybės ir prioriteto.",
    features: [
      "Everything in Circle",
      "Priority member care",
      "Private-tier billing support",
      "Members-only Journal",
      "Early access when releases open",
      "Best for deeper ongoing use",
    ],
    provider: "stripe",
  },
};

const planAliases = {
  guest: "free",
  pro: "circle",
  business: "private",
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
