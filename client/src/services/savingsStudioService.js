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

const getSummary = async (month) => {
  const { data } = await api.get("/savings-studio/summary", {
    params: month ? { month } : {},
  });
  return data;
};

const getActivity = async () => {
  const { data } = await api.get("/savings-studio/activity");
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
    try {
      return sanitizeDownloadFilename(decodeURIComponent(utf8Match[1]), fallbackName);
    } catch (_error) {
      return fallbackName;
    }
  }

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return sanitizeDownloadFilename(basicMatch?.[1] || fallbackName, fallbackName);
};

const sanitizeDownloadFilename = (value, fallbackName = "download") => {
  const fileName = String(value || fallbackName)
    .replace(/[/\\?%*:|"<> \r\n\t]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return fileName || fallbackName;
};

const downloadSummaryFile = async ({ month, format = "txt" }) => {
  const response = await api.get("/savings-studio/summary-export", {
    params: { frequency: "monthly", format, month },
    responseType: "blob",
  });

  const safeMonth = /^\d{4}-\d{2}$/.test(String(month || "")) ? month : new Date().toISOString().slice(0, 7);
  const fallbackName = `stilloak-monthly-summary-${safeMonth}.txt`;

  triggerBlobDownload({
    blobPart: response.data,
    contentType: response.headers["content-type"] || "text/plain",
    fileName: extractFilename(response.headers["content-disposition"] || "", fallbackName),
  });
};

const downloadEntriesCsv = async ({ month, scope = "month" }) => {
  const response = await api.get("/savings-studio/entries-export", {
    params: scope === "all" ? { scope: "all" } : { month },
    responseType: "blob",
  });
  const safeMonth = /^\d{4}-\d{2}$/.test(String(month || "")) ? month : new Date().toISOString().slice(0, 7);
  const fallbackName =
    scope === "all" ? "stilloak-savings-studio-entries-all.csv" : `stilloak-savings-studio-entries-${safeMonth}.csv`;

  triggerBlobDownload({
    blobPart: response.data,
    contentType: response.headers["content-type"] || "text/csv",
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
  getActivity,
  createEntry,
  previewEntriesImport,
  importEntries,
  updateEntry,
  updateBudgets,
  deleteEntry,
  sendSummaryEmail,
  downloadSummaryFile,
  downloadEntriesCsv,
  downloadBackup,
};
