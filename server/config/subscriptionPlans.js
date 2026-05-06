const subscriptionPlans = {
  free: {
    id: "free",
    name: "Be aktyvios prenumeratos",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Vidinė būsena paskyroms be aktyvios Stripe prenumeratos.",
    features: ["Privati paskyra", "Užsakymų istorija"],
    provider: "internal",
  },
  bazinis: {
    id: "bazinis",
    name: "Bazinis",
    price: 5.99,
    currency: "eur",
    interval: "month",
    description: "Paprasta pradžia mėnesio planui ir baziniams resursams.",
    stripePriceEnv: "STRIPE_PRICE_BAZINIS",
    features: [
      "Mėnesio fokusas",
      "Mini biudžeto peržiūra",
      "Baziniai resursai",
      "Šios savaitės veiksmas",
    ],
    provider: "stripe",
  },
  asmeninis: {
    id: "asmeninis",
    name: "Asmeninis",
    price: 15.99,
    currency: "eur",
    interval: "month",
    description: "Pagrindinė narystė pilnai Stilloak patirčiai: aiškesniems mėnesiams, tikslams ir privačiam archyvui.",
    stripePriceEnv: "STRIPE_PRICE_ASMENINIS",
    features: [
      "Pilna Stilloak darbo erdvė",
      "Biudžetai, tikslai ir pastovios išlaidos",
      "CSV importas ir mėnesio apžvalga",
      "Savaitinės ir mėnesinės suvestinės",
      "Nario naujienos tik nariams",
      "Prioritetinė paskyros priežiūra",
    ],
    provider: "stripe",
  },
  privatus_verslas: {
    id: "privatus_verslas",
    name: "Privatus verslas",
    price: 44.99,
    currency: "eur",
    interval: "month",
    description: "Aukštesnis narystės lygis tiems, kurie nori daugiau priežiūros, ramybės ir prioriteto.",
    stripePriceEnv: "STRIPE_PRICE_PRIVATUS_VERSLAS",
    features: [
      "Viskas iš Asmeninio plano",
      "Prioritetinė nario priežiūra",
      "Aiškesnė sąskaitų pagalba",
      "Nario naujienos tik nariams",
      "Ankstyva prieiga prie atidarymų",
      "Tinka gilesniam nuolatiniam naudojimui",
    ],
    provider: "stripe",
  },
};

const planAliases = {
  guest: "free",
  "be-aktyvios-prenumeratos": "free",
  "privatus-verslas": "privatus_verslas",
};

const normalizePlanId = (planId = "") => {
  const normalizedValue = String(planId || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  return planAliases[normalizedValue] || normalizedValue;
};

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
