import api from "./api";

const sendTest = async (payload) => (await api.post("/admin/email-test", payload)).data;

export default { sendTest };
