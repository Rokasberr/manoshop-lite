import api from "./api";

const notifyInterest = async ({ email, focus }) => {
  const { data } = await api.post("/launch-soon/notify", {
    email,
    focus,
  });

  return data;
};

export default {
  notifyInterest,
};
