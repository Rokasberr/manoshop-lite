import {
  ArrowRight,
  ArrowDownToLine,
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
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { getLocalizedDigitalProducts } from "../constants/digitalProducts";
import { getLocalizedSubscriptionPlans } from "../constants/subscriptionPlans";
import { journalArticles } from "../content/journalArticles";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import memberResourceService from "../services/memberResourceService";
import { isAdminUser, normalizePlan } from "../utils/membership";
import BazinisMemberPage from "./BazinisMemberPage";
import PrivateBusinessWorkspacePage from "./PrivateBusinessWorkspacePage";
import SavingsStudioPage from "./SavingsStudioPage";

const planOrder = {
  free: 0,
  basic: 1,
  personal: 2,
  private_business: 3,
};

const previewOptions = [{ id: "current" }, { id: "basic" }, { id: "personal" }, { id: "private_business" }];

const planAccent = {
  basic: "rgb(164 220 190)",
  personal: "rgb(194 239 211)",
  private_business: "rgb(226 202 145)",
};

const dashboardSections = [
  { id: "overview", icon: LayoutDashboard },
  { id: "digital", icon: FileText },
  { id: "saving", icon: Target },
  { id: "journal", icon: BookOpen },
  { id: "business", icon: BriefcaseBusiness },
  { id: "account", icon: User2 },
  { id: "plans", icon: CreditCard },
];

const businessModules = [
  {
    id: "business",
    title: "Business Studio",
    subtitle: "Privati verslo apžvalga ir strategijos zona.",
    to: "/business",
    icon: BriefcaseBusiness,
  },
  {
    id: "siteBuilder",
    title: "Site Builder",
    subtitle: "Kurkite ir tvarkykite savo skaitmeninių produktų svetainę.",
    to: "/business/site-builder",
    icon: Globe2,
  },
  {
    id: "digitalProducts",
    title: "Digital Products business area",
    subtitle: "Peržiūrėkite verslo katalogą ir produktų galimybes.",
    to: "/business/digital-products",
    icon: PackageCheck,
  },
  {
    id: "myWebsite",
    title: "My Website",
    subtitle: "Atidarykite savo viešą parduotuvės puslapį.",
    to: "/business/my-store",
    icon: Store,
  },
  {
    id: "myProducts",
    title: "My Products",
    subtitle: "Valdykite pasirinktus produktus ir jų pateikimą.",
    to: "/business/my-products",
    icon: WalletCards,
  },
  {
    id: "orders",
    title: "Orders",
    subtitle: "Matykite užsakymus, būsenas ir klientų kelią.",
    to: "/business/orders",
    icon: ReceiptText,
  },
  {
    id: "earnings",
    title: "Earnings dashboard",
    subtitle: "Sekite pajamas ir verslo rezultatus.",
    to: "/business/earnings",
    icon: BarChart3,
  },
];

const memberResources = [
  { id: "finansu-aiskumo-starter-kit", title: "Finansų aiškumo starter kit", minPlan: "basic", format: "pdf" },
  { id: "islaidu-audito-checklist", title: "Išlaidų audito checklist", minPlan: "basic", format: "pdf" },
  { id: "taupymo-tikslu-planavimo-sablonas", title: "Taupymo tikslų planavimo šablonas", minPlan: "basic", format: "pdf" },
  { id: "productivity-starter-kit", title: "Productivity starter kit", minPlan: "basic", format: "pdf" },
  { id: "weekly-planner-pro", title: "Weekly planner pro", minPlan: "basic", format: "pdf" },
  { id: "habit-tracker", title: "Habit tracker", minPlan: "basic", format: "pdf" },
  { id: "30-day-productivity-planner", title: "30 day productivity planner", minPlan: "basic", format: "pdf" },
  { id: "pajamu-ir-islaidu-optimizavimo-planas", title: "Pajamų ir išlaidų optimizavimo planas", minPlan: "personal", format: "pdf" },
  { id: "premium-finansiniu-tikslu-sistema", title: "Premium finansinių tikslų sistema", minPlan: "personal", format: "pdf" },
  { id: "skaitmeniniu-produktu-ideju-framework", title: "Skaitmeninių produktų idėjų framework", minPlan: "personal", format: "pdf" },
  { id: "digital-product-launch-kit", title: "Digital product launch kit", minPlan: "private_business", format: "pdf" },
  { id: "mini-verslo-paleidimo-blueprint", title: "Mini verslo paleidimo blueprint", minPlan: "private_business", format: "pdf" },
  { id: "premium-produkto-pasiulymo-framework", title: "Premium produkto pasiūlymo framework", minPlan: "private_business", format: "pdf" },
  { id: "store-page-copy-kit", title: "Store page copy kit", minPlan: "private_business", format: "pdf" },
];

const hasPlanAccess = (planId, requiredPlanId) =>
  (planOrder[normalizePlan(planId)] || 0) >= (planOrder[normalizePlan(requiredPlanId)] || 0);

const getTranslatedPlanLabel = (t, planId) => {
  const normalizedPlanId = normalizePlan(planId);
  return planOrder[normalizedPlanId] !== undefined ? t(`common.plans.${normalizedPlanId}`) : t("common.plans.free");
};


const formatDashboardPlanPrice = (price) => {
  const amount = Number(price || 0);

  if (amount === 0) {
    return "€0";
  }

  return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
};

const PreviewSwitch = ({ currentPlanId, selectedPlanId, onChange }) => {
  const { t } = useLanguage();
  const currentPlanLabel = getTranslatedPlanLabel(t, currentPlanId);
  const options = previewOptions.map((option) => ({
    ...option,
    label: option.id === "current" ? t("memberArea.preview.current") : t(`common.plans.${option.id}`),
    helper: t(`memberArea.preview.${option.id}Helper`),
  }));

  return (
    <section className="soft-card rounded-lg p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted">{t("memberArea.preview.eyebrow")}</p>
          <h2 className="mt-2 font-display text-2xl font-bold">{t("memberArea.preview.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{t("memberArea.preview.text")}</p>
          <p className="mt-2 text-xs font-semibold uppercase leading-5 text-muted">
            {t("memberArea.preview.realPlan", { plan: currentPlanLabel })}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]">
          {options.map((option) => {
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
};

const DashboardNav = ({ activeSection, onChange, access }) => (
  <DashboardNavContent activeSection={activeSection} onChange={onChange} access={access} />
);

const DashboardNavContent = ({ activeSection, onChange, access }) => {
  const { t } = useLanguage();

  return (
  <>
    <div className="lg:hidden">
      <div className="soft-card flex gap-2 overflow-x-auto rounded-lg p-2 pb-3 shadow-[0_18px_50px_rgba(17,31,26,0.08)]">
        {dashboardSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isLocked = section.id === "journal" ? !access.personal : section.id === "business" ? !access.business : false;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`inline-flex min-h-[3rem] shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition ${
                isActive ? "bg-[rgb(var(--accent-strong))] text-white" : "text-muted hover:bg-[rgb(var(--surface-soft))]"
              }`}
            >
              <Icon size={16} />
              {t(`memberArea.sections.${section.id}`)}
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
                  {t(`memberArea.sections.${section.id}`)}
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
};

const LockedModuleCard = () => {
  const { t } = useLanguage();

  return (
  <div className="soft-card mx-auto max-w-2xl rounded-lg border-dashed p-6 text-center shadow-[0_24px_70px_rgba(17,31,26,0.08)] sm:p-8">
    <div className="soft-pill mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-muted">
      <LockKeyhole size={20} />
    </div>
    <h3 className="mt-5 break-words font-display text-3xl font-bold leading-tight">{t("memberArea.lockedTitle")}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
      {t("memberArea.lockedText")}
    </p>
    <Link to="/pricing" className="button-primary mt-6 min-h-[3rem] justify-center gap-2">
      {t("common.buttons.viewPlans")}
      <ArrowRight size={16} />
    </Link>
  </div>
  );
};

const ModuleCard = ({ title, subtitle, icon: Icon, isLocked = false, onOpen, to, cta = "Atidaryti" }) => {
  const { t } = useLanguage();

  return (
  <article className="marketing-card flex h-full flex-col p-5 shadow-[0_18px_56px_rgba(17,31,26,0.07)] sm:p-6 md:min-h-[270px]">
    <div className="flex items-start justify-between gap-4">
      <div className="soft-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--accent-strong))]">
        <Icon size={20} />
      </div>
      {isLocked ? (
        <span className="signal-pill inline-flex items-center gap-1">
          <LockKeyhole size={13} />
          {t("common.states.locked")}
        </span>
      ) : (
        <span className="signal-pill">{t("common.states.active")}</span>
      )}
    </div>
    <h3 className="mt-5 break-words font-display text-2xl font-bold leading-tight">{title}</h3>
    <p className="mt-3 flex-1 text-sm leading-7 text-muted">{subtitle}</p>
    {isLocked ? (
      <Link to="/pricing" className="button-secondary mt-5 min-h-[3rem] justify-center">
        {t("common.buttons.viewPlans")}
      </Link>
    ) : to ? (
      <Link to={to} className="button-primary mt-5 min-h-[3rem] justify-center gap-2">
        {cta}
        <ArrowRight size={16} />
      </Link>
    ) : (
      <button type="button" onClick={onOpen} className="button-primary mt-5 min-h-[3rem] justify-center gap-2">
        {cta}
        <ArrowRight size={16} />
      </button>
    )}
  </article>
  );
};

const OverviewSection = ({ planId, access, onOpenSection }) => {
  const { language, t } = useLanguage();
  const memberCopy = t("memberArea");
  const publicProducts = getLocalizedDigitalProducts(language).filter((product) => product.isPublic);
  const currentPlanLabel = getTranslatedPlanLabel(t, planId);

  const moduleCards = [
    {
      title: memberCopy.moduleCards.digital.title,
      subtitle: memberCopy.moduleCards.digital.subtitle,
      icon: FileText,
      onOpen: () => onOpenSection("digital"),
      cta: memberCopy.moduleCards.digital.cta,
    },
    {
      title: memberCopy.moduleCards.saving.title,
      subtitle: memberCopy.moduleCards.saving.subtitle,
      icon: Target,
      onOpen: () => onOpenSection("saving"),
      cta: access.personal ? memberCopy.moduleCards.saving.ctaOpen : memberCopy.moduleCards.saving.ctaDemo,
    },
    {
      title: memberCopy.moduleCards.journal.title,
      subtitle: memberCopy.moduleCards.journal.subtitle,
      icon: BookOpen,
      isLocked: !access.personal,
      onOpen: () => onOpenSection("journal"),
      cta: memberCopy.moduleCards.journal.cta,
    },
    {
      title: memberCopy.moduleCards.business.title,
      subtitle: memberCopy.moduleCards.business.subtitle,
      icon: BriefcaseBusiness,
      isLocked: !access.business,
      onOpen: () => onOpenSection("business"),
      cta: memberCopy.moduleCards.business.cta,
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
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-6xl">{memberCopy.overviewTitle}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              {memberCopy.overviewText}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62">{memberCopy.planCta[planId] || memberCopy.planCta.basic}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5">
            <p className="text-sm font-semibold text-white">{memberCopy.todayActive}</p>
            <div className="mt-5 grid gap-3">
              {[
                [memberCopy.stats.plans, currentPlanLabel],
                [memberCopy.stats.products, t("memberArea.productsInCatalog", { count: publicProducts.length })],
                [memberCopy.stats.business, access.business ? t("common.states.active") : t("common.states.locked")],
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

const DigitalProductsSection = ({ planId }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [downloadLoadingKey, setDownloadLoadingKey] = useState("");
  const publicProducts = getLocalizedDigitalProducts(language).filter((product) => product.isPublic);
  const canAccessResource = (resource) => isAdminUser(user) || hasPlanAccess(planId, resource.minPlan);
  const handleMemberResourceDownload = async (resource) => {
    if (!canAccessResource(resource)) {
      const planLabel = getTranslatedPlanLabel(t, resource.minPlan);
      toast.error(`Šiam resursui reikalingas ${planLabel} planas.`);
      return;
    }

    try {
      setDownloadLoadingKey(`${resource.id}:${resource.format}`);
      await memberResourceService.downloadMemberResource(resource.id, resource.format, `${resource.id}.${resource.format}`);
    } catch (error) {
      if (error.response?.status === 403) {
        const planLabel = getTranslatedPlanLabel(t, resource.minPlan);
        toast.error(`Šiam resursui reikalingas ${planLabel} planas.`);
        return;
      }

      if (error.response?.status === 404) {
        toast.error("Failas dar nepasiekiamas.");
        return;
      }

      toast.error(error.response?.data?.message || "Nepavyko atsisiųsti resurso.");
    } finally {
      setDownloadLoadingKey("");
    }
  };

  return (
    <section className="space-y-5">
      <div className="panel overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr] lg:items-end">
          <div>
            <span className="signal-pill">{t("memberArea.sections.digital")}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("memberArea.sections.digital")}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t("memberArea.digitalText")}</p>
          </div>
          <div className="soft-card rounded-lg p-4">
            <p className="text-xs font-bold uppercase text-muted">{t("memberArea.catalogCount")}</p>
            <p className="mt-2 font-display text-3xl font-bold">{publicProducts.length}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{t("memberArea.premiumExcelModels")}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/digital-products" className="button-primary min-h-[3rem] justify-center gap-2">
            {t("common.buttons.viewProducts")}
            <ArrowRight size={16} />
          </Link>
          <Link to="/pricing" className="button-secondary min-h-[3rem] justify-center">
            {t("common.buttons.viewPlans")}
          </Link>
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">Nario resursai</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Apsaugoti PDF atsisiuntimai</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Šie failai pateikiami per nario API. Aukštesnio plano resursai matomi kaip užrakinti, bet tiesioginio viešo failo kelio nėra.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {memberResources.map((resource) => {
            const isAccessible = canAccessResource(resource);
            const planLabel = getTranslatedPlanLabel(t, resource.minPlan);
            const loadingKey = `${resource.id}:${resource.format}`;

            return (
              <article
                key={resource.id}
                className="rounded-lg border bg-[rgb(var(--surface))] p-4"
                style={{ borderColor: "rgb(var(--line) / 0.82)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold leading-6">{resource.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase leading-5 text-muted">
                      {resource.format.toUpperCase()} · nuo {planLabel}
                    </p>
                  </div>
                  {isAccessible ? <FileText size={18} /> : <LockKeyhole size={18} />}
                </div>
                {isAccessible ? (
                  <button
                    type="button"
                    onClick={() => handleMemberResourceDownload(resource)}
                    disabled={downloadLoadingKey === loadingKey}
                    className="button-primary mt-4 min-h-[3rem] w-full justify-center gap-2"
                  >
                    <ArrowDownToLine size={16} />
                    {downloadLoadingKey === loadingKey ? "Ruošiama..." : "Atsisiųsti"}
                  </button>
                ) : (
                  <Link to="/pricing" className="button-secondary mt-4 min-h-[3rem] w-full justify-center">
                    Peržiūrėti planus
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SavingStudioSection = ({ access }) => {
  const { t } = useLanguage();

  return (
    <section className="min-w-0 space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("memberArea.moduleCards.saving.title")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("memberArea.moduleCards.saving.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t("memberArea.moduleCards.saving.subtitle")}</p>
      </div>
      <div className="min-w-0">{access.personal ? <SavingsStudioPage /> : <BazinisMemberPage />}</div>
    </section>
  );
};

const JournalSection = ({ access }) => {
  const { t } = useLanguage();

  if (!access.personal) {
    return <LockedModuleCard />;
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("memberArea.moduleCards.journal.title")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("memberArea.journalTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t("memberArea.journalText")}</p>
        <Link to="/journal" className="button-primary mt-5 gap-2">
          {t("memberArea.openJournal")}
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
  const { t } = useLanguage();

  if (!access.business) {
    return <LockedModuleCard />;
  }

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("common.plans.private_business")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("memberArea.moduleCards.business.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t("memberArea.moduleCards.business.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {businessModules.map((module) => (
          <ModuleCard
            key={module.id}
            {...module}
            title={t(`memberArea.businessModules.${module.id}.title`)}
            subtitle={t(`memberArea.businessModules.${module.id}.subtitle`)}
            cta={t("common.buttons.openStudio")}
          />
        ))}
      </div>

      <PrivateBusinessWorkspacePage />
    </section>
  );
};

const AccountSection = ({ user, planId }) => {
  const { t } = useLanguage();

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("memberArea.sections.account")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold">{user?.name}</h2>
        <p className="mt-2 text-muted">{user?.email}</p>
        <div className="soft-card mt-6 rounded-lg p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("memberArea.accountCurrentPlan")}</p>
          <p className="mt-2 font-display text-2xl font-bold">{getTranslatedPlanLabel(t, planId)}</p>
        </div>
        <Link to="/profile" className="button-primary mt-5 gap-2">
          {t("memberArea.openProfile")}
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("memberArea.sections.plans")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold">{t("memberArea.changePlanTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t("memberArea.changePlanText")}</p>
        <Link to="/pricing" className="button-secondary mt-5 justify-center">
          {t("common.buttons.viewPlans")}
        </Link>
      </div>
    </section>
  );
};

const PlansSection = ({ planId }) => {
  const { language, t } = useLanguage();
  const subscriptionPlans = getLocalizedSubscriptionPlans(language);

  return (
    <section className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <span className="signal-pill">{t("memberArea.sections.plans")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("memberArea.chooseAnotherLevel")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t("memberArea.chooseAnotherText")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const isCurrent = normalizePlan(plan.id) === planId;
          const accent = planAccent[plan.id] || "rgb(var(--accent-strong))";

          return (
            <article key={plan.id} className="marketing-card flex h-full flex-col p-5 shadow-[0_18px_56px_rgba(17,31,26,0.07)] sm:p-6 lg:min-h-[430px]">
              <div className="flex items-start justify-between gap-4">
                <span className="signal-pill">{plan.badge}</span>
                {isCurrent && <CheckCircle2 size={20} style={{ color: accent }} />}
              </div>
              <h3 className="mt-5 font-display text-3xl font-bold">{plan.name}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{plan.subtitle || plan.description}</p>
              <p className="mt-5 font-display text-4xl font-bold">{formatDashboardPlanPrice(plan.price)}</p>
              <div className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="soft-card flex gap-3 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={16} style={{ color: accent }} />
                    <span className="text-sm leading-6 text-muted">{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/pricing" className={`mt-5 min-h-[3rem] ${isCurrent ? "button-secondary" : "button-primary"} w-full justify-center`}>
                {isCurrent ? t("common.states.currentPlan") : t("common.buttons.viewPlans")}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

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
        return <DigitalProductsSection planId={effectivePlanId} />;
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
        return <OverviewSection planId={effectivePlanId} access={access} onOpenSection={setActiveSection} />;
    }
  };

  return (
    <div className="member-workspace w-full min-w-0 space-y-6">
      {canUsePreview && (
        <PreviewSwitch currentPlanId={realPlanId} selectedPlanId={previewPlanId} onChange={setPreviewPlanId} />
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[280px_minmax(0,1fr)] 2xl:gap-10">
        <DashboardNav activeSection={activeSection} onChange={setActiveSection} access={access} />
        <main className="w-full min-w-0">{renderActiveSection()}</main>
      </div>
    </div>
  );
};

export default MemberAreaPage;
