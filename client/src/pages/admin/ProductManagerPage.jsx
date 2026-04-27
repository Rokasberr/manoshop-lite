import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminPageHeader from "../../components/admin-dashboard/AdminPageHeader";
import ProductForm from "../../components/admin/ProductForm";
import productService from "../../services/productService";
import { formatCurrency } from "../../utils/currency";

const ProductManagerPage = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.listProducts({ page: 1, limit: 100, sort: "latest" });
      setProducts(data.products);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Nepavyko užkrauti produktų.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (payload) => {
    try {
      setSaving(true);

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        toast.success("Produktas atnaujintas.");
      } else {
        await productService.createProduct(payload);
        toast.success("Produktas sukurtas.");
      }

      setEditingProduct(null);
      await loadProducts();
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko išsaugoti produkto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Ar tikrai nori ištrinti šį produktą?")) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      toast.success("Produktas ištrintas.");
      await loadProducts();
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || "Nepavyko ištrinti produkto.");
    }
  };

  return (
    <div className="space-y-8 font-admin">
      <AdminPageHeader
        eyebrow="Catalog control"
        title="Manage the product catalog with reusable CRUD tools"
        description="Create, update, and remove products while keeping featured placements and inventory details in sync."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ProductForm
          initialProduct={editingProduct}
          onSubmit={handleSave}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={saving}
        />

        <div className="dashboard-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="dashboard-eyebrow">Catalog list</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">All products</h2>
            </div>
            <p className="text-sm text-slate-500">Total: {products.length}</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="mt-6 text-red-500">{error}</div>
          ) : !products.length ? (
            <div className="mt-6">
              <EmptyState
                title="Produktų dar nėra"
                description="Sukurk pirmą produktą naudodamas formą kairėje."
                actionLabel="Perkrauti"
                actionTo="/admin/products"
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex sm:flex-row sm:gap-4"
                >
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-28 w-full rounded-[20px] object-cover sm:w-28"
                  />

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {product.category} • stock {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{formatCurrency(product.price)}</p>
                        {product.featured && (
                          <span
                            className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700"
                          >
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="button-secondary gap-2"
                      >
                        <Pencil size={16} />
                        Redaguoti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-500 transition hover:-translate-y-0.5 dark:border-red-900/40 dark:text-red-300"
                      >
                        <Trash2 size={16} />
                        Ištrinti
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagerPage;
