const PRODUCT_VISUAL_MAP = {};
const DIGITAL_PRODUCT_FALLBACK_IMAGE = "/digital-products/previews/personal-budget-system-preview.png";

const isSeedUnsplashImage = (value) =>
  typeof value === "string" && value.includes("images.unsplash.com");

const getApiAssetOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  try {
    return new URL(apiUrl, window.location.origin).origin;
  } catch {
    return "";
  }
};

export const resolveProductImageSrc = (value) => {
  const image = String(value || "").trim().replace(/\\/g, "/");

  if (!image) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(image) || /^(data|blob):/i.test(image)) {
    return image;
  }

  const lowerImage = image.toLowerCase();
  const apiAssetOrigin = getApiAssetOrigin();

  if (lowerImage.startsWith("/uploads/")) {
    return apiAssetOrigin ? `${apiAssetOrigin}${image}` : image;
  }

  if (lowerImage.startsWith("uploads/")) {
    return apiAssetOrigin ? `${apiAssetOrigin}/${image}` : `/${image}`;
  }

  const uploadsIndex = lowerImage.lastIndexOf("/uploads/");

  if (uploadsIndex >= 0) {
    const uploadPath = image.slice(uploadsIndex);
    return apiAssetOrigin ? `${apiAssetOrigin}${uploadPath}` : uploadPath;
  }

  return image;
};

export const getProductDisplayImages = (product) => {
  if (!product) {
    return [];
  }

  const mappedImages = PRODUCT_VISUAL_MAP[product.name];
  const images = Array.isArray(product.images)
    ? product.images.map(resolveProductImageSrc).filter(Boolean)
    : [];

  if (images.length && !images.every(isSeedUnsplashImage)) {
    return images;
  }

  if (mappedImages?.length) {
    return mappedImages;
  }

  if (!images.length) {
    return [];
  }

  if (images.every(isSeedUnsplashImage) && product.productType === "digital") {
    return [DIGITAL_PRODUCT_FALLBACK_IMAGE];
  }

  return images;
};

export const getPrimaryProductImage = (product) => getProductDisplayImages(product)[0] || "";
