import api from "./api";

const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

const profile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

const forgotPassword = async (payload) => {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data;
};

const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};

const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

const changePassword = async (payload) => {
  const { data } = await api.post("/auth/change-password", payload);
  return data;
};

const verifyEmail = async (token) => {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
};

const resendVerification = async () => {
  const { data } = await api.post("/auth/resend-verification");
  return data;
};

const exportData = async () => {
  const response = await api.get("/auth/export-data", {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/json;charset=utf-8",
  });
  const disposition = response.headers["content-disposition"] || "";
  const fileNameMatch = disposition.match(/filename="([^"]+)"/);
  const fileName = fileNameMatch?.[1] || "stilloak-user-data.json";
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const deleteAccount = async (payload) => {
  const { data } = await api.delete("/auth/account", { data: payload });
  return data;
};

export default {
  changePassword,
  deleteAccount,
  exportData,
  forgotPassword,
  register,
  login,
  logout,
  profile,
  resendVerification,
  resetPassword,
  verifyEmail,
};

