const fs = require("fs");

const { digitalProducts, getDigitalProductById } = require("../config/digitalProducts");
const { resolveDigitalProductFilePath } = require("../services/digitalProductPurchaseService");

const getFileState = (product, format) => {
  const file = resolveDigitalProductFilePath(product, format);

  return {
    file,
    exists: Boolean(file && fs.existsSync(file.filePath)),
  };
};

const listAdminDigitalProducts = async (_req, res) => {
  const products = digitalProducts.map((product) => {
    const pdf = getFileState(product, "pdf");
    const excel = getFileState(product, "excel");

    return {
      productId: product.id,
      title: product.title,
      category: product.category,
      priceLabel: product.priceLabel,
      version: product.version || "1.0",
      lastUpdated: product.lastUpdated || "2026",
      isActive: product.isActive !== false,
      hasPdf: pdf.exists,
      hasExcel: excel.exists,
      pdfFileName: product.pdfFileName,
      excelFileName: product.excelFileName,
    };
  });

  res.json({ products });
};

const resolveAdminDigitalProductFile = (productId, format) => {
  const product = getDigitalProductById(productId);

  if (!product) {
    const error = new Error("Produktas nerastas.");
    error.statusCode = 404;
    throw error;
  }

  const file = resolveDigitalProductFilePath(product, format);

  if (!file || !fs.existsSync(file.filePath)) {
    const error = new Error("Failas nerastas.");
    error.statusCode = 404;
    throw error;
  }

  return file;
};

const previewAdminDigitalProductPdf = async (req, res) => {
  const file = resolveAdminDigitalProductFile(req.params.productId, "pdf");

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
  res.sendFile(file.filePath);
};

const downloadAdminDigitalProductFile = async (req, res) => {
  const format = req.params.format === "excel" ? "excel" : req.params.format === "pdf" ? "pdf" : "";

  if (!format) {
    res.status(404);
    throw new Error("Failas nerastas.");
  }

  const file = resolveAdminDigitalProductFile(req.params.productId, format);

  res.setHeader("Cache-Control", "private, no-store");
  res.download(file.filePath, file.fileName);
};

module.exports = {
  downloadAdminDigitalProductFile,
  listAdminDigitalProducts,
  previewAdminDigitalProductPdf,
};
