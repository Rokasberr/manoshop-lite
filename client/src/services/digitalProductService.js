import api from "./api";

const getPurchases = async () => {
  const { data } = await api.get("/digital-products/purchases");
  return data;
};

const createCheckoutSession = async (productId, options = {}) => {
  const { data } = await api.post(
    "/digital-products/checkout",
    {
      productId,
      acceptedDigitalContentImmediateAccess: options.acceptedDigitalContentImmediateAccess === true,
    },
    {
      headers: options.attemptKey ? { "Idempotency-Key": options.attemptKey } : {},
    }
  );
  return data;
};

const downloadProductFile = async (productId, format, fileName = "download") => {
  const response = await api.get(`/digital-products/${productId}/download/${format}`, {
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
  createCheckoutSession,
  downloadProductFile,
  getPurchases,
};
