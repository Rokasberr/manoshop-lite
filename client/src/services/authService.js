import api from "./api";

const register = async (payload) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const { data } = await api.post("/register", payload);
    return data;
  }
};

const login = async (payload) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const { data } = await api.post("/login", payload);
    return data;
  }
};

const profile = async () => {
  try {
    const { data } = await api.get("/auth/profile");
    return data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const { data } = await api.get("/profile");
    return data;
  }
};

const forgotPassword = async (payload) => {
  try {
    const { data } = await api.post("/auth/forgot-password", payload);
    return data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const { data } = await api.post("/forgot-password", payload);
    return data;
  }
};

const resetPassword = async (payload) => {
  try {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const { data } = await api.post("/reset-password", payload);
    return data;
  }
};

export default {
  forgotPassword,
  register,
  login,
  profile,
  resetPassword,
};

