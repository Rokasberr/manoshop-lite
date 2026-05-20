import { Eye, EyeOff, Save, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import businessService from "../services/businessService";
import { formatCurrency } from "../utils/currency";
import { getPrimaryProductImage } from "../utils/productVisuals";

const emptyForm = {
  name: "",
  slug: "",
  headline: "",
  description: "",
  theme: "oak",
  selectedProducts: [],
  isPublished: false,
};

const themes = [
  { id: "oak", label: "Oak", swatch: "bg-emerald-800" },
  { id: "sage", label: "Sage", swatch: "bg-green-400" },
  { id: "linen", label: "Linen", swatch: "bg-stone-200" },
  { id: "charcoal", label: "Charcoal", swatch: "bg-slate-900" },
];

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const SiteBuilderPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBuilder = async () => {
      try {
        setLoading(true);
        const [store, resaleProducts] = await Promise.all([
          businessService.getMyStore(),
          businessService.getResaleProducts(),
        ]);

        if (store) {
          setForm({
            name: store.name || "",
            slug: store.slug || "",
            headline: store.headline || "",
            description: store.description || "",
            theme: store.theme || "oak",
            selectedProducts: (store.selectedProducts || []).map((product) => product._id || product),
            isPublished: Boolean(store.isPublished),
          });
        }

        setProducts(resaleProducts);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko uzkrauti Site Builder.");
      } finally {
        setLoading(false);
      }
    };

    loadBuilder();
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((product) => form.selectedProducts.includes(product._id)),
    [form.selectedProducts, products]
  );

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !current.slug ? { slug: toSlug(value) } : {}),
    }));
  };

  const toggleProduct = (productId) => {
    setForm((current) => ({
      ...current,
      selectedProducts: current.selectedProducts.includes(productId)
        ? current.selectedProducts.filter((id) => id !== productId)
        : [...current.selectedProducts, productId],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const savedStore = await businessService.saveMyStore({
        ...form,
        slug: toSlug(form.slug),
      });

      setForm({
        name: savedStore.name || "",
        slug: savedStore.slug || "",
        headline: savedStore.headline || "",
        description: savedStore.description || "",
        theme: savedStore.theme || "oak",
        selectedProducts: (savedStore.selectedProducts || []).map((product) => product._id || product),
        isPublished: Boolean(savedStore.isPublished),
      });
      toast.success("Svetaines nustatymai issaugoti.");
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Nepavyko issaugoti svetaines.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Krauname Site Builder..." />;
  }

  if (error) {
    return <EmptyState title="Site Builder neatsidare" description={error} actionLabel="Grizti" actionTo="/business" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_0.75fr]">
      <section className="panel p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="signal-pill">Site Builder MVP</span>
            <h1 className="mt-4 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
              Sukurk savo skaitmeniniu produktu svetaine
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Slug turi buti unikalus, o produktu sarase rodomi tik tie produktai, kuriuos Stilloak leidzia perparduoti.
            </p>
          </div>
          {form.slug && (
            <Link to={`/stores/${form.slug}`} className="button-secondary shrink-0 gap-2">
              <Store size={16} />
              Perziureti
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Svetaines pavadinimas</span>
              <input className="input-field" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Pvz., Calm Digital Studio" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Slug</span>
              <input className="input-field" value={form.slug} onChange={(event) => updateField("slug", toSlug(event.target.value))} placeholder="calm-digital-studio" />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Headline</span>
            <input className="input-field" value={form.headline} onChange={(event) => updateField("headline", event.target.value)} placeholder="Skaitmeniniai resursai ramesniam darbui ir aiskesniems sprendimams" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Aprasymas</span>
            <textarea className="input-field min-h-32" value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Trumpai paaiskink, kam skirta tavo svetaine ir kokia verte klientas gauna." />
          </label>

          <div className="space-y-3">
            <span className="text-sm font-semibold">Spalvu tema</span>
            <div className="grid gap-2 sm:grid-cols-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateField("theme", theme.id)}
                  className={`rounded-lg border p-3 text-left text-sm font-semibold transition ${form.theme === theme.id ? "border-[rgb(var(--accent-strong))] bg-[rgb(var(--surface-soft))]" : "border-[rgb(var(--line)/0.8)]"}`}
                >
                  <span className={`mb-3 block h-7 rounded ${theme.swatch}`} />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-sm font-semibold">Skaitmeniniai produktai</span>
                <p className="mt-1 text-xs leading-5 text-muted">Pasirinkti galima tik `allowedForResale` produktus.</p>
              </div>
              <span className="signal-pill w-fit">Pasirinkta: {form.selectedProducts.length}</span>
            </div>

            {!products.length ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                Perpardavimui leidziamu produktu kataloge kol kas nera.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {products.map((product) => {
                  const selected = form.selectedProducts.includes(product._id);

                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => toggleProduct(product._id)}
                      className={`flex min-w-0 gap-4 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${selected ? "bg-[rgb(var(--surface-soft))]" : "bg-[rgb(var(--surface))]"}`}
                      style={{ borderColor: selected ? "rgb(var(--accent-strong) / 0.5)" : "rgb(var(--line) / 0.82)" }}
                    >
                      <img src={getPrimaryProductImage(product) || "/digital-products/previews/personal-budget-system-preview.png"} alt={product.title || product.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-semibold">{product.title || product.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted">{formatCurrency(product.price)} · commission {product.commissionRate || 0}%</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "rgb(var(--line) / 0.72)" }}>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => updateField("isPublished", event.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
              {form.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
              Publikuoti svetaine
            </label>
            <button type="button" onClick={handleSave} disabled={saving} className="button-primary justify-center gap-2 disabled:opacity-60">
              <Save size={16} />
              {saving ? "Issaugoma..." : "Issaugoti"}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="surface-dark rounded-lg p-5 sm:p-7">
          <span className="hero-chip">Gyva perziura</span>
          <h2 className="mt-5 break-words font-display text-3xl font-bold leading-tight text-white">
            {form.name || "Tavo store pavadinimas"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/72">{form.headline || "Trumpas pazadas klientui atsiras cia."}</p>
          <p className="mt-4 text-sm leading-7 text-white/58">{form.description || "Aprasymas pades klientui suprasti, kam skirti produktai ir kodel verta pirkti."}</p>
          <div className="mt-6 grid gap-3">
            {selectedProducts.length ? (
              selectedProducts.slice(0, 3).map((product) => (
                <div key={product._id} className="rounded-lg border border-white/10 bg-white/6 p-4">
                  <p className="font-semibold text-white">{product.title || product.name}</p>
                  <p className="mt-1 text-sm text-white/58">{formatCurrency(product.price)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/6 p-4 text-sm text-white/62">
                Pasirink produktus, kad jie atsirastu tavo store.
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
};

export default SiteBuilderPage;
