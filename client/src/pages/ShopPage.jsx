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
  productType: "all",
  page: 1,
  limit: 9,
};

const ShopPage = ({ defaultProductType = "all" }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const initialFilters = {
    ...defaultFilters,
    productType: defaultProductType,
  };
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextFilters = {
      ...defaultFilters,
      productType: defaultProductType,
    };

    setDraftFilters(nextFilters);
    setFilters(nextFilters);
  }, [defaultProductType]);

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
    const resetFilters = {
      ...defaultFilters,
      productType: defaultProductType,
    };

    setDraftFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handlePageChange = (page) => {
    setFilters((currentFilters) => ({ ...currentFilters, page }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow={defaultProductType === "digital" ? "skaitmeninė kolekcija" : "kolekcija"}
        title={
          defaultProductType === "digital"
            ? "Skaitmeniniai produktai ramesnėms rutinoms ir jaukesnėms erdvėms"
            : "Atrinkta kolekcija ramesnėms, naudingesnėms erdvėms"
        }
        subtitle={
          defaultProductType === "digital"
            ? "Naršyk PDF gidus, spausdinamus rinkinius ir kitus skaitmeninius produktus, kurie atsiranda paskyroje iškart po apmokėjimo."
            : "Naršyk atrinktą kolekciją, filtruok pagal nuotaiką ar kategoriją ir išsirink objektus, kurie jaučiasi verti vietos tavo namuose."
        }
      />

      <div className="public-section grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="premium-tag">
            {defaultProductType === "digital" ? "Iškart po apmokėjimo" : "Sezono atranka"}
          </span>
          <h3 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            {defaultProductType === "digital"
              ? "Atrakink skaitmeninį turinį nelaukdamas siuntos."
              : "Rinkis mažiau objektų, bet su daugiau intencijos."}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {defaultProductType === "digital"
              ? "Čia rasi spausdinamus plakatus, PDF gidus ir planavimo įrankius, kurie atsiranda paskyroje po apmokėjimo."
              : "Naršyk atrinktus objektus, filtruok pagal kategoriją ir rinkis tai, kas verta vietos tavo namuose."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            defaultProductType === "digital"
              ? [
                  "Iškart pasiekiama prieiga",
                  "Saugus failų pateikimas",
                  "Sąskaitų archyvas",
                  "Rinkinių vertė",
                ]
              : [
                  "Atrinktos kategorijos",
                  "Saugus apmokėjimas",
                  "Sąskaitų archyvas",
                  "Nario kainodara",
                ]
          ).map((item) => (
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
          Rasta: <span className="font-semibold text-current">{pagination.total}</span>
        </p>
        <p className="text-sm text-muted">
          Puslapis {pagination.page} iš {pagination.pages}
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
          actionLabel="Rodyti viską"
          onAction={handleReset}
        />
      ) : (
        <>
          {filters.productType === "digital" && (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              Rodomi tik skaitmeniniai produktai: PDF gidai, spausdinami rinkiniai ir iškart pasiekiamos kolekcijos.
            </div>
          )}

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
