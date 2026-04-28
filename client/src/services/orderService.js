import api from "./api";

const createOrder = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

const createStripeCheckoutSession = async (payload) => {
  const { data } = await api.post("/orders/stripe/checkout-session", payload);
  return data;
};

const getStripeCheckoutSessionStatus = async (sessionId) => {
  const { data } = await api.get(`/orders/stripe/session/${sessionId}`);
  return data;
};

const cancelStripeCheckout = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/cancel-checkout`);
  return data;
};

const adminCancelOrderPayment = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/admin-cancel-payment`);
  return data;
};

const refundOrderPayment = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/refund`);
  return data;
};

const downloadInvoice = async (id, invoiceNumber = "invoice") => {
  const response = await api.get(`/orders/${id}/invoice`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const downloadDigitalProduct = async (orderId, productId, fileName = "download") => {
  const response = await api.get(`/orders/${orderId}/items/${productId}/download`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getUserOrders = async () => {
  const { data } = await api.get("/orders/user");
  return data;
};

const getAdminOrders = async () => {
  const { data } = await api.get("/orders/admin");
  return data;
};

const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export default {
  createOrder,
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
  cancelStripeCheckout,
  adminCancelOrderPayment,
  refundOrderPayment,
  downloadInvoice,
  downloadDigitalProduct,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
};
