const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getProducts,
  getProductById,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/categories/list", asyncHandler(getProductCategories));

router
  .route("/")
  .get(asyncHandler(getProducts))
  .post(protect, adminOnly, asyncHandler(createProduct));

router
  .route("/:id")
  .get(asyncHandler(getProductById))
  .put(protect, adminOnly, asyncHandler(updateProduct))
  .delete(protect, adminOnly, asyncHandler(deleteProduct));

module.exports = router;

