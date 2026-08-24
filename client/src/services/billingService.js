import api from "./api";

const createPaymentSession = async (payload) => {
  const { data } = await api.post("/billing/create-payment-session", payload);
  return data;
};

const activateDemoPlan = async () => {
  const { data } = await api.post("/billing/activate-demo-plan");
  return data;
};

const syncStripeMembership = async (sessionId = "") => {
  const { data } = await api.post("/billing/sync-stripe-membership", { sessionId });
  return data;
};

const createPortalSession = async () => {
  const { data } = await api.post("/billing/create-portal-session");
  return data;
};

const getSubscriptionInvoices = async () => {
  const { data } = await api.get("/billing/subscription-invoices");
  return data;
};

const getBillingProfile = async () => {
  const { data } = await api.get("/billing/me");
  return data;
};

export default {
  activateDemoPlan,
  createPortalSession,
  createPaymentSession,
  getSubscriptionInvoices,
  syncStripeMembership,
  getBillingProfile,
};
