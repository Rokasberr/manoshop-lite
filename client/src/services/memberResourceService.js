import api from "./api";

const extractFilename = (contentDisposition = "", fallbackName = "member-resource") => {
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return plainMatch?.[1] || fallbackName;
};

const downloadMemberResource = async (resourceId, format, fallbackName = "member-resource") => {
  const response = await api.get(`/member-resources/${resourceId}/download/${format}`, {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = extractFilename(response.headers["content-disposition"], fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export default {
  downloadMemberResource,
};
