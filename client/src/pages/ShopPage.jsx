import { Clock, FileText, PackageCheck, ShieldCheck } from "lucide-react";
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

const catalogSignals = [
  {
    title: "Skaitmeniniai resursai",
    text: "PDF gidai, planuokliai ir rinkiniai, pasiekiami po įsigijimo, jei taikoma.",
    icon: FileText,
  },
  {
    title: "Fiziniai produktai",
    text: "Atrinkti objektai namams, darbui ir kasdieniam ritmui su aiškiu pristatymu.",
    icon: PackageCheck,
  },
  {
    title: "Netrukus",
    text: "Nauji produktai ir ribotos kolekcijos bus aiškiai pažymėti, kai bus paruošti pardavimui.",
    icon: Clock,
  },
];

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
        eyebrow={defaultProductType === "digital" ? "skaitmeniniai resursai" : "StillOak Studio katalogas"}
        title={
          defaultProductType === "digital"
            ? "Skaitmeniniai produktai ramesniam planavimui ir namų ritmui"
            : "Atrinkti produktai ramesnei erdvei ir aiškesniam kasdieniam ritmui"
        }
        subtitle={
          defaultProductType === "digital"
            ? "Naršyk PDF gidus, planuoklius ir skaitmeninius rinkinius. Prieiga pateikiama po įsigijimo, jei taikoma."
            : "Čia matysi fizinius produktus, skaitmeninius resursus ir aiškiai pažymėtas būsimas kolekcijas, kai jos bus paruoštos."
        }
      />

      <div className="public-section grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <span className="premium-tag">
            {defaultProductType === "digital" ? "Skaitmeninė kolekcija" : "Atrinkta parduotuvė"}
          </span>
          <h3 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            {defaultProductType === "digital"
              ? "Skaitmeniniai resursai, kurie aiškiai paaiškina, ką gauni."
              : "Mažiau demo jausmo, daugiau aiškaus produkto ir pasitikėjimo."}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {defaultProductType === "digital"
              ? "Kiekvienas skaitmeninis produktas turi aiškią paskirtį, vertę ir pristatymo lūkestį po pirkimo."
              : "Katalogas atskiria skaitmeninius resursus, fizinius produktus ir būsimas kryptis, kad pirkėjas suprastų, ką renkasi."}
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-lg border px-4 py-4 text-sm leading-6 text-muted" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
            <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <span>Saugus apmokėjimas · Aiškus pristatymas · Skaitmeniniai resursai pasiekiami po įsigijimo, jei taikoma</span>
          </div>
        </div>

        <div className="grid gap-3">
          {catalogSignals.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="marketing-mini-card">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgb(var(--surface-soft))", color: "rgb(var(--accent-strong))" }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProductFilters
        filters={draftFilters}
        categories={categories}
        onChange={handleDraftChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          title="Kolekcija ruošiama. Netrukus čia matysite atrinktus StillOak Studio produktus."
          description="Jei naudojai filtrus, pabandyk juos išvalyti. Kai nauji produktai bus paruošti pardavimui, jie bus aiškiai pažymėti kataloge."
          actionLabel="Rodyti viską"
          onAction={handleReset}
        />
      ) : (
        <>
          {filters.productType === "digital" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
              Rodomi skaitmeniniai produktai: PDF gidai, planuokliai ir rinkiniai. Prieiga pateikiama po įsigijimo, jei taikoma.
            </div>
          )}

          {filters.productType === "physical" && (
            <div className="rounded-lg border px-5 py-4 text-sm leading-6 text-muted" style={{ borderColor: "rgb(var(--line) / 0.82)", backgroundColor: "rgb(var(--surface-soft) / 0.58)" }}>
              Rodomi fiziniai produktai. Pristatymo ir užsakymo informacija pateikiama aiškiai pirkimo eigoje ir po užsakymo.
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
                className={`h-11 min-w-11 rounded-lg px-4 text-sm font-semibold transition ${
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
