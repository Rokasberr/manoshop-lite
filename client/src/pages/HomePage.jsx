import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { subscriptionPlans } from "../constants/subscriptionPlans";
import { useLanguage } from "../context/LanguageContext";

const getPlanPriceLabel = (planId) => {
  const plan = subscriptionPlans.find((item) => item.id === planId);

  return plan ? `${Number(plan.price || 0).toFixed(2)} €${plan.intervalLabel}` : "";
};

const homeCopy = {
  lt: {
    chip: "StillOak Studio",
    title: "StillOak Studio — nario erdvė aiškesniam mėnesiui, skaitmeniniams resursams ir verslo augimui.",
    intro:
      "Pradėk nuo Bazinio, atrakink pilną Asmeninę programą arba rinkis Privatų verslą, jei nori aukštesnio lygio strateginės erdvės.",
    primaryCta: "Peržiūrėti narystes",
    secondaryCta: "Pamatyti kaip atrodo viduje",
    trustLine: "Saugus apmokėjimas · Atšauk bet kada · Jokių paslėptų mokesčių",
    heroPreviewTitle: "Trys nario erdvės",
    heroPreviewText: "Nuo paprasto mėnesio starto iki pilnos programos ir strateginio verslo sluoksnio.",
    planEyebrow: "Narystės",
    planTitle: "Pasirink pagal etapą",
    planIntro:
      "Trumpa planų peržiūra padeda suprasti kryptį. Detalesnį funkcijų turą gali atsidaryti nario zonos puslapyje.",
    planCards: [
      {
        id: "free",
        label: "Bazinis",
        badge: "Pradžiai",
        description: "Lengva pradžia mėnesio planui ir baziniams resursams.",
        benefits: ["Mini biudžeto peržiūra", "Mėnesio fokusas", "Bazinių resursų biblioteka"],
        cta: "Pradėti nuo Bazinio",
        icon: WalletCards,
      },
      {
        id: "circle",
        label: "Asmeninis",
        badge: "Rekomenduojama",
        description: "Pilna nario programa aiškesniam mėnesio ritmui.",
        benefits: ["Pilna nario zona", "Mėnesio suvestinės", "Tikslų progreso kortelės", "Nario naujienos"],
        cta: "Rinktis Asmeninį",
        featured: true,
        icon: Target,
      },
      {
        id: "private",
        label: "Privatus verslas",
        badge: "Premium",
        description: "Strateginė verslo erdvė aukštesnio lygio augimui.",
        benefits: ["Strategijos lenta", "Pasiūlymo aiškumas", "Svetainės auditas", "30 dienų augimo planas"],
        cta: "Rinktis Privatų verslą",
        premium: true,
        icon: BriefcaseBusiness,
      },
    ],
    previewEyebrow: "Kaip atrodo viduje",
    previewTitle: "Trumpas žvilgsnis į nario zonas",
    previewIntro:
      "Čia tik teaseris: keli paviršiai, kad pajustum skirtumą tarp planų. Pilnas turas laukia atskirame nario zonos puslapyje.",
    previewCta: "Pamatyti nario zonas",
    previews: [
      {
        id: "free",
        label: "Bazinis",
        text: "Pamatyk mėnesio pradžios planą, mini biudžeto bloką ir savaitės veiksmą.",
        highlights: ["Mėnesio fokusas", "Mini biudžetas", "Savaitės veiksmas"],
        metrics: ["3 veiksmai", "Likutis", "Tikslas"],
      },
      {
        id: "circle",
        label: "Asmeninis",
        text: "Peržiūrėk pilnos nario programos suvestines, tikslų korteles ir Nario naujienas.",
        highlights: ["Suvestinės", "Tikslų kortelės", "Nario naujienos"],
        metrics: ["Mėnuo", "Tikslai", "Archyvas"],
        featured: true,
      },
      {
        id: "private",
        label: "Privatus verslas",
        text: "Pamatyk strategijos lentą, pasiūlymo aiškumo įrankį ir verslo augimo planą.",
        highlights: ["Strategijos lenta", "Svetainės auditas", "30 dienų planas"],
        metrics: ["Auditas", "Pasiūlymas", "Augimas"],
        premium: true,
      },
    ],
    journeyEyebrow: "Kelias per planus",
    journeyTitle: "Pradėk nuo Bazinio → Pereik į Asmeninį → Augink su Privatus verslas",
    journeySteps: [
      { label: "Bazinis", text: "Pradžiai ir aiškesniam mėnesio startui" },
      { label: "Asmeninis", text: "Pilnai nario programai" },
      { label: "Privatus verslas", text: "Strategijai ir augimui" },
    ],
    trustEyebrow: "Pasitikėjimas",
    trustTitle: "Aiški narystė be spaudimo",
    trustItems: ["Saugus apmokėjimas", "Atšauk bet kada", "Aiškūs planų skirtumai", "Jokių paslėptų mokesčių"],
    finalTitle: "Pasirink planą pagal savo etapą.",
    finalText: "Peržiūrėk kainas arba atsidaryk trumpą nario zonų turą prieš pasirinkdamas planą.",
  },
  en: {
    chip: "StillOak Studio",
    title: "StillOak Studio — a member space for a clearer month, digital resources, and business growth.",
    intro:
      "Start with Bazinis, unlock the full Asmeninis program, or choose Privatus verslas for a higher-level strategic space.",
    primaryCta: "View memberships",
    secondaryCta: "See inside",
    trustLine: "Secure payment · Cancel anytime · No hidden fees",
    heroPreviewTitle: "Three member spaces",
    heroPreviewText: "From a simple monthly start to the full program and a strategic business layer.",
    planEyebrow: "Memberships",
    planTitle: "Choose by stage",
    planIntro:
      "A short plan preview helps you understand the direction. The full feature tour lives on the member area page.",
    planCards: [
      {
        id: "free",
        label: "Bazinis",
        badge: "Start",
        description: "A light start for monthly planning and basic resources.",
        benefits: ["Mini budget review", "Monthly focus", "Basic resource library"],
        cta: "Start with Bazinis",
        icon: WalletCards,
      },
      {
        id: "circle",
        label: "Asmeninis",
        badge: "Recommended",
        description: "The full member program for a clearer monthly rhythm.",
        benefits: ["Full member area", "Monthly summaries", "Goal progress cards", "Member news"],
        cta: "Choose Asmeninis",
        featured: true,
        icon: Target,
      },
      {
        id: "private",
        label: "Privatus verslas",
        badge: "Premium",
        description: "A strategic business space for higher-level growth.",
        benefits: ["Strategy board", "Offer clarity", "Website audit", "30-day growth plan"],
        cta: "Choose Privatus verslas",
        premium: true,
        icon: BriefcaseBusiness,
      },
    ],
    previewEyebrow: "Inside preview",
    previewTitle: "A quick look at the member areas",
    previewIntro:
      "This is only a teaser: a few surfaces that show how the plans differ. The full tour waits on the member area page.",
    previewCta: "See member areas",
    previews: [
      {
        id: "free",
        label: "Bazinis",
        text: "See the monthly starter plan, mini budget block, and weekly action.",
        highlights: ["Monthly focus", "Mini budget", "Weekly action"],
        metrics: ["3 actions", "Balance", "Goal"],
      },
      {
        id: "circle",
        label: "Asmeninis",
        text: "Preview full member summaries, goal cards, and member news.",
        highlights: ["Summaries", "Goal cards", "Member news"],
        metrics: ["Month", "Goals", "Archive"],
        featured: true,
      },
      {
        id: "private",
        label: "Privatus verslas",
        text: "See the strategy board, offer clarity tool, and business growth plan.",
        highlights: ["Strategy board", "Website audit", "30-day plan"],
        metrics: ["Audit", "Offer", "Growth"],
        premium: true,
      },
    ],
    journeyEyebrow: "Plan path",
    journeyTitle: "Start with Bazinis → Move into Asmeninis → Grow with Privatus verslas",
    journeySteps: [
      { label: "Bazinis", text: "For a clearer monthly start" },
      { label: "Asmeninis", text: "For the full member program" },
      { label: "Privatus verslas", text: "For strategy and growth" },
    ],
    trustEyebrow: "Trust",
    trustTitle: "Clear membership without pressure",
    trustItems: ["Secure payment", "Cancel anytime", "Clear plan differences", "No hidden fees"],
    finalTitle: "Choose the plan for your stage.",
    finalText: "Review pricing or open the short member area tour before choosing.",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  homeCopy[languageCode] = homeCopy.en;
});

const HomePage = () => {
  const { language } = useLanguage();
  const copy = homeCopy[language] || homeCopy.lt;

  return (
    <div className="space-y-10 pb-8">
      <section className="marketing-dark overflow-hidden rounded-lg px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="min-w-0">
            <span className="hero-chip">{copy.chip}</span>
            <h1 className="mt-7 max-w-5xl break-words font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-[4.2rem]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/74 sm:text-lg">{copy.intro}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/pricing" className="button-primary min-h-[52px] gap-2">
                {copy.primaryCta}
                <ArrowRight size={16} className="shrink-0" />
              </Link>
              <Link to="/savings-studio" className="hero-outline-button min-h-[52px]">
                {copy.secondaryCta}
              </Link>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/72">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <span>{copy.trustLine}</span>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/6 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-white/46">{copy.heroPreviewTitle}</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/66">{copy.heroPreviewText}</p>
              </div>
              <Sparkles size={18} className="shrink-0 text-white/54" />
            </div>

            <FinanceHeroVisual />

            <div className="mt-5 grid gap-3">
              {copy.planCards.map((plan) => (
                <HeroPlanStrip key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">{copy.planEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.planTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.planIntro}</p>
          </div>
          <Link to="/pricing" className="button-secondary min-h-[52px] gap-2">
            {copy.primaryCta}
            <ArrowRight size={16} className="shrink-0" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {copy.planCards.map((plan) => (
            <MembershipTeaserCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.previewEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.previewTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.previewIntro}</p>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-3">
          {copy.previews.map((preview) => (
            <InsidePreview key={preview.id} preview={preview} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/savings-studio" className="button-primary min-h-[52px] gap-2">
            {copy.previewCta}
            <ArrowRight size={16} className="shrink-0" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="surface-dark rounded-lg px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.journeyEyebrow}</span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.journeyTitle}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.journeySteps.map((step, index) => (
            <div key={step.label} className="marketing-card p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)] text-sm font-bold text-[rgb(var(--accent-strong))]">
                {index + 1}
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold leading-tight">{step.label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <span className="eyebrow">{copy.trustEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.trustTitle}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.trustItems.map((item) => (
              <div key={item} className="soft-card rounded-lg px-5 py-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span className="text-sm font-semibold leading-6 text-muted">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-dark rounded-lg px-6 py-9 text-center sm:px-8">
        <span className="hero-chip">{copy.planEyebrow}</span>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          {copy.finalTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68">{copy.finalText}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/pricing" className="button-primary min-h-[52px] gap-2">
            {copy.primaryCta}
            <ArrowRight size={16} className="shrink-0" />
          </Link>
          <Link to="/savings-studio" className="hero-outline-button min-h-[52px]">
            {copy.previewCta}
          </Link>
        </div>
      </section>
    </div>
  );
};

const HeroPlanStrip = ({ plan }) => {
  const Icon = plan.icon;

  return (
    <div className={`rounded-lg border px-4 py-3 ${plan.featured ? "bg-white text-[rgb(var(--text))]" : "bg-white/5 text-white"}`} style={{ borderColor: plan.featured ? "rgb(255 255 255 / 0.36)" : "rgb(255 255 255 / 0.1)" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Icon size={17} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{plan.label}</p>
            <p className={`mt-0.5 truncate text-xs ${plan.featured ? "text-muted" : "text-white/56"}`}>{plan.badge}</p>
          </div>
        </div>
        <span className="shrink-0 font-display text-lg font-bold">{getPlanPriceLabel(plan.id)}</span>
      </div>
    </div>
  );
};

const FinanceHeroVisual = () => (
  <div
    className="relative mt-6 overflow-hidden rounded-lg border border-white/10 bg-[rgb(8_16_14/0.92)] p-4 sm:p-5"
    role="img"
    aria-label="Premium StillOak Studio dashboard teaser with finance planning, goals, member news, and strategy board preview cards"
  >
    <div
      className="absolute inset-0 opacity-70"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(180deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
        maskImage: "linear-gradient(180deg, black, transparent 92%)",
      }}
    />
    <div
      className="absolute inset-x-0 top-0 h-48 opacity-80"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgb(255 230 179 / 0.2), transparent 34%), linear-gradient(135deg, rgb(164 220 190 / 0.2), transparent 48%), linear-gradient(180deg, rgb(255 236 198 / 0.12), transparent)",
      }}
    />

    <div className="relative">
      <div className="rounded-lg border border-white/12 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="rounded-lg border border-white/10 bg-[rgb(248_250_246/0.96)] p-3 text-[rgb(var(--text))] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase text-muted">StillOak dashboard</p>
              <h3 className="mt-1 font-display text-2xl font-bold leading-tight">Aiškesnis mėnesio vaizdas</h3>
            </div>
            <span className="signal-pill w-fit shrink-0">Member preview</span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="rounded-lg bg-[rgb(var(--surface-soft))] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">Mėnesio apžvalga</p>
                  <p className="mt-2 font-display text-3xl font-bold">72%</p>
                </div>
                <BarChart3 size={20} style={{ color: "rgb(var(--accent-strong))" }} />
              </div>

              <div className="mt-5 h-32 rounded-lg bg-white p-3">
                <svg viewBox="0 0 240 110" className="h-full w-full" aria-hidden="true">
                  <path
                    d="M8 88 C 44 70, 54 78, 82 56 S 128 32, 158 46 S 194 72, 232 22"
                    fill="none"
                    stroke="rgb(29 84 67)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 88 C 44 70, 54 78, 82 56 S 128 32, 158 46 S 194 72, 232 22 L232 104 L8 104 Z"
                    fill="rgb(55 118 94 / 0.12)"
                  />
                  {[28, 82, 132, 188, 232].map((x) => (
                    <circle key={x} cx={x} cy={x === 232 ? 22 : x === 188 ? 64 : x === 132 ? 38 : x === 82 ? 56 : 78} r="4" fill="rgb(164 220 190)" />
                  ))}
                </svg>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Mini biudžeto peržiūra", value: "Likutis", icon: WalletCards },
                { title: "Tikslai ir progresas", value: "3 tikslai", icon: Target },
                { title: "Nario naujienos", value: "Preview", icon: FileText },
                { title: "Strategijos lenta", value: "30 dienų", icon: BriefcaseBusiness },
              ].map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.title} className="rounded-lg border border-[rgb(var(--line)/0.74)] bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-5 text-muted">{card.title}</p>
                        <p className="mt-2 font-display text-xl font-bold leading-tight">{card.value}</p>
                      </div>
                      <Icon size={17} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[rgb(var(--surface-soft))]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: card.title === "Strategijos lenta" ? "86%" : card.title === "Nario naujienos" ? "62%" : "74%",
                          background:
                            "linear-gradient(90deg, rgb(var(--accent-strong)), rgb(202 165 98 / 0.82))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[rgb(var(--line)/0.74)] bg-white p-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Bazinis", "Mėnesio fokusas"],
                ["Asmeninis", "Pilna nario zona"],
                ["Privatus", "Strateginis augimas"],
              ].map(([tier, label]) => (
                <div key={tier} className="rounded-lg bg-[rgb(var(--surface-soft))] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase text-muted">{tier}</p>
                  <p className="mt-1 truncate text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MembershipTeaserCard = ({ plan }) => {
  const Icon = plan.icon;

  return (
    <article
      className={`flex h-full flex-col rounded-lg border p-6 ${
        plan.featured ? "plan-shell-featured lg:-translate-y-2" : plan.premium ? "surface-dark" : "marketing-card"
      }`}
      style={plan.premium ? { borderColor: "rgb(255 255 255 / 0.12)" } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={plan.featured || plan.premium ? "hero-chip" : "signal-pill"}>{plan.badge}</span>
          <h3 className="mt-5 break-words font-display text-3xl font-bold leading-tight">{plan.label}</h3>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${plan.featured || plan.premium ? "bg-white/8" : "bg-[rgb(var(--surface-soft))]"}`}>
          <Icon size={20} style={{ color: "rgb(var(--accent-strong))" }} />
        </div>
      </div>

      <p className={`mt-4 text-sm leading-7 ${plan.featured || plan.premium ? "text-white/70" : "text-muted"}`}>{plan.description}</p>
      <p className={`mt-6 font-display text-3xl font-bold ${plan.featured || plan.premium ? "text-white" : ""}`}>
        {getPlanPriceLabel(plan.id)}
      </p>

      <div className="mt-6 space-y-3">
        {plan.benefits.map((benefit) => (
          <div key={benefit} className={`flex items-start gap-3 text-sm leading-6 ${plan.featured || plan.premium ? "text-white/76" : "text-muted"}`}>
            <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-7">
        <Link to="/pricing" className={`min-h-[52px] w-full ${plan.featured || plan.premium ? "hero-outline-button" : "button-primary"}`}>
          {plan.cta}
        </Link>
      </div>
    </article>
  );
};

const InsidePreview = ({ preview }) => (
  <article className={`rounded-lg border p-5 ${preview.featured ? "plan-shell-featured" : preview.premium ? "surface-dark" : "marketing-card"}`} style={preview.premium ? { borderColor: "rgb(255 255 255 / 0.12)" } : undefined}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className={preview.featured || preview.premium ? "hero-chip" : "signal-pill"}>{preview.label}</span>
        <p className={`mt-4 text-sm leading-7 ${preview.featured || preview.premium ? "text-white/70" : "text-muted"}`}>{preview.text}</p>
      </div>
      {preview.featured ? <Sparkles size={18} className="shrink-0" /> : preview.premium ? <BriefcaseBusiness size={18} className="shrink-0" /> : <LayoutDashboard size={18} className="shrink-0 text-muted" />}
    </div>

    <PreviewMockup preview={preview} />

    <div className="mt-5 grid gap-3">
      {preview.highlights.map((item) => (
        <div key={item} className={`rounded-lg px-4 py-3 text-sm font-semibold ${preview.featured || preview.premium ? "bg-white/6 text-white/76" : "bg-[rgb(var(--surface-soft))] text-muted"}`}>
          {item}
        </div>
      ))}
    </div>
  </article>
);

const PreviewMockup = ({ preview }) => (
  <div className={`mt-6 rounded-lg border p-4 ${preview.featured || preview.premium ? "border-white/10 bg-white/6" : "bg-[rgb(var(--surface-soft))]"}`} style={!preview.featured && !preview.premium ? { borderColor: "rgb(var(--line) / 0.82)" } : undefined}>
    <div className="flex items-center justify-between gap-3">
      <div className={`h-2.5 w-24 rounded-full ${preview.featured || preview.premium ? "bg-white/28" : "bg-[rgb(var(--line))]"}`} />
      <div className={`h-7 w-7 rounded-lg ${preview.featured || preview.premium ? "bg-white/12" : "bg-white"}`} />
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
      {preview.metrics.map((metric, index) => (
        <div key={metric} className={`rounded-lg p-3 ${preview.featured || preview.premium ? "bg-white/8" : "bg-white"}`}>
          <p className={`text-[11px] font-semibold uppercase ${preview.featured || preview.premium ? "text-white/48" : "text-muted"}`}>{metric}</p>
          <div className={`mt-3 h-2 rounded-full ${preview.featured || preview.premium ? "bg-white/14" : "bg-[rgb(var(--surface-soft))]"}`}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${54 + index * 15}%`,
                background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
              }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-4 grid gap-2">
      {[BarChart3, FileText].map((Icon, index) => (
        <div key={index} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${preview.featured || preview.premium ? "bg-white/7" : "bg-white"}`}>
          <Icon size={15} style={{ color: "rgb(var(--accent-strong))" }} />
          <div className={`h-2 flex-1 rounded-full ${preview.featured || preview.premium ? "bg-white/16" : "bg-[rgb(var(--line))]"}`} />
        </div>
      ))}
    </div>
  </div>
);

export default HomePage;
