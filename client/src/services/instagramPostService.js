import api from "./api";

const generatePost = async (payload) => {
  const { data } = await api.post("/admin/instagram-posts/generate", payload);
  return data;
};

const listRecent = async () => {
  const { data } = await api.get("/admin/instagram-posts/recent");
  return data.posts || [];
};

const createPreviewUrl = async (filename) => {
  const response = await api.get(`/admin/instagram-posts/download/${filename}`, {
    responseType: "blob",
  });

  return window.URL.createObjectURL(response.data);
};

const downloadPost = async (filename) => {
  const response = await api.get(`/admin/instagram-posts/download/${filename}`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default {
  createPreviewUrl,
  downloadPost,
  generatePost,
  listRecent,
};
