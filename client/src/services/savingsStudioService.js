import api from "./api";

const getMeta = async () => {
  const { data } = await api.get("/savings-studio/meta");
  return data;
};

const getEntries = async () => {
  const { data } = await api.get("/savings-studio/entries");
  return data;
};

const getBudgets = async (month) => {
  const { data } = await api.get("/savings-studio/budgets", {
    params: { month },
  });
  return data;
};

const updateBudgets = async (payload) => {
  const { data } = await api.put("/savings-studio/budgets", payload);
  return data;
};

const getSummary = async () => {
  const { data } = await api.get("/savings-studio/summary");
  return data;
};

const createEntry = async (payload) => {
  const { data } = await api.post("/savings-studio/entries", payload);
  return data;
};

const updateEntry = async (entryId, payload) => {
  const { data } = await api.put(`/savings-studio/entries/${entryId}`, payload);
  return data;
};

const deleteEntry = async (entryId) => {
  await api.delete(`/savings-studio/entries/${entryId}`);
};

export default {
  getMeta,
  getEntries,
  getBudgets,
  getSummary,
  createEntry,
  updateEntry,
  updateBudgets,
  deleteEntry,
};
