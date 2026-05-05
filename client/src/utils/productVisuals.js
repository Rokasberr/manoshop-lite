const PRODUCT_VISUAL_MAP = {
  "Aurora Desk Lamp": ["/stilloak/collection/budget-clarity.svg"],
  "Studio Headphones X2": ["/stilloak/collection/ai-summaries.svg"],
  "Atlas Carry Backpack": ["/stilloak/collection/recurring-flow.svg"],
  "Linen Relax Set": ["/stilloak/collection/private-archive.svg"],
  "Stoneware Brew Kit": ["/stilloak/collection/goal-pace.svg"],
  "Motion Sneakers": ["/stilloak/collection/monthly-rhythm.svg"],
  "Calm Home Poster Bundle": ["/stilloak/collection/digital-bundle.svg"],
  "The Atelier Living Room Guide": ["/stilloak/collection/ai-summaries.svg"],
  "Sunday Reset Ritual Planner": ["/stilloak/collection/monthly-rhythm.svg"],
  "Home Edit Bundle": ["/stilloak/collection/digital-bundle.svg"],
  "Calm Living Bundle": ["/stilloak/collection/private-archive.svg"],
};

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
    return ["/stilloak/collection/digital-bundle.svg"];
  }

  return images;
};

export const getPrimaryProductImage = (product) => getProductDisplayImages(product)[0] || "";
