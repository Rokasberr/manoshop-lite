import api from "./api";

const getAdminRequests = async (status = "") => {
  const response = await api.get("/web-service-requests", {
    params: status ? { status } : undefined,
  });
  return response.data;
};

const updateRequest = async (requestId, payload) => {
  const response = await api.patch(`/web-service-requests/${requestId}`, payload);
  return response.data;
};

const sendProposal = async (requestId, payload) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/send`, payload);
  return response.data;
};

const syncDeposit = async (requestId) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/deposit/sync`);
  return response.data;
};

const markBankTransferPaid = async (requestId) => {
  const response = await api.post(
    `/web-service-requests/${requestId}/proposal/deposit/bank-transfer/paid`
  );
  return response.data;
};
const requestFinalPayment = async (requestId) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/final-payment/request`);
  return response.data;
};
const markFinalBankTransferPaid = async (requestId) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/final-payment/bank-transfer/paid`);
  return response.data;
};
const resendTestInvoice = async (requestId, paymentType) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/invoice/resend`, { paymentType });
  return response.data;
};
const resendTestContract = async (requestId) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/test-contract/resend`);
  return response.data;
};
const resendHandover = async (requestId) => {
  const response = await api.post(`/web-service-requests/${requestId}/proposal/handover/resend`);
  return response.data;
};

export default {
  getAdminRequests,
  markBankTransferPaid,
  markFinalBankTransferPaid,
  resendHandover,
  resendTestContract,
  resendTestInvoice,
  requestFinalPayment,
  sendProposal,
  syncDeposit,
  updateRequest,
};
