import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
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

  return plan ? `${plan.price} €${plan.intervalLabel}` : "";
};

const homeCopy = {
  lt: {
    chip: "StillOak Studio narystė",
    title: "StillOak Studio — nario erdvė aiškesniam mėnesiui, skaitmeniniams resursams ir verslo augimui.",
    intro:
      "Pasirink Bazinį startui, Asmeninį pilnai nario programai arba Privatų verslą strateginei verslo erdvei.",
    primaryCta: "Peržiūrėti narystes",
    secondaryCta: "Pamatyti kaip veikia",
    trustLine: "Saugus apmokėjimas · Atšauk bet kada · Aiškūs narystės lygiai · Jokių paslėptų mokesčių",
    heroSignals: [
      "Aiški nario erdvė mėnesio planavimui",
      "Skaitmeniniai resursai ir nario naujienos pagal planą",
      "Verslo sluoksnis strategijai ir augimo krypčiai",
    ],
    heroCards: [
      {
        label: "Startui",
        title: "Bazinis",
        text: "Paprastas įėjimas, kai nori mėnesio krypties be sudėtingos sistemos.",
      },
      {
        label: "Rekomenduojama",
        title: "Asmeninis",
        text: "Pilna nario programa su suvestinėmis, tikslais ir premium resursais.",
      },
      {
        label: "Aukščiausias lygis",
        title: "Privatus verslas",
        text: "Strateginė erdvė verslui, pasiūlymui, auditui ir 30 dienų augimo planui.",
      },
    ],
    explanationEyebrow: "Trys aiškūs lygiai",
    explanationTitle: "Kiekvienas planas turi savo vaidmenį",
    explanationIntro:
      "StillOak Studio nėra vienas neaiškus paketas. Tai narystės laiptai nuo paprasto starto iki pilnos programos ir strateginės verslo erdvės.",
    simplePlans: [
      {
        id: "free",
        icon: WalletCards,
        label: "Bazinis",
        text: "Paprasta pradžia mėnesio planui, mini biudžeto peržiūrai ir baziniams resursams.",
      },
      {
        id: "circle",
        icon: Target,
        label: "Asmeninis",
        text: "Pilna nario programa su suvestinėmis, tikslais, Nario naujienomis ir premium resursais.",
      },
      {
        id: "private",
        icon: BriefcaseBusiness,
        label: "Privatus verslas",
        text: "Aukščiausio lygio verslo erdvė strategijai, pasiūlymo aiškumui, svetainės auditui ir 30 dienų augimo planui.",
      },
    ],
    compareEyebrow: "Planų pasirinkimas",
    compareTitle: "Kuris planas tinka dabar?",
    compareIntro:
      "Jei nori pradėti ramiai, rinkis Bazinį. Jei nori pilnos nario sistemos, rinkis Asmeninį. Jei auga verslas ar projektas, rinkis Privatų verslą.",
    planCards: [
      {
        id: "free",
        label: "Bazinis",
        badge: "Entry-level",
        forWhom: "Tau, jei nori paprasto starto ir aiškesnio mėnesio be didelio įsipareigojimo.",
        benefits: [
          "Mėnesio pradžios planas",
          "Mini biudžeto peržiūra",
          "Baziniai skaitmeniniai resursai",
        ],
        cta: "Pradėti nuo Bazinio",
      },
      {
        id: "circle",
        label: "Asmeninis",
        badge: "Rekomenduojama",
        forWhom: "Tau, jei nori pilnos nario programos asmeniniam mėnesio ritmui ir tikslams.",
        benefits: [
          "Pilnos mėnesio suvestinės",
          "Tikslų progreso kortelės",
          "Nario naujienos ir premium resursai",
        ],
        cta: "Rinktis Asmeninį",
        featured: true,
      },
      {
        id: "private",
        label: "Privatus verslas",
        badge: "Premium",
        forWhom: "Tau, jei reikia strateginės verslo erdvės pasiūlymui, auditui ir augimo planui.",
        benefits: [
          "Strategijos ir pasiūlymo aiškumas",
          "Svetainės auditas",
          "30 dienų augimo planas",
        ],
        cta: "Rinktis Privatų verslą",
        premium: true,
      },
    ],
    journeyEyebrow: "Narystės kelias",
    journeyTitle: "Pradėk nuo Bazinio → Pereik į Asmeninį → Augink su Privatus verslas",
    journeyText:
      "Gali pradėti nuo paprasto mėnesio plano, pereiti į pilną nario programą ir vėliau auginti verslo kryptį aukščiausiame lygyje.",
    journeySteps: [
      {
        title: "Pradėk nuo Bazinio",
        text: "Kai reikia aiškios pradžios, mini biudžeto ir bazinių resursų.",
      },
      {
        title: "Pereik į Asmeninį",
        text: "Kai nori pilnų suvestinių, tikslų, naujienų ir premium turinio.",
      },
      {
        title: "Augink su Privatus verslas",
        text: "Kai reikia strategijos, audito ir aiškaus 30 dienų augimo plano.",
      },
    ],
    trustEyebrow: "Pasitikėjimas",
    trustTitle: "Aiškios narystės be spaudimo",
    trustText:
      "Planai atskirti taip, kad lankytojas greitai suprastų, ką gauna dabar ir kada verta pereiti į aukštesnį lygį.",
    trustItems: [
      "Saugus apmokėjimas",
      "Atšauk bet kada",
      "Aiškūs narystės lygiai",
      "Jokių paslėptų mokesčių",
    ],
  },
  en: {
    chip: "StillOak Studio membership",
    title: "StillOak Studio — a member space for a clearer month, digital resources, and business growth.",
    intro:
      "Choose Bazinis for a simple start, Asmeninis for the full member program, or Privatus verslas for a strategic business space.",
    primaryCta: "View memberships",
    secondaryCta: "See how it works",
    trustLine: "Secure payment · Cancel anytime · Clear membership levels · No hidden fees",
    heroSignals: [
      "Clear member space for monthly planning",
      "Digital resources and member news by plan",
      "Business layer for strategy and growth direction",
    ],
    heroCards: [
      {
        label: "Start",
        title: "Bazinis",
        text: "A simple entry point when you want monthly direction without a complex system.",
      },
      {
        label: "Recommended",
        title: "Asmeninis",
        text: "The full member program with summaries, goals, and premium resources.",
      },
      {
        label: "Highest tier",
        title: "Privatus verslas",
        text: "A strategic business space for offer clarity, audits, and a 30-day growth plan.",
      },
    ],
    explanationEyebrow: "Three clear levels",
    explanationTitle: "Each plan has a clear role",
    explanationIntro:
      "StillOak Studio is not one vague package. It is a membership ladder from a simple start to a full program and a strategic business space.",
    simplePlans: [
      {
        id: "free",
        icon: WalletCards,
        label: "Bazinis",
        text: "A simple start for monthly planning, mini budget review, and basic resources.",
      },
      {
        id: "circle",
        icon: Target,
        label: "Asmeninis",
        text: "The full member program with summaries, goals, member news, and premium resources.",
      },
      {
        id: "private",
        icon: BriefcaseBusiness,
        label: "Privatus verslas",
        text: "The highest-level business space for strategy, offer clarity, website audit, and a 30-day growth plan.",
      },
    ],
    compareEyebrow: "Plan choice",
    compareTitle: "Which plan fits now?",
    compareIntro:
      "Choose Bazinis to start calmly, Asmeninis for the full member system, and Privatus verslas when a business or project is growing.",
    planCards: [
      {
        id: "free",
        label: "Bazinis",
        badge: "Entry-level",
        forWhom: "For a simple start and a clearer month without a larger commitment.",
        benefits: ["Monthly starter plan", "Mini budget review", "Basic digital resources"],
        cta: "Start with Bazinis",
      },
      {
        id: "circle",
        label: "Asmeninis",
        badge: "Recommended",
        forWhom: "For the full member program for your personal monthly rhythm and goals.",
        benefits: ["Full monthly summaries", "Goal progress cards", "Member news and premium resources"],
        cta: "Choose Asmeninis",
        featured: true,
      },
      {
        id: "private",
        label: "Privatus verslas",
        badge: "Premium",
        forWhom: "For a strategic business space with offer clarity, audit, and growth planning.",
        benefits: ["Strategy and offer clarity", "Website audit", "30-day growth plan"],
        cta: "Choose Privatus verslas",
        premium: true,
      },
    ],
    journeyEyebrow: "Membership journey",
    journeyTitle: "Start with Bazinis → Move into Asmeninis → Grow with Privatus verslas",
    journeyText:
      "Start with a simple monthly plan, move into the full member program, then grow the business direction at the highest tier.",
    journeySteps: [
      {
        title: "Start with Bazinis",
        text: "For a clear beginning, mini budget, and basic resources.",
      },
      {
        title: "Move into Asmeninis",
        text: "For full summaries, goals, news, and premium content.",
      },
      {
        title: "Grow with Privatus verslas",
        text: "For strategy, audit, and a clear 30-day growth plan.",
      },
    ],
    trustEyebrow: "Trust",
    trustTitle: "Clear memberships without pressure",
    trustText:
      "The plans are separated so visitors quickly understand what they get now and when it makes sense to move up.",
    trustItems: ["Secure payment", "Cancel anytime", "Clear membership levels", "No hidden fees"],
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
      <section className="marketing-dark overflow-hidden rounded-lg px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-stretch xl:gap-12">
          <div className="min-w-0">
            <span className="hero-chip">{copy.chip}</span>
            <h1 className="mt-7 max-w-5xl break-words font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-[4.35rem]">
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

            <div className="mt-8 grid gap-3">
              {copy.heroSignals.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/76">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/72">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <span>{copy.trustLine}</span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1">
            {copy.heroCards.map((card, index) => (
              <div
                key={card.title}
                className={`rounded-lg border p-5 ${
                  index === 1 ? "bg-white text-[rgb(var(--text))]" : "bg-white/6 text-white"
                }`}
                style={{
                  borderColor: index === 1 ? "rgb(255 255 255 / 0.38)" : "rgb(255 255 255 / 0.12)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={index === 1 ? "signal-pill" : "hero-chip"}>{card.label}</span>
                  {index === 1 && <Sparkles size={18} style={{ color: "rgb(var(--accent-strong))" }} />}
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight">{card.title}</h2>
                <p className={`mt-3 text-sm leading-7 ${index === 1 ? "text-muted" : "text-white/68"}`}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.explanationEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.explanationTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.explanationIntro}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.simplePlans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div key={plan.id} className="marketing-card p-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgb(var(--surface-soft))", color: "rgb(var(--accent-strong))" }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-3xl font-bold leading-tight">{plan.label}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{plan.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">{copy.compareEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.compareTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.compareIntro}</p>
          </div>
          <Link to="/pricing" className="button-secondary min-h-[52px] gap-2">
            {copy.primaryCta}
            <ArrowRight size={16} className="shrink-0" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {copy.planCards.map((plan) => (
            <div
              key={plan.id}
              className={`flex h-full flex-col overflow-hidden rounded-lg border p-6 ${
                plan.featured
                  ? "plan-shell-featured lg:-translate-y-2"
                  : plan.premium
                    ? "surface-dark"
                    : "marketing-card"
              }`}
              style={plan.premium ? { borderColor: "rgb(255 255 255 / 0.12)" } : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className={plan.featured || plan.premium ? "hero-chip" : "signal-pill"}>{plan.badge}</span>
                  <h3 className="mt-5 break-words font-display text-3xl font-bold leading-tight">{plan.label}</h3>
                </div>
                <p className={`shrink-0 text-right font-display text-2xl font-bold ${plan.featured || plan.premium ? "text-white" : ""}`}>
                  {getPlanPriceLabel(plan.id)}
                </p>
              </div>

              <div className={`mt-5 rounded-lg p-4 ${plan.featured || plan.premium ? "bg-white/6" : "bg-[rgb(var(--surface-soft))]"}`}>
                <p className={`text-xs font-semibold uppercase ${plan.featured || plan.premium ? "text-white/54" : "text-[rgb(var(--accent-strong))]"}`}>
                  Kam skirtas?
                </p>
                <p className={`mt-2 text-sm leading-7 ${plan.featured || plan.premium ? "text-white/72" : "text-muted"}`}>
                  {plan.forWhom}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className={`flex items-start gap-3 text-sm leading-6 ${plan.featured || plan.premium ? "text-white/76" : "text-muted"}`}>
                    <CheckCircle2 size={16} className="mt-1 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <Link
                  to="/pricing"
                  className={`min-h-[52px] w-full ${plan.featured || plan.premium ? "hero-outline-button" : "button-primary"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-dark rounded-lg px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.journeyEyebrow}</span>
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.journeyTitle}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{copy.journeyText}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/pricing" className="button-primary min-h-[52px] gap-2">
              {copy.primaryCta}
              <ArrowRight size={16} />
            </Link>
            <Link to="/savings-studio" className="hero-outline-button min-h-[52px]">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {copy.journeySteps.map((step, index) => (
            <div key={step.title} className="marketing-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--accent)/0.12)] text-sm font-bold text-[rgb(var(--accent-strong))]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-bold leading-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <span className="eyebrow">{copy.trustEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.trustTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.trustText}</p>
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
    </div>
  );
};

export default HomePage;
