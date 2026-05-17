import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import DigitalProductAccessGrid, { canAccessDigitalProduct } from "../components/DigitalProductAccessGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import { digitalProducts } from "../constants/digitalProducts";
import { useAuth } from "../context/AuthContext";

const DigitalProductsPage = () => {
  const { user, isCheckingAuth } = useAuth();
  const publicProducts = digitalProducts.filter((product) => product.isPublic);
  const unlockedCount = publicProducts.filter((product) => canAccessDigitalProduct(user, product)).length;

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen label="Krauname skaitmeninius produktus..." />;
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/18 bg-[#071310] p-5 text-white shadow-[0_38px_110px_rgba(0,0,0,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,38,31,0.9),rgba(7,19,16,0.97)_58%,rgba(5,10,9,1))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e2ca91]/60 to-transparent" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              Skaitmeniniai produktai
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Premium PDF gidai ir Excel šablonai aiškesniems sprendimams.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Svečiai gali peržiūrėti produktus, o atsisiuntimai atsiveria prisijungus ir pasirinkus Demo versiją arba aukštesnį planą.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#download-library" className="button-primary gap-2">
                Peržiūrėti produktus
                <ArrowRight size={16} />
              </a>
              <Link to={user ? "/pricing" : "/register"} state={!user ? { selectedPlan: "basic" } : undefined} className="hero-outline-button gap-2">
                Pasirinkti Demo versiją
                <Sparkles size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
            <p className="text-sm font-semibold text-white">Prieiga</p>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["Produktai", publicProducts.length],
                ["Atrakinta", user ? unlockedCount : 0],
                ["Formatas", "PDF + Excel"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-bold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="download-library" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Produktų biblioteka</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Digital Products</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              PDF gidai, Excel šablonai, planavimo sistemos ir praktiniai įrankiai aiškesniam produktyvumui, finansams ir augimui.
            </p>
          </div>
          <div className="soft-pill rounded-lg px-4 py-3 text-sm font-semibold text-muted">
            {user ? `${unlockedCount} iš ${publicProducts.length} atsisiuntimų aktyvūs` : "Prisijunkite atsisiuntimui"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
          <DigitalProductAccessGrid products={publicProducts} user={user} />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-lg border border-[#e2ca91]/24 bg-[#071310] p-6 text-white shadow-[0_28px_82px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(226,202,145,0.14),transparent_34%),linear-gradient(135deg,rgba(16,38,31,0.92),rgba(7,19,16,0.98))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              StillOak Studio narystė
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Norite daugiau premium įrankių?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Demo versija suteikia prieigą prie atrinktų PDF ir Excel failų. Atrakinkite Asmeninį planą, jei norite daugiau struktūruotų gidų, šablonų ir premium nario zonos galimybių.
            </p>
          </div>
          <Link to="/pricing" className="button-primary shrink-0 gap-2">
            Atrakinti Asmeninį planą
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DigitalProductsPage;
