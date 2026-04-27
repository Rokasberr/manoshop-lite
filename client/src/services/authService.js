import api from "./api";

const register = async (payload) => {
  const { data } = await api.post("/register", payload);
  return data;
};

const login = async (payload) => {
  const { data } = await api.post("/login", payload);
  return data;
};

const profile = async () => {
  const { data } = await api.get("/profile");
  return data;
};

export default {
  register,
  login,
  profile,
};

