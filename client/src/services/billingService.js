import api from "./api";

const createPaymentSession = async (payload) => {
  const { data } = await api.post("/billing/create-payment-session", payload);
  return data;
};

const getBillingProfile = async () => {
  const { data } = await api.get("/billing/me");
  return data;
};

export default {
  createPaymentSession,
  getBillingProfile,
};

