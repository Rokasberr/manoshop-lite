import api from "./api";

const listUsers = async () => {
  const { data } = await api.get("/users/admin/list");
  return data;
};

export default {
  listUsers,
};

