import api from "./api";

const getOperations = async () => (await api.get("/admin/operations")).data;
const runBackup = async () => (await api.post("/admin/operations/backup")).data;
const resolveEvent = async (eventId) => (await api.patch(`/admin/operations/${eventId}/resolve`)).data;

export default { getOperations, resolveEvent, runBackup };
