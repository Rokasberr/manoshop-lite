import api from "./api";

const listProducts = async () => {
  const { data } = await api.get("/admin/digital-products");
  return data.products || [];
};

const createPdfPreviewUrl = async (productId) => {
  const response = await api.get(`/admin/digital-products/${productId}/preview/pdf`, {
    responseType: "blob",
  });

  return window.URL.createObjectURL(
    new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    })
  );
};

const downloadFile = async (productId, format, fileName = "download") => {
  const response = await api.get(`/admin/digital-products/${productId}/download/${format}`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default {
  createPdfPreviewUrl,
  downloadFile,
  listProducts,
};
