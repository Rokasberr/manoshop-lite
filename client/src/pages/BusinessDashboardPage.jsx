import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  Palette,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import businessService from "../services/businessService";
import { formatCurrency } from "../utils/currency";

const dashboardCards = [
  {
    title: "Site Builder",
    text: "Sukurk ir publikuok savo skaitmeniniu produktu svetaine.",
    to: "/business/site-builder",
    icon: Palette,
    cta: "Redaguoti svetaine",
  },
  {
    title: "Skaitmeniniai produktai",
    text: "Perziurek produktus, kuriuos galima pirkti arba perparduoti.",
    to: "/business/digital-products",
    icon: Boxes,
    cta: "Atidaryti kataloga",
  },
  {
    title: "Mano svetaine",
    text: "Patikrink publikuota store puslapi ir klientu kelia.",
    to: "/business/my-store",
    icon: Store,
    cta: "Perziureti",
  },
  {
    title: "Mano produktai",
    text: "Valdyk produktus, kuriuos pasirinkai rodyti savo store.",
    to: "/business/my-products",
    icon: ShoppingBag,
    cta: "Tvarkyti produktus",
  },
  {
    title: "Uzsakymai",
    text: "Matyk pirkimus, mokejimu busena ir uzsakymo eiga.",
    to: "/business/orders",
    icon: CreditCard,
    cta: "Perziureti uzsakymus",
  },
  {
    title: "Pajamos",
    text: "Sek seller earnings ir Stilloak commission skaicius.",
    to: "/business/earnings",
    icon: BarChart3,
    cta: "Atidaryti pajamas",
  },
  {
    title: "Nustatymai",
    text: "Tvarkyk svetaines profili, slug ir publikavimo busena.",
    to: "/business/settings",
    icon: Settings,
    cta: "Atidaryti",
  },
];

const BusinessDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setDashboard(await businessService.getDashboard());
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Nepavyko uzkrauti Business Studio.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Krauname Business Studio..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <EmptyState title="Business Studio neatsidare" description={error} actionLabel="Grizti i Stilloak" actionTo="/members/savings-studio" />
      </div>
    );
  }

  const totals = dashboard?.totals || {};
  const store = dashboard?.store;

  return (
    <div className="space-y-8">
      <section className="member-executive-surface overflow-hidden rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="hero-chip">Business Studio</span>
              <span className="hero-chip">Verslas</span>
            </div>
            <h1 className="mt-6 break-words font-display text-4xl font-bold leading-tight sm:text-6xl">
              Tavo verslo zona, parduotuve ir pajamu eiga vienoje vietoje
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
              Kurk svetaine, pasirink perpardavimui leidziamus skaitmeninius produktus ir stebek uzsakymus be
              atskiro Stripe Connect payout sluoksnio.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/business/site-builder" className="button-primary gap-2">
                Atidaryti Site Builder
                <ArrowUpRight size={16} />
              </Link>
              {store?.slug && (
                <Link to={`/stores/${store.slug}`} className="hero-outline-button gap-2">
                  Atidaryti mano svetaine
                  <Store size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Uzsakymai", totals.orders || 0],
              ["Pajamos", formatCurrency(totals.sellerEarnings || 0)],
              ["Stilloak commission", formatCurrency(totals.platformCommission || 0)],
            ].map(([label, value]) => (
              <div key={label} className="metric-card p-5">
                <p className="text-xs font-semibold uppercase leading-5 text-white/48">{label}</p>
                <p className="mt-2 font-display text-3xl font-bold leading-tight text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!store && (
        <section className="panel p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="signal-pill">Pirmas zingsnis</span>
              <h2 className="mt-3 font-display text-3xl font-bold">Sukurk savo store puslapi</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                Kol svetaine nesukurta ir nepublikuota, viesas store puslapis nebus matomas klientams.
              </p>
            </div>
            <Link to="/business/site-builder" className="button-primary justify-center">
              Pradeti
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.to}
              className="marketing-card group min-w-0 p-5 transition duration-200 hover:-translate-y-1 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-[rgb(var(--surface-soft))]" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
                  <Icon size={22} style={{ color: "rgb(var(--accent-strong))" }} />
                </div>
                <ArrowUpRight size={18} className="text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h2 className="mt-5 break-words font-display text-2xl font-bold leading-tight">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{card.text}</p>
              <p className="mt-5 text-sm font-semibold accent-text">{card.cta}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default BusinessDashboardPage;
