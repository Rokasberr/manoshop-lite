import api from "./api";

const listProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

const getCategories = async () => {
  const { data } = await api.get("/products/categories/list");
  return data;
};

const createProduct = async (payload) => {
  const { data } = await api.post("/products", payload);
  return data;
};

const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export default {
  listProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};

