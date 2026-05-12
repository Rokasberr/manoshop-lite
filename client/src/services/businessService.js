import api from "./api";

const getDashboard = async () => {
  const { data } = await api.get("/business/dashboard");
  return data;
};

const getResaleProducts = async () => {
  const { data } = await api.get("/business/products");
  return data;
};

const getMyStore = async () => {
  const { data } = await api.get("/business/store");
  return data;
};

const saveMyStore = async (payload) => {
  const { data } = await api.put("/business/store", payload);
  return data;
};

const getMyOrders = async () => {
  const { data } = await api.get("/business/orders");
  return data;
};

const getPublicStore = async (slug) => {
  const { data } = await api.get(`/stores/${slug}`);
  return data;
};

const createStoreCheckoutSession = async (slug, payload) => {
  const { data } = await api.post(`/stores/${slug}/checkout`, payload);
  return data;
};

export default {
  createStoreCheckoutSession,
  getDashboard,
  getMyOrders,
  getMyStore,
  getPublicStore,
  getResaleProducts,
  saveMyStore,
};
