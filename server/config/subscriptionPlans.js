const subscriptionPlans = {
  free: {
    id: "free",
    name: "Guest",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Peržiūri brand pasaulį, pricing logiką ir paskyrą prieš atrakindamas pilną nario įrankį.",
    features: ["Account and receipt archive", "Launch updates and public previews", "Secure checkout and profile history"],
    provider: "internal",
  },
  circle: {
    id: "circle",
    name: "Circle",
    price: 10,
    currency: "eur",
    interval: "month",
    description: "Pagrindinė narystė pilnai Stilloak prieigai: biudžetams, tikslams, recurring išlaidoms ir AI suvestinėms.",
    features: [
      "Full Stilloak dashboard access",
      "Budgets, goals, and recurring spending",
      "CSV import and monthly money view",
      "Weekly and monthly AI summary emails",
      "Members-only Journal access",
      "Priority support and billing",
    ],
    provider: "stripe",
  },
  private: {
    id: "private",
    name: "Private",
    price: 20,
    currency: "eur",
    interval: "month",
    description: "Aukštesnio lygio narystė tiems, kas nori gilesnio santykio, daugiau palaikymo ir stipresnio premium sluoksnio.",
    features: [
      "Everything in Circle",
      "Priority member handling",
      "Private-tier support and billing",
      "Members-only Journal access",
      "Stronger launch and early-access layer",
      "Best fit for deeper ongoing use",
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
