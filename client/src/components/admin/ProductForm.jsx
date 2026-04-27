import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  featured: false,
  imagesText: "",
};

const mapProductToForm = (product) =>
  product
    ? {
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? "",
        category: product.category || "",
        stock: product.stock ?? "",
        featured: Boolean(product.featured),
        imagesText: Array.isArray(product.images) ? product.images.join("\n") : "",
      }
    : emptyForm;

const ProductForm = ({
  initialProduct,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(mapProductToForm(initialProduct));
    setError("");
  }, [initialProduct]);

  const handleChange = (field, value) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      Number(formData.price) <= 0
    ) {
      setError("Užpildyk pavadinimą, aprašymą, kategoriją ir teisingą kainą.");
      return;
    }

    setError("");

    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      stock: Number(formData.stock) || 0,
      featured: formData.featured,
      images: formData.imagesText,
    });
  };

  return (
    <form className="dashboard-panel font-admin space-y-5 p-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="dashboard-eyebrow">{initialProduct ? "Edit product" : "New product"}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {initialProduct ? "Update product details" : "Add a new product"}
          </h2>
        </div>

        {initialProduct && (
          <button type="button" onClick={onCancel} className="dashboard-button-secondary">
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Product name</label>
          <input
            className="input-field"
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Category</label>
          <input
            className="input-field"
            value={formData.category}
            onChange={(event) => handleChange("category", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Price</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) => handleChange("price", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Stock</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={(event) => handleChange("stock", event.target.value)}
          />
        </div>

        <label className="mt-8 flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(event) => handleChange("featured", event.target.checked)}
          />
          Feature this product
        </label>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Image URLs</label>
          <textarea
            className="textarea-field"
            placeholder="One image URL per line or comma-separated"
            value={formData.imagesText}
            onChange={(event) => handleChange("imagesText", event.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">Description</label>
          <textarea
            className="textarea-field"
            value={formData.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="dashboard-button-primary w-full justify-center">
        {isSubmitting ? "Saving..." : initialProduct ? "Update product" : "Create product"}
      </button>
    </form>
  );
};

export default ProductForm;
