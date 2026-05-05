const subscriptionPlans = {
  free: {
    id: "free",
    name: "Guest",
    price: 0,
    currency: "eur",
    interval: "month",
    description: "Trumpa įžanga į Stilloak pasaulį prieš pasirenkant pilną narystę.",
    features: ["Privati paskyra", "Atidarymo peržiūros", "Privati užsakymų istorija"],
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
      "Pilna Stilloak darbo erdvė",
      "Biudžetai, tikslai ir pastovios išlaidos",
      "CSV importas ir mėnesio apžvalga",
      "Savaitinės ir mėnesinės suvestinės",
      "Nario naujienos tik nariams",
      "Prioritetinė paskyros priežiūra",
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
      "Viskas iš Circle",
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
