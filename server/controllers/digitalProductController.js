const fs = require("fs");

const { getDigitalProductById } = require("../config/digitalProducts");
const {
  createDigitalProductCheckoutSession,
  getPurchasedProductIds,
  hasPurchasedProduct,
  resolveDigitalProductFilePath,
} = require("../services/digitalProductPurchaseService");

const getDigitalProductPurchases = async (req, res) => {
  const purchasedProductIds = await getPurchasedProductIds(req.user._id);

  res.json({
    purchasedProductIds,
  });
};

const createDigitalProductCheckout = async (req, res) => {
  const { productId = "" } = req.body || {};
  const checkout = await createDigitalProductCheckoutSession({
    user: req.user,
    productId,
    origin: req.headers.origin,
    idempotencyKey: req.headers["idempotency-key"],
  });

  if (checkout.alreadyPurchased) {
    return res.json({
      alreadyPurchased: true,
      productId: checkout.product.id,
    });
  }

  return res.status(201).json({
    sessionId: checkout.session.id,
    url: checkout.session.url,
    productId: checkout.product.id,
  });
};

const downloadDigitalProductFile = async (req, res) => {
  const { productId = "", format = "" } = req.params;
  const product = getDigitalProductById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Produktas nerastas.");
  }

  const hasAccess = await hasPurchasedProduct(req.user._id, product.id);

  if (!hasAccess) {
    res.status(403);
    throw new Error("Šis failas prieinamas tik įsigijus produktą.");
  }

  const file = resolveDigitalProductFilePath(product, format);

  if (!file || !fs.existsSync(file.filePath)) {
    res.status(404);
    throw new Error("Failas netrukus bus pasiekiamas.");
  }

  return res.download(file.filePath, file.fileName);
};

module.exports = {
  createDigitalProductCheckout,
  downloadDigitalProductFile,
  getDigitalProductPurchases,
};
