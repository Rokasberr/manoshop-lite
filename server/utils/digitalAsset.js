const path = require("path");

const DIGITAL_DOWNLOADS_DIR = path.join(__dirname, "..", "digital-downloads");

const MIME_TYPES_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const resolveDigitalAssetPath = (storagePath = "") => {
  const normalizedPath = String(storagePath).replace(/^[/\\]+/, "").trim();

  if (!normalizedPath) {
    const error = new Error("Skaitmeninio failo kelias nenurodytas.");
    error.statusCode = 400;
    throw error;
  }

  const resolvedPath = path.resolve(DIGITAL_DOWNLOADS_DIR, normalizedPath);
  const relativePath = path.relative(DIGITAL_DOWNLOADS_DIR, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    const error = new Error("Netinkamas skaitmeninio failo kelias.");
    error.statusCode = 400;
    throw error;
  }

  return resolvedPath;
};

const resolveDigitalAssetMimeType = (asset = {}) => {
  if (asset.mimeType?.trim()) {
    return asset.mimeType.trim();
  }

  const sourceName = asset.fileName || asset.storagePath || "";
  const extension = path.extname(sourceName).toLowerCase();

  return MIME_TYPES_BY_EXTENSION[extension] || "application/octet-stream";
};

module.exports = {
  DIGITAL_DOWNLOADS_DIR,
  resolveDigitalAssetPath,
  resolveDigitalAssetMimeType,
};
