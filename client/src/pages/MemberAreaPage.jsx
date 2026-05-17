import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  Store,
  Target,
  User2,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DigitalProductAccessGrid, { canAccessDigitalProduct } from "../components/DigitalProductAccessGrid";
import { digitalProducts } from "../constants/digitalProducts";
import { subscriptionPlans } from "../constants/subscriptionPlans";
import { journalArticles } from "../content/journalArticles";
import { useAuth } from "../context/AuthContext";
import { isAdminUser, normalizePlan, planDisplayNames } from "../utils/membership";
import BazinisMemberPage from "./BazinisMemberPage";
import PrivateBusinessWorkspacePage from "./PrivateBusinessWorkspacePage";
import SavingsStudioPage from "./SavingsStudioPage";

const planOrder = {
  free: 0,
  basic: 1,
  personal: 2,
  private_business: 3,
};

const previewOptions = [
  { id: "current", label: "Dabartinis planas", helper: "Rodo pagal tikrą paskyros planą." },
  { id: "basic", label: "Demo versija", helper: "Nemokama skaitmeninių produktų pradžia." },
  { id: "personal", label: "Asmeninis", helper: "Pilna Saving Studio patirtis." },
  { id: "private_business", label: "Privatus verslas", helper: "Business Studio ir verslo įrankiai." },
];

const planAccent = {
  basic: "rgb(164 220 190)",
  personal: "rgb(194 239 211)",
  private_business: "rgb(226 202 145)",
};

const dashboardSections = [
  { id: "overview", label: "Pagrindinis", icon: LayoutDashboard },
  { id: "digital", label: "Skaitmeniniai produktai", icon: FileText },
  { id: "saving", label: "Saving Studio", icon: Target },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "business", label: "Business Studio", icon: BriefcaseBusiness },
  { id: "account", label: "Paskyra", icon: User2 },
  { id: "plans", label: "Planai", icon: CreditCard },
];

const businessModules = [
  {
    title: "Business Studio",
    subtitle: "Privati verslo apžvalga ir strategijos zona.",
    to: "/business",
    icon: BriefcaseBusiness,
  },
  {
    title: "Site Builder",
    subtitle: "Kurkite ir tvarkykite savo skaitmeninių produktų svetainę.",
    to: "/business/site-builder",
    icon: Globe2,
  },
  {
    title: "Digital Products business area",
    subtitle: "Peržiūrėkite verslo katalogą ir produktų galimybes.",
    to: "/business/digital-products",
    icon: PackageCheck,
  },
  {
    title: "My Website",
    subtitle: "Atidarykite savo viešą parduotuvės puslapį.",
    to: "/business/my-store",
    icon: Store,
  },
  {
    title: "My Products",
    subtitle: "Valdykite pasirinktus produktus ir jų pateikimą.",
    to: "/business/my-products",
    icon: WalletCards,
  },
  {
    title: "Orders",
    subtitle: "Matykite užsakymus, būsenas ir klientų kelią.",
    to: "/business/orders",
    icon: ReceiptText,
  },
  {
    title: "Earnings dashboard",
    subtitle: "Sekite pajamas ir verslo rezultatus.",
    to: "/business/earnings",
    icon: BarChart3,
  },
];

const hasPlanAccess = (planId, requiredPlanId) =>
  (planOrder[normalizePlan(planId)] || 0) >= (planOrder[normalizePlan(requiredPlanId)] || 0);

const getPlanCta = (planId) => {
  if (planId === "private_business") {
    return "Atrakinkite Business Studio ir valdykite svetainę, produktus bei užsakymus vienoje vietoje.";
  }

  if (planId === "personal") {
    return "Atrakinkite Asmeninį planą ir gaukite pilną Saving Studio patirtį.";
  }

  return "Pradėkite nuo Demo versijos ir atsisiųskite atrinktus PDF bei Excel failus.";
};

const PreviewSwitch = ({ currentPlanId, selectedPlanId, onChange }) => (
  <section className="soft-card rounded-lg p-4 sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-muted">admin preview</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Plano peržiūra</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Peržiūra nekeičia tikro vartotojo plano. Tik parodo, kaip atrodo skirtingi narystės lygiai.
        </p>
        <p className="mt-2 text-xs font-semibold uppercase leading-5 text-muted">
          Tikras planas: {planDisplayNames[currentPlanId] || currentPlanId || "Be aktyvios narystės"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]">
        {previewOptions.map((option) => {
          const isSelected = selectedPlanId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-lg border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 ${
                isSelected ? "bg-[rgb(var(--accent-strong))] text-white" : "bg-white text-[rgb(var(--text))]"
              }`}
              style={{
                borderColor: isSelected ? "rgb(var(--accent))" : "rgb(var(--line) / 0.82)",
              }}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`mt-1 block text-xs leading-5 ${isSelected ? "opacity-80" : "text-muted"}`}>
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

const DashboardNav = ({ activeSection, onChange, access }) => (
  <>
    <div className="lg:hidden">
      <div className="soft-card flex gap-2 overflow-x-auto rounded-lg p-2">
        {dashboardSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isLocked = section.id === "journal" ? !access.personal : section.id === "business" ? !access.business : false;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                isActive ? "bg-[rgb(var(--accent-strong))] text-white" : "text-muted hover:bg-[rgb(var(--surface-soft))]"
              }`}
            >
              <Icon size={16} />
              {section.label}
              {isLocked && <LockKeyhole size={13} />}
            </button>
          );
        })}
      </div>
    </div>

    <aside className="hidden lg:block">
      <div className="soft-card sticky top-28 rounded-lg p-3 shadow-[0_22px_60px_rgba(17,31,26,0.07)]">
        <p className="px-3 py-2 text-xs font-bold uppercase text-muted">Dashboard</p>
        <div className="space-y-1">
          {dashboardSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isLocked = section.id === "journal" ? !access.personal : section.id === "business" ? !access.business : false;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onChange(section.id)}
                className={`flex min-h-[3rem] w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-[rgb(var(--accent-strong))] text-white shadow-[0_12px_28px_rgba(29,84,67,0.18)]"
                    : "text-muted hover:bg-[rgb(var(--surface-soft))] hover:text-[rgb(var(--text))]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} />
                  {section.label}
                </span>
                {isLocked && <LockKeyhole size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  </>
);

const LockedModuleCard = () => (
  <div className="soft-card rounded-lg border-dashed p-5 sm:p-6">
    <div className="soft-pill flex h-11 w-11 items-center justify-center rounded-lg text-muted">
      <LockKeyhole size={20} />
    </div>
    <h3 className="mt-5 font-display text-2xl font-bold">Atrakinkite šią zoną</h3>
    <p className="mt-3 text-sm leading-7 text-muted">
      Ši skiltis prieinama aukštesnio plano nariams. Pasirinkite planą, kuris geriausiai atitinka jūsų tikslus.
    </p>
    <Link to="/pricing" className="button-primary mt-5 gap-2">
      Peržiūrėti planus
      <ArrowRight size={16} />
    </Link>
  </div>
);

const ModuleCard = ({ title, subtitle, icon: Icon, isLocked = false, onOpen, to, cta = "Atidaryti" }) => (
  <article className="marketing-card flex h-full flex-col p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="soft-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--accent-strong))]">
        <Icon size={20} />
      </div>
      {isLocked ? (
        <span className="signal-pill inline-flex items-center gap-1">
          <LockKeyhole size={13} />
          Užrakinta
        </span>
      ) : (
        <span className="signal-pill">Aktyvu</span>
      )}
    </div>
    <h3 className="mt-5 font-display text-2xl font-bold leading-tight">{title}</h3>
    <p className="mt-3 flex-1 text-sm leading-7 text-muted">{subtitle}</p>
    {isLocked ? (
      <Link to="/pricing" className="button-secondary mt-5 justify-center">
        Peržiūrėti planus
      </Link>
    ) : to ? (
      <Link to={to} className="button-primary mt-5 gap-2">
        {cta}
        <ArrowRight size={16} />
      </Link>
    ) : (
      <button type="button" onClick={onOpen} className="button-primary mt-5 gap-2">
        {cta}
        <ArrowRight size={16} />
      </button>
    )}
  </article>
);

const OverviewSection = ({ user, planId, access, onOpenSection }) => {
  const publicProducts = digitalProducts.filter((product) => product.isPublic);
  const unlockedProducts = publicProducts.filter((product) => canAccessDigitalProduct(user, product)).length;
  const currentPlanLabel = planDisplayNames[planId] || "Demo versija";

  const moduleCards = [
    {
      title: "Skaitmeniniai produktai",
      subtitle: "PDF gidai ir Excel šablonai, skirti aiškesniam planavimui, produktyvumui ir augimui.",
      icon: FileText,
      onOpen: () => onOpenSection("digital"),
      cta: "Atidaryti produktus",
    },
    {
      title: "Saving Studio",
      subtitle: "Asmeninė erdvė tikslams, biudžetui, progresui ir mėnesio apžvalgoms.",
      icon: Target,
      onOpen: () => onOpenSection("saving"),
      cta: access.personal ? "Atidaryti studio" : "Peržiūrėti demo",
    },
    {
      title: "Journal",
      subtitle: "Gidai, nario naujienos ir struktūruotos pastabos gilesniam darbui.",
      icon: BookOpen,
      isLocked: !access.personal,
      onOpen: () => onOpenSection("journal"),
      cta: "Skaityti",
    },
    {
      title: "Business Studio",
      subtitle: "Privati verslo zona svetainėms, produktams, užsakymams ir pajamų apžvalgai.",
      icon: BriefcaseBusiness,
      isLocked: !access.business,
      onOpen: () => onOpenSection("business"),
      cta: "Atidaryti verslo zoną",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="member-executive-surface overflow-hidden rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-lg border border-[#e2ca91]/30 bg-[#e2ca91]/12 px-3 py-1 text-xs font-bold uppercase text-[#f2d99a]">
              {currentPlanLabel}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-6xl">Tavo StillOak erdvė</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Tvarkykite skaitmeninius produktus, šablonus ir nario įrankius vienoje aiškioje vietoje.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62">{getPlanCta(planId)}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5">
            <p className="text-sm font-semibold text-white">Šiandien aktyvu</p>
            <div className="mt-5 grid gap-3">
              {[
                ["Planai", currentPlanLabel],
                ["Produktai", `${unlockedProducts} / ${publicProducts.length}`],
                ["Business", access.business ? "Aktyvu" : "Užrakinta"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-xs font-bold uppercase text-white/44">{label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map((card) => (
          <ModuleCard key={card.title} {...card} />
        ))}
      </section>
    </div>
  );
};

const DigitalProductsSection = ({ user }) => {
  const publicProducts = digitalProducts.filter((product) => product.isPublic);

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">Skaitmeniniai produktai</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Skaitmeniniai produktai</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          PDF gidai ir Excel šablonai, skirti aiškesniam planavimui, produktyvumui ir augimui.
        </p>
      </div>
      <div className="rounded-lg border border-white/10 bg-[#071310] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.22)] sm:p-5">
        <DigitalProductAccessGrid products={publicProducts} user={user} />
      </div>
    </section>
  );
};

const SavingStudioSection = ({ access }) => (
  <section className="space-y-5">
    <div className="panel p-5 sm:p-6">
      <span className="signal-pill">Saving Studio</span>
      <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Saving Studio</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Asmeninė erdvė tikslams, biudžetui, progresui ir mėnesio apžvalgoms.
      </p>
    </div>
    {access.personal ? <SavingsStudioPage /> : <BazinisMemberPage />}
  </section>
);

const JournalSection = ({ access }) => {
  if (!access.personal) {
    return <LockedModuleCard />;
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">Journal</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Journal ir gidai</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Asmeninio ir Privataus verslo nariams skirti gidai, naujienos ir struktūruotos pastabos.
        </p>
        <Link to="/journal" className="button-primary mt-5 gap-2">
          Atidaryti Journal
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {journalArticles.slice(0, 3).map((article) => (
          <Link key={article.slug} to={`/journal/${article.slug}`} className="marketing-card p-5 transition hover:-translate-y-1">
            <p className="text-xs font-bold uppercase text-muted">{article.category}</p>
            <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{article.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

const BusinessStudioSection = ({ access }) => {
  if (!access.business) {
    return <LockedModuleCard />;
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">Privatus verslas</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Business Studio</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Privati verslo zona svetainėms, produktams, užsakymams ir pajamų apžvalgai.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {businessModules.map((module) => (
          <ModuleCard key={module.title} {...module} cta="Atidaryti" />
        ))}
      </div>

      <PrivateBusinessWorkspacePage />
    </section>
  );
};

const AccountSection = ({ user, planId }) => (
  <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="panel p-5 sm:p-6">
      <span className="signal-pill">Paskyra</span>
      <h2 className="mt-4 font-display text-3xl font-bold">{user?.name}</h2>
      <p className="mt-2 text-muted">{user?.email}</p>
      <div className="soft-card mt-6 rounded-lg p-4">
        <p className="text-xs font-bold uppercase text-muted">Dabartinis planas</p>
        <p className="mt-2 font-display text-2xl font-bold">{planDisplayNames[planId] || planId}</p>
      </div>
      <Link to="/profile" className="button-primary mt-5 gap-2">
        Atidaryti profilį
        <ArrowRight size={16} />
      </Link>
    </div>

    <div className="panel p-5 sm:p-6">
      <span className="signal-pill">Planai</span>
      <h2 className="mt-4 font-display text-3xl font-bold">Keiskite planą tada, kai reikia daugiau.</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Demo versija tinka failų pradžiai, Asmeninis atrakina pilną Saving Studio, o Privatus verslas prideda verslo zonas.
      </p>
      <Link to="/pricing" className="button-secondary mt-5 justify-center">
        Peržiūrėti planus
      </Link>
    </div>
  </section>
);

const PlansSection = ({ planId }) => (
  <section className="space-y-5">
    <div className="panel p-5 sm:p-6">
      <span className="signal-pill">Planai</span>
      <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Pasirinkite kitą lygį</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Kiekvienas planas turi aiškią paskirtį: Demo failams, Asmeninis pilnai asmeninei sistemai, Privatus verslas verslo valdymui.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {subscriptionPlans.map((plan) => {
        const isCurrent = normalizePlan(plan.id) === planId;
        const accent = planAccent[plan.id] || "rgb(var(--accent-strong))";

        return (
          <article key={plan.id} className="marketing-card p-5">
            <div className="flex items-start justify-between gap-4">
              <span className="signal-pill">{plan.badge}</span>
              {isCurrent && <CheckCircle2 size={20} style={{ color: accent }} />}
            </div>
            <h3 className="mt-5 font-display text-3xl font-bold">{plan.name}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{plan.subtitle || plan.description}</p>
            <p className="mt-5 font-display text-4xl font-bold">{Number(plan.price) === 0 ? "€0" : `${plan.price} €`}</p>
            <div className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <div key={feature} className="soft-card flex gap-3 rounded-lg px-3 py-2.5">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={16} style={{ color: accent }} />
                  <span className="text-sm leading-6 text-muted">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing" className={`mt-5 ${isCurrent ? "button-secondary" : "button-primary"} w-full justify-center`}>
              {isCurrent ? "Dabartinis planas" : "Peržiūrėti planus"}
            </Link>
          </article>
        );
      })}
    </div>
  </section>
);

const MemberAreaPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [previewPlanId, setPreviewPlanId] = useState("current");
  const realPlanId = normalizePlan(user?.subscription?.plan);
  const canUsePreview = isAdminUser(user) || import.meta.env.DEV;
  const effectivePlanId = canUsePreview && previewPlanId !== "current" ? previewPlanId : realPlanId;
  const access = useMemo(
    () => ({
      demo: hasPlanAccess(effectivePlanId, "basic"),
      personal: hasPlanAccess(effectivePlanId, "personal"),
      business: hasPlanAccess(effectivePlanId, "private_business"),
    }),
    [effectivePlanId]
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "digital":
        return <DigitalProductsSection user={user} />;
      case "saving":
        return <SavingStudioSection access={access} />;
      case "journal":
        return <JournalSection access={access} />;
      case "business":
        return <BusinessStudioSection access={access} />;
      case "account":
        return <AccountSection user={user} planId={effectivePlanId} />;
      case "plans":
        return <PlansSection planId={effectivePlanId} />;
      case "overview":
      default:
        return <OverviewSection user={user} planId={effectivePlanId} access={access} onOpenSection={setActiveSection} />;
    }
  };

  return (
    <div className="member-workspace space-y-6">
      {canUsePreview && (
        <PreviewSwitch currentPlanId={realPlanId} selectedPlanId={previewPlanId} onChange={setPreviewPlanId} />
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <DashboardNav activeSection={activeSection} onChange={setActiveSection} access={access} />
        <main className="min-w-0">{renderActiveSection()}</main>
      </div>
    </div>
  );
};

export default MemberAreaPage;
