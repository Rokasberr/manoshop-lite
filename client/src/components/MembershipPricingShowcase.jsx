import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import FloatingMarketNumbers from "./FloatingMarketNumbers";
import { getLocalizedSubscriptionPlans } from "../constants/subscriptionPlans";
import { useLanguage } from "../context/LanguageContext";

const planPresentation = {
  basic: {
    icon: WalletCards,
    accent: "rgb(164 220 190)",
  },
  personal: {
    icon: Target,
    accent: "rgb(194 239 211)",
  },
  private_business: {
    icon: BriefcaseBusiness,
    accent: "rgb(226 202 145)",
  },
};
const sectionHrefs = ["#funkcijos", "#narystes", "#rinkiniai", "#atsiliepimai"];
const kitIcons = [WalletCards, Target, BriefcaseBusiness];
const dashboardCardIcons = [WalletCards, Target, FileText, BriefcaseBusiness];
const dashboardCardProgress = [68, 74, 52, 86];

const formatPlanPrice = (value, intervalLabel) => {
  const amount = Number(value || 0);

  if (amount === 0) {
    return "0 €";
  }

  const formattedAmount = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(".", ",");
  const formattedInterval = intervalLabel || "";

  return `${formattedAmount} €${formattedInterval}`;
};

const MembershipPricingShowcase = ({
  onChoosePlan,
  loadingPlanId = "",
  currentPlanId = "",
  joinLoadingLabel = "Jungiama...",
  currentPlanLabel = "Aktyvus planas",
  headingLevel = "h1",
}) => {
  const { language, t } = useLanguage();
  const copy = t("pricing");
  const subscriptionPlans = getLocalizedSubscriptionPlans(language);
  const localizedSectionNav = copy.nav.map((label, index) => ({ label, href: sectionHrefs[index] }));
  const effectiveJoinLoadingLabel = joinLoadingLabel === "Jungiama..." ? copy.joinLoading : joinLoadingLabel;
  const effectiveCurrentPlanLabel = currentPlanLabel === "Aktyvus planas" ? copy.currentPlan : currentPlanLabel;
  const canChoosePlan = typeof onChoosePlan === "function";
  const HeroHeading = headingLevel === "h2" ? "h2" : "h1";

  return (
    <section className="marketing-dark relative isolate min-h-screen overflow-hidden rounded-lg px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <FloatingMarketNumbers />

      <div className="relative z-10">
      <div className="flex justify-center">
        <nav
          aria-label="StillOak Studio narystės navigacija"
          className="inline-flex w-full max-w-2xl items-center justify-between gap-1 rounded-full border border-white/10 bg-white/6 p-1 text-sm text-white/72 shadow-2xl shadow-black/18 backdrop-blur sm:w-auto sm:justify-center"
        >
          {localizedSectionNav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="min-w-0 rounded-full px-3 py-2 text-center font-semibold transition duration-200 hover:bg-white/10 hover:text-white sm:px-5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end xl:gap-12">
        <div className="min-w-0">
          <span className="hero-chip">{copy.heroChip}</span>
          <HeroHeading className="mt-6 max-w-4xl break-words font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-[4.45rem]">
            {copy.heroTitle}
          </HeroHeading>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
            {copy.heroText}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#narystes" className="button-primary min-h-[52px] gap-2">
              {copy.viewMemberships}
              <ArrowRight size={16} className="shrink-0" />
            </a>
            <a href="#funkcijos" className="hero-outline-button min-h-[52px] gap-2">
              <LayoutDashboard size={16} className="shrink-0" />
              {copy.viewZones}
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const meta = { ...(planPresentation[plan.id] || planPresentation.basic), ...(copy.planPresentation[plan.id] || {}) };
            const Icon = meta.icon;

            return (
              <div key={plan.id} className="rounded-lg border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Icon size={17} className="shrink-0" style={{ color: meta.accent }} />
                  <span className="font-display text-xl font-bold">{formatPlanPrice(plan.price, plan.intervalLabel)}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{plan.name}</p>
                <p className="mt-1 text-xs leading-5 text-white/54">{meta.comparison}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div id="funkcijos" className="mt-10 scroll-mt-28 grid gap-5 xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch">
        <DashboardPreview />

        <div id="narystes" className="scroll-mt-28 grid gap-4">
          {subscriptionPlans.map((plan) => (
            <MembershipPlanCard
              key={plan.id}
              plan={plan}
              onChoosePlan={onChoosePlan}
              canChoosePlan={canChoosePlan}
              loadingPlanId={loadingPlanId}
              currentPlanId={currentPlanId}
              joinLoadingLabel={effectiveJoinLoadingLabel}
              currentPlanLabel={effectiveCurrentPlanLabel}
            />
          ))}
        </div>
      </div>

      <MembershipKitsSection />

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const meta = { ...(planPresentation[plan.id] || planPresentation.basic), ...(copy.planPresentation[plan.id] || {}) };

          return (
            <div key={plan.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-display text-xl font-bold text-white">{plan.name}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{meta.comparison}</p>
            </div>
          );
        })}
      </div>

      <div
        id="atsiliepimai"
        className="mt-5 scroll-mt-28 rounded-lg border border-white/10 bg-[rgb(255_255_255/0.055)] px-4 py-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <p className="text-sm font-semibold leading-6 text-white/78">{copy.trustLine}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/56">
            {copy.trustPills.map((pill) => (
              <span key={pill} className="rounded-full border border-white/10 px-3 py-1">{pill}</span>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

const DashboardPreview = () => {
  const { t } = useLanguage();
  const copy = t("pricing.dashboard");

  return (
  <div
    className="relative min-h-[560px] overflow-hidden rounded-lg border border-white/10 bg-[rgb(6_13_12)] p-4 shadow-2xl shadow-black/30 sm:p-5 lg:p-6"
    role="img"
    aria-label={copy.aria}
  >
    <div
      className="absolute inset-0 opacity-65"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(255 255 255 / 0.055) 1px, transparent 1px), linear-gradient(180deg, rgb(255 255 255 / 0.045) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "linear-gradient(180deg, black, transparent 88%)",
      }}
    />
    <div
      className="absolute inset-x-0 top-0 h-64 opacity-80"
      style={{
        background:
          "radial-gradient(circle at 16% 0%, rgb(164 220 190 / 0.22), transparent 34%), radial-gradient(circle at 84% 12%, rgb(226 202 145 / 0.16), transparent 32%)",
      }}
    />

    <div className="relative flex min-h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="hero-chip">{copy.chip}</span>
          <h2 className="mt-5 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">{copy.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
            {copy.text}
          </p>
        </div>
        <div className="w-full rounded-lg border border-white/10 bg-white/6 p-3 sm:w-52">
          <p className="text-xs font-semibold uppercase text-white/46">{copy.monthLabel}</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{copy.month}</p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-[rgb(164_220_190)]" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.075] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-white/46">{copy.summaryLabel}</p>
              <p className="mt-2 font-display text-4xl font-bold text-white">72%</p>
            </div>
            <BarChart3 size={22} style={{ color: "rgb(var(--accent-strong))" }} />
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-[rgb(248_250_246/0.95)] p-4 text-[rgb(var(--text))]">
            <svg viewBox="0 0 300 132" className="h-36 w-full" aria-hidden="true">
              <path
                d="M10 102 C 45 86, 62 92, 86 70 S 131 39, 164 52 S 210 91, 290 26"
                fill="none"
                stroke="rgb(29 84 67)"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <path
                d="M10 102 C 45 86, 62 92, 86 70 S 131 39, 164 52 S 210 91, 290 26 L290 124 L10 124 Z"
                fill="rgb(55 118 94 / 0.13)"
              />
              {[42, 86, 139, 205, 290].map((x) => (
                <circle
                  key={x}
                  cx={x}
                  cy={x === 290 ? 26 : x === 205 ? 84 : x === 139 ? 44 : x === 86 ? 70 : 90}
                  r="5"
                  fill="rgb(164 220 190)"
                />
              ))}
            </svg>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {copy.metrics.map((item, index) => (
                <div key={item} className="rounded-lg bg-[rgb(var(--surface-soft))] px-3 py-2">
                  <p className="text-xs font-semibold text-muted">{item}</p>
                  <p className="mt-1 font-display text-lg font-bold">{[2480, 1240, 860][index]} €</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {copy.cards.map((card, index) => {
            const Icon = dashboardCardIcons[index] || WalletCards;
            const progress = dashboardCardProgress[index] || 60;

            return (
              <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-white">{card.label}</p>
                    <p className="mt-2 font-display text-2xl font-bold leading-tight text-white">{card.value}</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">{card.note}</p>
                  </div>
                  <Icon size={18} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, rgb(var(--accent-strong)), rgb(226 202 145 / 0.86))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {copy.zones.map((item, index) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-3">
            <p className="text-xs font-semibold uppercase text-white/42">{t("pricing.dashboard.zoneLabel", { number: index + 1 })}</p>
            <p className="mt-1 text-sm font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

const MembershipKitsSection = () => {
  const { t } = useLanguage();
  const copy = t("pricing.kits");

  return (
  <div id="rinkiniai" className="mt-10 scroll-mt-28">
    <div className="mx-auto max-w-4xl text-center">
      <span className="hero-chip">{copy.chip}</span>
      <h2 className="mt-5 break-words font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
        {copy.title}
      </h2>
      <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
        {copy.text}
      </p>
    </div>

    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      {copy.items.map((kit, index) => {
        const Icon = kitIcons[index] || WalletCards;
        const isBusiness = index === 2;

        return (
          <article
            key={kit.title}
            className="relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-5 text-white shadow-2xl shadow-black/18"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-80"
              style={{
                background: isBusiness
                  ? "radial-gradient(circle at 72% 0%, rgb(226 202 145 / 0.22), transparent 55%)"
                  : "radial-gradient(circle at 72% 0%, rgb(185 130 58 / 0.18), transparent 55%)",
              }}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[rgb(226_202_145/0.28)] bg-[rgb(226_202_145/0.11)] text-[rgb(226_202_145)]">
                  <Icon size={22} />
                </div>
                <span className="rounded-full border border-[rgb(226_202_145/0.24)] bg-[rgb(226_202_145/0.1)] px-3 py-1 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(244_224_174)]">
                  {kit.planLabel}
                </span>
              </div>

              <h3 className="mt-5 break-words font-display text-2xl font-bold leading-tight text-white">{kit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{kit.subtitle}</p>

              <div className="mt-5 grid gap-2">
                {kit.included.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-white/8 bg-black/10 px-3 py-2.5">
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-[rgb(226_202_145)]" />
                    <span className="text-sm leading-6 text-white/76">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>

    <div className="mt-7 flex justify-center">
      <a href="#narystes" className="button-primary min-h-[52px] gap-2">
        {copy.choosePlan}
        <ArrowRight size={16} className="shrink-0" />
      </a>
    </div>
  </div>
  );
};

const MembershipPlanCard = ({
  plan,
  onChoosePlan,
  canChoosePlan,
  loadingPlanId,
  currentPlanId,
  joinLoadingLabel,
  currentPlanLabel,
}) => {
  const { t } = useLanguage();
  const pricingCopy = t("pricing");
  const meta = { ...(planPresentation[plan.id] || planPresentation.basic), ...(pricingCopy.planPresentation[plan.id] || {}) };
  const Icon = meta.icon;
  const isFeatured = plan.id === "personal";
  const isPrivate = plan.id === "private_business";
  const isCurrentPlan = currentPlanId === plan.id;
  const ActionIcon = plan.provider === "stripe" ? CreditCard : ArrowRight;

  const cardStyle = isFeatured
    ? {
        borderColor: "rgb(164 220 190 / 0.48)",
        background:
          "linear-gradient(135deg, rgb(16 32 27 / 0.98), rgb(31 68 54 / 0.92) 58%, rgb(11 18 17 / 0.98))",
        boxShadow: "0 26px 70px rgb(0 0 0 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.1)",
      }
    : isPrivate
      ? {
          borderColor: "rgb(226 202 145 / 0.36)",
          background:
            "linear-gradient(135deg, rgb(10 18 16 / 0.98), rgb(30 31 24 / 0.96) 62%, rgb(9 14 13 / 0.98))",
          boxShadow: "0 24px 64px rgb(0 0 0 / 0.3), inset 0 1px 0 rgb(255 255 255 / 0.08)",
        }
      : {
          borderColor: "rgb(255 255 255 / 0.1)",
          background: "linear-gradient(180deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0.035))",
        };

  const actionClass = isFeatured
    ? "bg-white text-[rgb(16,31,27)] shadow-lg shadow-black/18"
    : isPrivate
      ? "bg-[rgb(226_202_145)] text-[rgb(18,22,18)] shadow-lg shadow-black/20"
      : "border border-white/12 bg-white/7 text-white";

  const actionContent =
    loadingPlanId === plan.id ? (
      joinLoadingLabel
    ) : isCurrentPlan ? (
      currentPlanLabel
    ) : (
      <>
        <ActionIcon size={16} className="shrink-0" />
        <span>{meta.cta}</span>
      </>
    );

  return (
    <article className="relative flex h-full flex-col rounded-lg border p-5 text-white" style={cardStyle}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="hero-chip">{meta.eyebrow}</span>
            {(isFeatured || isPrivate) && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isPrivate
                    ? "border-[rgb(226_202_145/0.34)] bg-[rgb(226_202_145/0.12)] text-[rgb(244_224_174)]"
                    : "border-[rgb(164_220_190/0.34)] bg-[rgb(164_220_190/0.12)] text-[rgb(194_239_211)]"
                }`}
              >
                {plan.badge}
              </span>
            )}
          </div>
          <h3 className="mt-5 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">{plan.name}</h3>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/7">
          <Icon size={20} style={{ color: meta.accent }} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/66">{plan.description}</p>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-[rgb(226_202_145/0.22)] bg-[rgb(226_202_145/0.09)] px-3 py-2.5">
        <Sparkles size={16} className="shrink-0 text-[rgb(226_202_145)]" />
        <span className="text-sm font-semibold leading-6 text-[rgb(244_224_174)]">Įtraukta: {meta.kitName}</span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="font-display text-4xl font-bold leading-none sm:text-5xl">
          {formatPlanPrice(plan.price, plan.intervalLabel)}
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.055] px-3 py-2.5">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: meta.accent }} />
            <span className="min-w-0 text-sm leading-6 text-white/76">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-5">
        {canChoosePlan ? (
          <button
            type="button"
            onClick={() => onChoosePlan(plan)}
            disabled={loadingPlanId === plan.id || isCurrentPlan}
            className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${actionClass}`}
          >
            {actionContent}
          </button>
        ) : (
          <Link
            to="/pricing"
            className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${actionClass}`}
          >
            {actionContent}
          </Link>
        )}
      </div>
    </article>
  );
};

export default MembershipPricingShowcase;
