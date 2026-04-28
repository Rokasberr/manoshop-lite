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

export const getProductDisplayImages = (product) => {
  if (!product) {
    return [];
  }

  const mappedImages = PRODUCT_VISUAL_MAP[product.name];

  if (mappedImages?.length) {
    return mappedImages;
  }

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  if (!images.length) {
    return [];
  }

  if (images.every(isSeedUnsplashImage) && product.productType === "digital") {
    return ["/stilloak/collection/digital-bundle.svg"];
  }

  return images;
};

export const getPrimaryProductImage = (product) => getProductDisplayImages(product)[0] || "";
