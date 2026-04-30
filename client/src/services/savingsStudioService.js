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

const triggerBlobDownload = ({ blobPart, contentType, fileName }) => {
  const blob = blobPart instanceof Blob ? blobPart : new Blob([blobPart], { type: contentType });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }, 1500);
};

const extractFilename = (contentDisposition = "", fallbackName = "download") => {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return basicMatch?.[1] || fallbackName;
};

const downloadSummaryFile = async (frequency, format = "html") => {
  const response = await api.get("/savings-studio/summary-export", {
    params: { frequency, format },
    responseType: "blob",
  });

  const fallbackFrequency = frequency === "monthly" ? "monthly" : "weekly";
  const fallbackName = `stilloak-${fallbackFrequency}-summary-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.${format === "txt" ? "txt" : "html"}`;

  triggerBlobDownload({
    blobPart: response.data,
    contentType: response.headers["content-type"] || "application/octet-stream",
    fileName: extractFilename(response.headers["content-disposition"] || "", fallbackName),
  });
};

const downloadBackup = async () => {
  const response = await api.get("/savings-studio/backup", {
    responseType: "blob",
  });

  triggerBlobDownload({
    blobPart: response.data,
    contentType: response.headers["content-type"] || "application/json",
    fileName: extractFilename(
      response.headers["content-disposition"] || "",
      `savings-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
    ),
  });
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
