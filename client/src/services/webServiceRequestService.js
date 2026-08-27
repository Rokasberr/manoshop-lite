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

export default {
  getAdminRequests,
  updateRequest,
};
