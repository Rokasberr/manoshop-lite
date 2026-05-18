const digitalProducts = [
  {
    id: "personal-budget-system",
    title: "Personal Budget System",
    category: "Finansai",
    priceCents: 900,
    priceLabel: "€9",
    currency: "eur",
    version: "V16",
    lastUpdated: "2026",
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: "personal-budget-system.pdf",
    excelFileName: "personal-budget-system.xlsx",
  },
  {
    id: "12-month-savings-tracker",
    title: "12-Month Savings Tracker",
    category: "Finansai",
    priceCents: 900,
    priceLabel: "€9",
    currency: "eur",
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: "savings-tracker.pdf",
    excelFileName: "savings-tracker.xlsx",
  },
  {
    id: "weekly-planning-system",
    title: "Weekly Planning System",
    category: "Planavimas",
    priceCents: 700,
    priceLabel: "€7",
    currency: "eur",
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: "weekly-planning-system.pdf",
    excelFileName: "weekly-planning-system.xlsx",
  },
  {
    id: "business-idea-validation-kit",
    title: "Business Idea Validation Kit",
    category: "Verslas",
    priceCents: 1900,
    priceLabel: "€19",
    currency: "eur",
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: "business-idea-validation-kit.pdf",
    excelFileName: "business-idea-validation-kit.xlsx",
  },
  {
    id: "social-media-content-calendar",
    title: "Social Media Content Calendar",
    category: "Marketingas",
    priceCents: 1200,
    priceLabel: "€12",
    currency: "eur",
    stripePriceEnvKey: null,
    stripePriceIdReference: "dynamic_one_time_checkout",
    pdfFileName: "social-media-content-calendar.pdf",
    excelFileName: "social-media-content-calendar.xlsx",
  },
];

const digitalProductMap = new Map(digitalProducts.map((product) => [product.id, product]));

const getDigitalProductById = (productId = "") => digitalProductMap.get(String(productId || "").trim()) || null;

module.exports = {
  digitalProducts,
  getDigitalProductById,
};
