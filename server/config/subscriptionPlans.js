const { normalizePlan } = require("./planAccess");

const subscriptionPlans = {
  free: {
    id: "free",
    name: "Be aktyvios prenumeratos",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Vidine busena paskyroms be aktyvios Stripe prenumeratos.",
    features: ["Privati paskyra", "Uzsakymu istorija"],
    provider: "internal",
  },
  basic: {
    id: "basic",
    legacyId: "bazinis",
    name: "Demo versija",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Nemokama prieiga susipazinti su Saving Studio aplinka.",
    features: [
      "Saving Studio perziura",
      "Baziniu planavimo korteliu prieiga",
      "Galimybe bet kada pereiti i Asmenini plana",
      "Skaitmeninius produktus galima isigyti atskirai",
    ],
    provider: "internal",
  },
  personal: {
    id: "personal",
    legacyId: "asmeninis",
    name: "Asmeninis",
    price: 24,
    currency: "eur",
    interval: "month",
    description: "Pilna Stilloak patirtis aiskesniems menesiams, tikslams ir privaciam archyvui.",
    stripePriceEnv: "STRIPE_PRICE_ASMENINIS",
    features: [
      "Pilna Stilloak darbo erdve",
      "Biudzetai, tikslai ir pastovios islaidos",
      "CSV importas ir menesio apzvalga",
      "Savaitines ir menesines suvestines",
      "Nario naujienos tik nariams",
      "Prioritetine paskyros prieziura",
    ],
    provider: "stripe",
  },
  private_business: {
    id: "private_business",
    legacyId: "privatus_verslas",
    name: "Privatus verslas",
    price: 99,
    currency: "eur",
    interval: "month",
    description: "Verslo irankiai, svetaines zona, produktai, uzsakymai ir pajamu apzvalga vienoje vietoje.",
    stripePriceEnv: "STRIPE_PRICE_PRIVATUS_VERSLAS",
    features: [
      "Viskas is Asmeninio plano",
      "Business Studio prieiga",
      "Svetaines ir produktu zona",
      "Uzsakymu ir pajamu apzvalga",
      "Verslo sablonai ir skaitmeniniai istekliai",
      "Prioritetine patirtis",
    ],
    provider: "stripe",
  },
};

const normalizePlanId = normalizePlan;

const getPlanById = (planId) => {
  const plan = subscriptionPlans[normalizePlanId(planId)] || null;

  if (!plan) {
    return null;
  }

  return {
    ...plan,
    priceId: plan.stripePriceEnv ? process.env[plan.stripePriceEnv] || "" : "",
  };
};

module.exports = {
  subscriptionPlans,
  normalizePlanId,
  getPlanById,
};
