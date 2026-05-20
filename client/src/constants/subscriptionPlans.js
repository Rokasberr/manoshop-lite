import { translations } from "../i18n/translations";

export const subscriptionPlans = [
  {
    id: "basic",
    name: "Demo versija",
    subtitle: "Nemokama prieiga susipažinti su Saving Studio aplinka.",
    price: 0,
    intervalLabel: "",
    description: "Nemokama prieiga susipažinti su Saving Studio aplinka.",
    provider: "internal",
    badge: "Nemokama",
    features: [
      "Saving Studio peržiūra",
      "Bazinės planavimo kortelės",
      "Galimybė bet kada pereiti į Asmeninį planą",
      "Skaitmeninius produktus galima įsigyti atskirai",
    ],
  },
  {
    id: "personal",
    name: "Asmeninis",
    price: 14.99,
    intervalLabel: "/mėn.",
    description: "Pilna nario erdvė su suvestinėmis, tikslais ir premium resursais.",
    provider: "stripe",
    badge: "Populiariausias",
    features: [
      "Pilna nario zona",
      "Mėnesio suvestinės",
      "Tikslų progreso kortelės",
      "Nario naujienos",
      "Stilloak Growth Kit",
      "Premium resursai",
    ],
  },
  {
    id: "private_business",
    name: "Verslas",
    price: 44.99,
    intervalLabel: "/mėn.",
    subtitle: "Verslo įrankiai, svetainės zona, produktai, užsakymai ir pajamų apžvalga vienoje vietoje.",
    description: "Verslo įrankiai, svetainės zona, produktai, užsakymai ir pajamų apžvalga vienoje vietoje.",
    provider: "stripe",
    badge: "Verslas",
    features: [
      "Viskas iš Asmeninio plano",
      "Business Studio prieiga",
      "Svetainės ir produktų zona",
      "Užsakymų ir pajamų apžvalga",
      "Verslo šablonai ir skaitmeniniai ištekliai",
      "Prioritetinė patirtis",
    ],
  },
];

export const getLocalizedSubscriptionPlans = (language = "lt") => {
  const locale = translations[language] || translations.lt;
  const planCopies = locale.subscriptionPlans || {};

  return subscriptionPlans.map((plan) => ({
    ...plan,
    ...(planCopies[plan.id] || {}),
  }));
};
