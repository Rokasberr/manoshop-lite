const Product = require("../models/Product");

const parseImages = (images) => {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string") {
    return images
      .split(/[\n,]/)
      .map((image) => image.trim())
      .filter(Boolean);
  }

  return [];
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
    products,
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

  res.json(product);
};

const getProductCategories = async (_req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories.filter(Boolean).sort());
};

const createProduct = async (req, res) => {
  const { name, description, price, category, stock, featured, images, productType, digitalAsset } =
    req.body;

  if (!name || !description || !price || !category) {
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
    name,
    description,
    price: Number(price),
    category,
    productType: normalizedProductType,
    stock: Number(stock) || 0,
    featured: Boolean(featured),
    images: parseImages(images),
    digitalAsset: normalizedProductType === "digital" ? normalizedDigitalAsset : undefined,
  });

  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Produktas nerastas.");
  }

  const { name, description, price, category, stock, featured, images, productType, digitalAsset } =
    req.body;
  const normalizedProductType = normalizeProductType(productType ?? product.productType);
  const normalizedDigitalAsset = parseDigitalAsset(
    digitalAsset !== undefined ? digitalAsset : product.digitalAsset
  );

  if (normalizedProductType === "digital" && !normalizedDigitalAsset.storagePath) {
    res.status(400);
    throw new Error("Skaitmeniniam produktui būtina nurodyti failo kelią.");
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price !== undefined ? Number(price) : product.price;
  product.category = category ?? product.category;
  product.productType = normalizedProductType;
  product.stock = stock !== undefined ? Number(stock) : product.stock;
  product.featured = featured !== undefined ? Boolean(featured) : product.featured;
  product.images = images !== undefined ? parseImages(images) : product.images;
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
  res.json(updatedProduct);
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
