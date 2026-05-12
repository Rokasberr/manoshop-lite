import { ArrowRight, LockKeyhole, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import businessService from "../services/businessService";
import { formatCurrency } from "../utils/currency";
import { getPrimaryProductImage } from "../utils/productVisuals";

const themeClasses = {
  oak: "from-emerald-950 via-stone-950 to-stone-900",
  sage: "from-emerald-900 via-green-950 to-stone-900",
  linen: "from-stone-200 via-stone-100 to-emerald-100",
  charcoal: "from-slate-950 via-stone-950 to-emerald-950",
};

const PublicStorePage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [store, setStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        setStore(await businessService.getPublicStore(slug));
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Store not available.");
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [slug]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Apmokejimas gautas. Patikrink el. pasta del atsisiuntimo.");
    }

    if (searchParams.get("checkout") === "cancel") {
      toast("Apmokejimas buvo atsauktas.");
    }
  }, [searchParams]);

  const handleCheckout = async (product) => {
    if (!buyerEmail.trim()) {
      setSelectedProduct(product);
      toast.error("Ivesk el. pasta pirkimui.");
      return;
    }

    try {
      setCheckoutLoadingId(product._id);
      const session = await businessService.createStoreCheckoutSession(store.slug, {
        productId: product._id,
        buyerEmail,
        buyerName,
      });
      window.location.assign(session.url);
    } catch (checkoutError) {
      toast.error(checkoutError.response?.data?.message || "Nepavyko paruošti saugaus checkout.");
    } finally {
      setCheckoutLoadingId("");
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Krauname store..." />;
  }

  if (error || !store) {
    return <EmptyState title="Store not available" description={error || "Sis store nera publikuotas."} actionLabel="Grizti i Stilloak" actionTo="/" />;
  }

  const products = store.selectedProducts || [];
  const theme = themeClasses[store.theme] || themeClasses.oak;

  return (
    <div className="space-y-8">
      <section className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${theme} p-6 text-white shadow-2xl shadow-black/20 sm:p-8 lg:p-10`}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(90deg, rgb(255 255 255 / 0.08) 1px, transparent 1px), linear-gradient(180deg, rgb(255 255 255 / 0.06) 1px, transparent 1px)", backgroundSize: "46px 46px" }} />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <span className="hero-chip">Digital store</span>
            <h1 className="mt-6 break-words font-display text-4xl font-bold leading-tight sm:text-6xl">{store.name}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">{store.headline}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">{store.description}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <LockKeyhole size={18} className="text-white/72" />
              <p className="text-sm font-semibold">Saugus Stripe checkout</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Kaina ir commission skaiciuojami backend puseje. Pardavejo ismokejimai MVP etape valdomi rankiniu budu.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
        <aside className="panel h-fit p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold">Pirkimo duomenys</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            El. pastas naudojamas checkout ir skaitmeninio produkto pristatymui po apmokejimo.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Vardas</span>
              <input className="input-field" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Tavo vardas" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">El. pastas</span>
              <input className="input-field" type="email" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="vardas@email.com" />
            </label>
          </div>
          {selectedProduct && (
            <p className="mt-4 rounded-lg border p-3 text-sm leading-6 text-muted" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
              Pasirinktas produktas: <span className="font-semibold text-[rgb(var(--text))]">{selectedProduct.title || selectedProduct.name}</span>
            </p>
          )}
        </aside>

        <div className="grid gap-4 md:grid-cols-2">
          {products.length ? (
            products.map((product) => {
              const image = getPrimaryProductImage(product) || "/stilloak/collection/digital-bundle.svg";
              const title = product.title || product.name;

              return (
                <article key={product._id} className="marketing-card flex min-w-0 flex-col overflow-hidden p-0">
                  <img src={image} alt={title} className="h-56 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="signal-pill">Skaitmeninis produktas</span>
                        <h2 className="mt-3 break-words font-display text-2xl font-bold leading-tight">{title}</h2>
                      </div>
                      <p className="shrink-0 font-display text-2xl font-bold">{formatCurrency(product.price)}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{product.description}</p>
                    <button
                      type="button"
                      onClick={() => handleCheckout(product)}
                      disabled={checkoutLoadingId === product._id}
                      className="button-primary mt-auto justify-center gap-2 disabled:opacity-60"
                    >
                      {checkoutLoadingId === product._id ? "Ruosiamas checkout..." : "Pirkti"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="Produktu kol kas nera" description="Sis store dar neturi publikuotu produktu." actionLabel="Grizti" actionTo="/" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicStorePage;
