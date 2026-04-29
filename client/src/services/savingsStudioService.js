import api from "./api";

const getMeta = async () => {
  const { data } = await api.get("/savings-studio/meta");
  return data;
};

const getProfile = async () => {
  const { data } = await api.get("/savings-studio/profile");
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await api.put("/savings-studio/profile", payload);
  return data;
};

const updateEmailSettings = async (payload) => {
  const { data } = await api.put("/savings-studio/email-settings", payload);
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

const getGoals = async () => {
  const { data } = await api.get("/savings-studio/goals");
  return data;
};

const createGoal = async (payload) => {
  const { data } = await api.post("/savings-studio/goals", payload);
  return data;
};

const updateGoal = async (goalId, payload) => {
  const { data } = await api.put(`/savings-studio/goals/${goalId}`, payload);
  return data;
};

const deleteGoal = async (goalId) => {
  await api.delete(`/savings-studio/goals/${goalId}`);
};

const getRecurringExpenses = async () => {
  const { data } = await api.get("/savings-studio/recurring");
  return data;
};

const createRecurringExpense = async (payload) => {
  const { data } = await api.post("/savings-studio/recurring", payload);
  return data;
};

const logRecurringExpense = async (recurringId, payload = {}) => {
  const { data } = await api.post(`/savings-studio/recurring/${recurringId}/log`, payload);
  return data;
};

const updateRecurringExpense = async (recurringId, payload) => {
  const { data } = await api.put(`/savings-studio/recurring/${recurringId}`, payload);
  return data;
};

const deleteRecurringExpense = async (recurringId) => {
  await api.delete(`/savings-studio/recurring/${recurringId}`);
};

const getSummary = async () => {
  const { data } = await api.get("/savings-studio/summary");
  return data;
};

const createEntry = async (payload) => {
  const { data } = await api.post("/savings-studio/entries", payload);
  return data;
};

const previewEntriesImport = async (payload) => {
  const { data } = await api.post("/savings-studio/entries/import-preview", payload);
  return data;
};

const importEntries = async (payload) => {
  const { data } = await api.post("/savings-studio/entries/import", payload);
  return data;
};

const updateEntry = async (entryId, payload) => {
  const { data } = await api.put(`/savings-studio/entries/${entryId}`, payload);
  return data;
};

const deleteEntry = async (entryId) => {
  await api.delete(`/savings-studio/entries/${entryId}`);
};

const sendSummaryEmail = async (payload) => {
  const { data } = await api.post("/savings-studio/summary-email", payload);
  return data;
};

const downloadSummaryFile = async (frequency, format = "html") => {
  const response = await api.get("/savings-studio/summary-export", {
    params: { frequency, format },
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentDisposition: response.headers["content-disposition"] || "",
  };
};

const downloadBackup = async () => {
  const response = await api.get("/savings-studio/backup", {
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentDisposition: response.headers["content-disposition"] || "",
  };
};

export default {
  getMeta,
  getProfile,
  updateProfile,
  updateEmailSettings,
  getEntries,
  getBudgets,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getRecurringExpenses,
  createRecurringExpense,
  logRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getSummary,
  createEntry,
  previewEntriesImport,
  importEntries,
  updateEntry,
  updateBudgets,
  deleteEntry,
  sendSummaryEmail,
  downloadSummaryFile,
  downloadBackup,
};
