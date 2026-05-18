const digitalProducts = [
  {
    id: "personal-budget-system",
    slug: "stilloak-personal-budget-system",
    title: "StillOak Personal Budget System",
    category: "Finansai",
    priceCents: 1900,
    priceLabel: "€19",
    currency: "eur",
    version: "V10",
    lastUpdated: "2026",
    productType: "digital_download",
    isPaid: true,
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: null,
    excelFileName: "StillOak_Personal_Budget_System.xlsx",
  },
  {
    id: "12-month-savings-tracker",
    slug: "stilloak-savings-tracker",
    title: "StillOak Savings Tracker",
    category: "Finansai",
    priceCents: 1500,
    priceLabel: "€15",
    currency: "eur",
    version: "V15",
    lastUpdated: "2026",
    productType: "digital_download",
    isPaid: true,
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: null,
    excelFileName: "StillOak_Savings_Tracker.xlsx",
  },
  {
    id: "weekly-planning-system",
    slug: "stilloak-weekly-planning-system",
    title: "StillOak Weekly Planning System",
    category: "Planavimas",
    priceCents: 1200,
    priceLabel: "€12",
    currency: "eur",
    version: "V15",
    lastUpdated: "2026",
    productType: "digital_download",
    isPaid: true,
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: null,
    excelFileName: "StillOak_Weekly_Planning_System.xlsx",
  },
];

const digitalProductMap = new Map(digitalProducts.map((product) => [product.id, product]));

const getDigitalProductById = (productId = "") => digitalProductMap.get(String(productId || "").trim()) || null;

module.exports = {
  digitalProducts,
  getDigitalProductById,
};
