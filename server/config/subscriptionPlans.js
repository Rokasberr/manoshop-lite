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
    description: "Nemokama prieiga susipazinti su StillOak Studio skaitmeniniais produktais.",
    features: [
      "Prieiga prie demo skaitmeniniu produktu",
      "PDF gidu perziura ir atsisiuntimas",
      "Excel sablonu atsisiuntimas",
      "Galimybe bet kada pereiti i Asmenini plana",
      "Be mokejimo korteles",
    ],
    provider: "internal",
  },
  personal: {
    id: "personal",
    legacyId: "asmeninis",
    name: "Asmeninis",
    price: 15.99,
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
    price: 44.99,
    currency: "eur",
    interval: "month",
    description: "Saving Studio Pro ir papildoma Business Studio zona verslo augimui.",
    stripePriceEnv: "STRIPE_PRICE_PRIVATUS_VERSLAS",
    features: [
      "Viskas is Asmeninio plano",
      "Business Studio",
      "Site Builder",
      "Skaitmeniniu produktu perpardavimas",
      "Uzsakymu ir pajamu apzvalga",
      "Prioritetine nario prieziura",
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
