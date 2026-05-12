const Product = require("../models/Product");
const { isAdminUser } = require("../utils/userRole");

const normalizeUploadImagePath = (image) => {
  const normalizedImage = String(image || "").trim().replace(/\\/g, "/");

  if (!normalizedImage) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(normalizedImage) || /^(data|blob):/i.test(normalizedImage)) {
    return normalizedImage;
  }

  const lowerImage = normalizedImage.toLowerCase();

  if (lowerImage.startsWith("/uploads/")) {
    return normalizedImage;
  }

  if (lowerImage.startsWith("uploads/")) {
    return `/${normalizedImage}`;
  }

  const uploadsIndex = lowerImage.lastIndexOf("/uploads/");

  if (uploadsIndex >= 0) {
    return normalizedImage.slice(uploadsIndex);
  }

  return normalizedImage;
};

const parseImages = (images) => {
  if (Array.isArray(images)) {
    return images.map(normalizeUploadImagePath).filter(Boolean);
  }

  if (typeof images === "string") {
    return images
      .split(/[\n,]/)
      .map(normalizeUploadImagePath)
      .filter(Boolean);
  }

  return [];
};

const serializeProduct = (product) => {
  const productObject = product?.toObject ? product.toObject() : product;

  return {
    ...productObject,
    images: parseImages(productObject?.images || []),
    title: productObject?.title || productObject?.name || "",
    previewImage:
      productObject?.previewImage ||
      parseImages(productObject?.images || [])[0] ||
      "",
    type: productObject?.type || productObject?.productType || "physical",
    currency: productObject?.currency || "eur",
    allowedForResale: Boolean(productObject?.allowedForResale),
    commissionRate: Number(productObject?.commissionRate || 0),
    isActive: productObject?.isActive !== false,
  };
};

const normalizeProductType = (productType) =>
  productType === "digital" ? "digital" : "physical";

const parseDigitalAsset = (digitalAsset) => {
  if (!digitalAsset || typeof digitalAsset !== "object") {
    return {
      storagePath: "",
      fileName: "",
      downloadLabel: "",
      mimeType: "application/pdf",
    };
  }

  return {
    storagePath: digitalAsset.storagePath?.trim() || "",
    fileName: digitalAsset.fileName?.trim() || "",
    downloadLabel: digitalAsset.downloadLabel?.trim() || "",
    mimeType: digitalAsset.mimeType?.trim() || "application/pdf",
  };
};

const getProducts = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 9, 48);
  const search = req.query.search?.trim();
  const category = req.query.category?.trim();
  const productType = req.query.productType?.trim();
  const featured = req.query.featured;
  const sort = req.query.sort || "latest";

  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category.toLowerCase() !== "all") {
    filters.category = category;
  }

  if (productType === "physical" || productType === "digital") {
    filters.productType = productType;
  }

  if (featured === "true") {
    filters.featured = true;
  }

  if (!isAdminUser(req.user)) {
    filters.isActive = { $ne: false };
  }

  const sortMap = {
    latest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    name: { name: 1 },
  };

  const total = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .sort(sortMap[sort] || sortMap.latest)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products: products.map(serializeProduct),
    pagination: {
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
      limit,
    },
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produktas nerastas.");
  }

  res.json(serializeProduct(product));
};

const getProductCategories = async (_req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories.filter(Boolean).sort());
};

const createProduct = async (req, res) => {
  const {
    name,
    title,
    description,
    price,
    currency,
    category,
    stock,
    featured,
    images,
    previewImage,
    productType,
    type,
    digitalAsset,
    allowedForResale,
    commissionRate,
    fileUrl,
    isActive,
  } =
    req.body;

  const productName = name || title;

  if (!productName || !description || !price || !category) {
    res.status(400);
    throw new Error("Pavadinimas, aprašymas, kaina ir kategorija yra privalomi.");
  }

  const normalizedProductType = normalizeProductType(productType);
  const normalizedDigitalAsset = parseDigitalAsset(digitalAsset);

  if (normalizedProductType === "digital" && !normalizedDigitalAsset.storagePath) {
    res.status(400);
    throw new Error("Skaitmeniniam produktui būtina nurodyti failo kelią.");
  }

  const product = await Product.create({
    name: productName,
    title: title || productName,
    description,
    price: Number(price),
    currency: currency || "eur",
    category,
    productType: normalizedProductType,
    type: type || normalizedProductType,
    stock: Number(stock) || 0,
    featured: Boolean(featured),
    images: parseImages(images),
    previewImage: normalizeUploadImagePath(previewImage),
    digitalAsset: normalizedProductType === "digital" ? normalizedDigitalAsset : undefined,
    allowedForResale: Boolean(allowedForResale),
    commissionRate: Math.min(Math.max(Number(commissionRate) || 0, 0), 100),
    fileUrl: fileUrl?.trim() || normalizedDigitalAsset.storagePath || "",
    isActive: isActive !== false,
  });

  res.status(201).json(serializeProduct(product));
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produktas nerastas.");
  }

  const {
    name,
    title,
    description,
    price,
    currency,
    category,
    stock,
    featured,
    images,
    previewImage,
    productType,
    type,
    digitalAsset,
    allowedForResale,
    commissionRate,
    fileUrl,
    isActive,
  } =
    req.body;
  const normalizedProductType = normalizeProductType(productType ?? product.productType);
  const normalizedDigitalAsset = parseDigitalAsset(
    digitalAsset !== undefined ? digitalAsset : product.digitalAsset
  );

  if (normalizedProductType === "digital" && !normalizedDigitalAsset.storagePath) {
    res.status(400);
    throw new Error("Skaitmeniniam produktui būtina nurodyti failo kelią.");
  }

  product.name = name ?? title ?? product.name;
  product.title = title ?? product.title ?? product.name;
  product.description = description ?? product.description;
  product.price = price !== undefined ? Number(price) : product.price;
  product.currency = currency ?? product.currency ?? "eur";
  product.category = category ?? product.category;
  product.productType = normalizedProductType;
  product.type = type ?? product.type ?? normalizedProductType;
  product.stock = stock !== undefined ? Number(stock) : product.stock;
  product.featured = featured !== undefined ? Boolean(featured) : product.featured;
  product.images = images !== undefined ? parseImages(images) : product.images;
  product.previewImage =
    previewImage !== undefined ? normalizeUploadImagePath(previewImage) : product.previewImage;
  product.allowedForResale =
    allowedForResale !== undefined ? Boolean(allowedForResale) : product.allowedForResale;
  product.commissionRate =
    commissionRate !== undefined
      ? Math.min(Math.max(Number(commissionRate) || 0, 0), 100)
      : product.commissionRate;
  product.fileUrl =
    fileUrl !== undefined ? fileUrl?.trim() || normalizedDigitalAsset.storagePath || "" : product.fileUrl;
  product.isActive = isActive !== undefined ? Boolean(isActive) : product.isActive;
  product.digitalAsset =
    normalizedProductType === "digital"
      ? normalizedDigitalAsset
      : {
          storagePath: "",
          fileName: "",
          downloadLabel: "",
          mimeType: "application/pdf",
        };

  const updatedProduct = await product.save();
  res.json(serializeProduct(updatedProduct));
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produktas nerastas.");
  }

  await product.deleteOne();
  res.json({ message: "Produktas ištrintas." });
};

module.exports = {
  getProducts,
  getProductById,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
