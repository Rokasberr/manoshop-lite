import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  digitalProductPlanLabels,
  digitalProductPlanOrder,
  digitalProducts,
} from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";
import { hasActiveMembership, isAdminUser, normalizePlan } from "../utils/membership";

const planTabs = [
  { id: "basic", label: "Bazinis" },
  { id: "personal", label: "Asmeninis" },
  { id: "private_business", label: "Privatus verslas" },
];

const getUserPlanLevel = (user) => {
  if (isAdminUser(user)) {
    return "private_business";
  }

  return normalizePlan(user?.subscription?.plan || "free");
};

const canOpenProduct = (userPlan, productPlan) =>
  (digitalProductPlanOrder[userPlan] || 0) >= (digitalProductPlanOrder[productPlan] || 0);

const getLockedLabel = (planLevel) => `Prieinama su ${digitalProductPlanLabels[planLevel]} planu`;

const ProductCard = ({ product, isUnlocked, isGuest }) => (
  <article className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-lg border border-white/12 bg-white/[0.055] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 sm:p-6">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />
    <div className="relative flex items-start justify-between gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 text-[#f2d99a]">
        {isUnlocked ? <FileText size={22} /> : <LockKeyhole size={22} />}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <span className="rounded-lg border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/68">
          {product.type}
        </span>
        <span className="rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-semibold text-[#f2d99a]">
          {product.planLabel}
        </span>
      </div>
    </div>

    <div className="relative mt-6 flex flex-1 flex-col">
      <span className="text-xs font-bold uppercase text-[#f2d99a]/82">{product.badge}</span>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">{product.title}</h2>
      <p className="mt-4 text-sm leading-7 text-white/66">{product.description}</p>

      <div className="mt-5 rounded-lg border border-white/10 bg-black/16 p-4">
        <p className="text-xs font-bold uppercase text-white/44">Vertė</p>
        <p className="mt-2 text-sm leading-6 text-white/72">{product.valueSummary}</p>
      </div>

      <div className="mt-auto pt-6">
        {isUnlocked ? (
          <a
            href={product.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="button-primary w-full gap-2"
          >
            Atidaryti resursą
            <ArrowRight size={16} />
          </a>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <LockKeyhole size={16} className="text-[#f2d99a]" />
              {isGuest ? "Prisijunk, kad matytum savo prieigą" : getLockedLabel(product.planLevel)}
            </p>
            <Link to={isGuest ? "/login" : "/pricing"} className="button-secondary mt-4 w-full justify-center border-white/12 bg-white/8 text-white">
              {isGuest ? "Prisijungti" : "Atrakinti planą"}
            </Link>
          </div>
        )}
      </div>
    </div>
  </article>
);

const DigitalProductsPage = () => {
  const { user, isCheckingAuth } = useAuth();
  const isMember = hasActiveMembership(user);
  const userPlan = isMember ? getUserPlanLevel(user) : "free";
  const activeProducts = useMemo(() => digitalProducts.filter((product) => product.isActive), []);

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen label="Krauname skaitmeninius produktus..." />;
  }

  const unlockedCount = activeProducts.filter((product) => canOpenProduct(userPlan, product.planLevel)).length;
  const featuredProducts = activeProducts.slice(0, 6);
  const visibleProducts = user ? activeProducts : featuredProducts;

  return (
    <div className="member-workspace space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/18 bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(226,202,145,0.18),transparent_32%),linear-gradient(135deg,rgba(16,38,31,0.88),rgba(7,19,16,0.96)_58%,rgba(5,10,9,1))]" />
        <div className="relative grid gap-8 xl:grid-cols-[1fr_0.72fr] xl:items-end">
          <div className="min-w-0">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-semibold uppercase text-[#f2d99a]">
              Skaitmeniniai produktai
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Premium skaitmeninių resursų biblioteka
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Atrinkti gidai, šablonai ir strateginiai įrankiai aiškesniems finansiniams, kūrybiniams ir verslo sprendimams.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#resources" className="button-primary gap-2">
                Peržiūrėti resursus
                <ArrowRight size={16} />
              </a>
              <Link to="/pricing" className="hero-outline-button gap-2">
                Atrakinti narystę
                <Sparkles size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.24)]">
            <p className="text-sm font-semibold text-white">Tavo prieiga</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                ["Aktyvūs resursai", activeProducts.length],
                ["Atrakinta", user ? unlockedCount : 0],
                ["Planai", 3],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-semibold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-white/60">
              {user
                ? `Dabartinis planas: ${digitalProductPlanLabels[userPlan] || "Neaktyvi narystė"}.`
                : "Prisijunk arba pasirink narystę, kad atrakintum pilną biblioteką."}
            </p>
          </div>
        </div>
      </section>

      {!user ? (
        <section className="panel p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="signal-pill">Premium preview</span>
              <h2 className="mt-3 font-display text-3xl font-bold">Biblioteka sukurta nariams, kurie nori aiškumo</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                Gali peržiūrėti dalį resursų katalogo. Prisijungus matysi, kurie failai priklauso tavo planui ir kuriuos gali atidaryti iš karto.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="button-secondary justify-center">Prisijungti</Link>
              <Link to="/pricing" className="button-primary justify-center">Įsigyti narystę</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {planTabs.map((plan) => {
          const planProducts = activeProducts.filter((product) => product.planLevel === plan.id);
          const isIncluded = canOpenProduct(userPlan, plan.id);

          return (
            <div
              key={plan.id}
              className="rounded-lg border p-5"
              style={{
                borderColor: isIncluded ? "rgb(var(--accent) / 0.35)" : "rgb(var(--line) / 0.78)",
                backgroundColor: isIncluded ? "rgb(var(--surface) / 0.82)" : "rgb(var(--surface-soft) / 0.56)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="signal-pill">{plan.label}</span>
                {isIncluded ? <CheckCircle2 size={20} className="text-[rgb(var(--accent-strong))]" /> : <LockKeyhole size={20} className="text-muted" />}
              </div>
              <p className="mt-4 font-display text-3xl font-bold">{planProducts.length}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isIncluded ? "Įtraukta į tavo prieigą" : getLockedLabel(plan.id)}
              </p>
            </div>
          );
        })}
      </section>

      <section id="resources" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Biblioteka</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Skaitmeniniai produktai</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Kiekvienas resursas turi realų turinį: instrukcijas, klausimus, lenteles, checklistus arba planavimo struktūras.
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold text-muted"
            style={{
              borderColor: "rgb(var(--line) / 0.8)",
              backgroundColor: "rgb(var(--surface) / 0.7)",
            }}
          >
            <BarChart3 size={17} />
            {user ? `${unlockedCount} iš ${activeProducts.length} atrakinta` : "Preview režimas"}
          </div>
        </div>

        {visibleProducts.length ? (
          <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isGuest={!user}
                  isUnlocked={Boolean(user) && canOpenProduct(userPlan, product.planLevel)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Resursų šiuo metu nėra"
            description="Biblioteka ruošiama. Kai resursai bus aktyvūs, jie atsiras šiame puslapyje."
            actionLabel="Grįžti į nario zoną"
            actionTo="/members/savings-studio"
          />
        )}
      </section>
    </div>
  );
};

export default DigitalProductsPage;
