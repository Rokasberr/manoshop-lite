const WEB_SERVICE_PLANS = Object.freeze({
  start: Object.freeze({
    id: "start",
    name: "Start",
    basePrice: 299,
    description: "Paprasta reprezentacinė svetainė mažam verslui ar paslaugai.",
  }),
  business: Object.freeze({
    id: "business",
    name: "Business",
    basePrice: 599,
    description: "Pilna verslo svetainė su aiškia struktūra ir užklausų srautu.",
  }),
  pro: Object.freeze({
    id: "pro",
    name: "Pro",
    basePrice: 999,
    description: "Didesnė svetainė su pažangesnėmis funkcijomis ir integracijomis.",
  }),
  custom: Object.freeze({
    id: "custom",
    name: "Pagal poreikius",
    basePrice: null,
    description: "Individualus sprendimas nestandartiniams projektams.",
  }),
});

const WEB_SERVICE_PLAN_IDS = Object.freeze(Object.keys(WEB_SERVICE_PLANS));

const getWebServicePlan = (planId) => {
  const normalizedId = String(planId || "").trim().toLowerCase();
  return WEB_SERVICE_PLANS[normalizedId] || null;
};

module.exports = {
  WEB_SERVICE_PLANS,
  WEB_SERVICE_PLAN_IDS,
  getWebServicePlan,
};
