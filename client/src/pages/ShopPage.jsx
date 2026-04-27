import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import SectionTitle from "../components/SectionTitle";
import productService from "../services/productService";

const defaultFilters = {
  search: "",
  category: "all",
  sort: "latest",
  page: 1,
  limit: 9,
};

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (_error) {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await productService.listProducts(filters);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko užkrauti katalogo.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const handleDraftChange = (field, value) => {
    setDraftFilters((currentFilters) => ({ ...currentFilters, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...draftFilters,
      page: 1,
    }));
  };

  const handleReset = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const handlePageChange = (page) => {
    setFilters((currentFilters) => ({ ...currentFilters, page }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="collection"
        title="A considered edit, presented with more room to breathe"
        subtitle="Naršyk atrinktą kolekciją, filtruok pagal nuotaiką ar kategoriją ir išsirink objektus, kurie jaučiasi verti vietos tavo namuose."
      />

      <div className="public-section grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="premium-tag">Seasonal selection</span>
          <h3 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            The collection now feels more editorial than template-like.
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Vietoje bendro demo katalogo akcentuojame ramesnę naršymo patirtį: švarius kortelių santykius,
            mažiau triukšmo ir aiškesnį dėmesį pačiam objektui.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Curated categories",
            "Secure checkout",
            "Receipt archive",
            "Member-only pricing",
          ].map((item) => (
            <div key={item} className="marketing-mini-card flex items-center justify-between">
              <span className="font-medium">{item}</span>
              <span className="accent-text text-sm">•</span>
            </div>
          ))}
        </div>
      </div>

      <ProductFilters
        filters={draftFilters}
        categories={categories}
        onChange={handleDraftChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Pieces found: <span className="font-semibold text-current">{pagination.total}</span>
        </p>
        <p className="text-sm text-muted">
          Page {pagination.page} of {pagination.pages}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="panel p-6 text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No pieces matched this edit"
          description="Pabandyk kitą paieškos frazę arba nuimk dalį filtrų."
          actionLabel="Show everything"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition ${
                  page === pagination.page ? "text-white" : ""
                }`}
                style={
                  page === pagination.page
                    ? {
                        background:
                          "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
                      }
                    : { backgroundColor: "rgb(var(--surface-soft) / 0.6)" }
                }
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopPage;
