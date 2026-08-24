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

export default {
  changePassword,
  forgotPassword,
  register,
  login,
  logout,
  profile,
  resetPassword,
};

