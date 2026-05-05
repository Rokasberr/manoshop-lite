import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { subscriptionPlans } from "../constants/subscriptionPlans";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";

const formatPlanPrice = (value, intervalLabel) => `${Number(value || 0).toFixed(2)} €${intervalLabel}`;

const planVisuals = {
  free: {
    cta: "Pradėti nuo Bazinio",
    eyebrow: "Entry-level",
    highlight: "Pradžiai",
    cardClass: "plan-shell h-full",
    buttonClass: "border bg-white text-[rgb(var(--text))]",
  },
  circle: {
    cta: "Rinktis Asmeninį",
    eyebrow: "Rekomenduojama",
    highlight: "Pagrindinis pasirinkimas",
    cardClass: "plan-shell-featured h-full ring-1 ring-white/10 lg:-translate-y-3",
    buttonClass: "bg-white text-[rgb(24,31,28)] shadow-lg shadow-black/10",
  },
  private: {
    cta: "Rinktis Privatų verslą",
    eyebrow: "Aukščiausias lygis",
    highlight: "Premium",
    cardClass: "h-full overflow-hidden rounded-lg border p-6 text-white transition duration-300",
    buttonClass: "bg-white text-[rgb(16,24,21)] shadow-lg shadow-black/18",
    cardStyle: {
      borderColor: "rgb(255 255 255 / 0.14)",
      background:
        "linear-gradient(135deg, rgb(8 16 14), rgb(27 42 38) 58%, rgb(12 18 17))",
      boxShadow:
        "0 30px 78px rgb(0 0 0 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.08)",
    },
  },
};

const pricingCopy = {
  lt: {
    pills: ["Trys aiškūs planai", "Rami nario patirtis", "Aiškios ribos tarp lygių"],
    eyebrow: "Narystė",
    title: "Pasirink narystę, kuri ramiai palaiko tavo mėnesį",
    intro:
      "Bazinis yra praktiškas startas. Asmeninis yra pagrindinė pilna nario patirtis. Privatus verslas skirtas aukščiausiam prioritetui, projektams ir verslo sluoksniui.",
    trustLine: "Saugus apmokėjimas · Atšauk bet kada · Jokių paslėptų mokesčių",
    joinLoading: "Jungiama...",
    currentPlan: "Aktyvus planas",
    compareEyebrow: "Planų palyginimas",
    compareTitle: "Aiškiai matai, kam skirtas kiekvienas lygis",
    compareIntro:
      "Kiekvienas planas turi savo vaidmenį: nuo paprasto starto iki pilnos asmeninės sistemos ir premium verslo patirties.",
    compareLabels: {
      purpose: "Kam skirtas?",
      included: "Kas įeina?",
      value: "Kodėl verta rinktis?",
      nextUnlock: "Ką atrakina aukštesnis planas?",
    },
    compare: [
      {
        id: "free",
        label: "Bazinis",
        title: "Ramus startas už 5.99 €/mėn.",
        purpose: "Nariui, kuris nori pradėti su aiškia mėnesio kryptimi ir paprastais įrankiais.",
        included: "Pagrindinė nario erdvė, mėnesio apžvalga, riboti resursai ir nario naujienų peržiūros.",
        value: "Padeda pajudėti be didelio įsipareigojimo ir iškart suteikia praktinį pradžios sluoksnį.",
        nextUnlock: "Asmeninis atrakina pilnas suvestines, tikslų korteles, naujienų archyvą ir premium resursus.",
      },
      {
        id: "circle",
        label: "Asmeninis",
        title: "Pilna asmeninė nario patirtis",
        purpose: "Nariui, kuris nori nuosekliai valdyti mėnesį, tikslus ir asmeninį finansų ritmą.",
        included: "Pilna nario erdvė, mėnesinės suvestinės, progreso kortelės, pilnos naujienos ir premium resursai.",
        value: "Tai pagrindinis planas, kuriame Stilloak tampa kasmėnesine sistema, ne tik pradžios peržiūra.",
        nextUnlock: "Privatus verslas atrakina verslo skydelį, prioritetą, verslo šablonus ir premium verslo sluoksnį.",
      },
      {
        id: "private",
        label: "Privatus verslas",
        title: "Premium lygis projektams",
        purpose: "Verslui, savarankiškiems projektams arba nariui, kuriam reikia daugiau prioriteto ir struktūros.",
        included: "Viskas iš Asmeninio plano, verslo skydelis, prioritetinė pagalba, šablonai ir premium patirtis.",
        value: "Suteikia aukščiausią Stilloak sluoksnį, kai narystė turi palaikyti ne tik asmeninį, bet ir darbo ritmą.",
        nextUnlock: "Aukštesnio plano nėra; tai pilniausias narystės lygis su prioritetu ir verslo resursais.",
      },
    ],
    memberEyebrow: "Pasitikėjimas",
    memberTitle: "Narystė turi jaustis aiški prieš pasirenkant",
    memberText:
      "Planai atskirti taip, kad Bazinis jaustųsi naudingas, Asmeninis aiškiai pagrindinis, o Privatus verslas matomai premium.",
    memberSignals: [
      "Po apmokėjimo iškart aktyvuojama nario prieiga",
      "Planai turi aiškias ribas ir skirtingą vertę",
      "Aukštesni planai atrakina daugiau, bet Bazinis nelieka tuščias",
      "Privatus verslas suteikia daugiau prioriteto ir verslo resursų",
    ],
    circleSummaryTitle: "Asmeninis",
    circleSummaryText: "Rekomenduojamas planas pilnai Stilloak nario patirčiai.",
    privateSummaryTitle: "Privatus verslas",
    privateSummaryText: "Aukščiausias lygis su prioritetu ir verslo sluoksniu.",
    previewCta: "Peržiūrėti Stilloak",
    storyCta: "Skaityti istoriją",
    freeToast: "Bazinis planas jau aktyvus tavo paskyrai.",
    sessionError: "Nepavyko paruošti saugaus apmokėjimo.",
  },
  en: {
    pills: ["Three clear plans", "Calm member experience", "Clear tier boundaries"],
    eyebrow: "Membership",
    title: "Choose the membership that gives your month more clarity",
    intro:
      "Bazinis is a practical starting point. Asmeninis is the main full member experience. Privatus verslas is built for priority, projects, and business resources.",
    trustLine: "Secure payment · Cancel anytime · No hidden fees",
    joinLoading: "Connecting...",
    currentPlan: "Current plan",
    compareEyebrow: "Plan comparison",
    compareTitle: "See exactly what each tier is for",
    compareIntro:
      "Each plan has a clear role: from a simple starting layer to the full personal system and premium business experience.",
    compareLabels: {
      purpose: "Who is it for?",
      included: "What is included?",
      value: "Why choose it?",
      nextUnlock: "What does the higher plan unlock?",
    },
    compare: [
      {
        id: "free",
        label: "Bazinis",
        title: "A calm start for 5.99 €/mo.",
        purpose: "For members who want a clear monthly direction and simple starting tools.",
        included: "Basic member area, monthly overview, limited resources, and member-news previews.",
        value: "Helps you begin without a large commitment while still giving useful entry-level value.",
        nextUnlock: "Asmeninis unlocks full summaries, goal cards, the news archive, and premium resources.",
      },
      {
        id: "circle",
        label: "Asmeninis",
        title: "The full personal experience",
        purpose: "For members who want a consistent monthly rhythm, summaries, goals, and premium resources.",
        included: "Full member area, monthly summaries, progress cards, full news, and premium resources.",
        value: "The main Stilloak plan for a complete monthly system, not just a starting preview.",
        nextUnlock: "Privatus verslas unlocks the business dashboard, priority, templates, and premium business layer.",
      },
      {
        id: "private",
        label: "Privatus verslas",
        title: "Premium tier for projects",
        purpose: "For business use, independent projects, or members who need more priority and structure.",
        included: "Everything in Asmeninis, business dashboard, priority support, templates, and premium experience.",
        value: "The highest Stilloak layer for personal rhythm plus business and project support.",
        nextUnlock: "There is no higher plan; this is the fullest membership tier with priority and business resources.",
      },
    ],
    memberEyebrow: "Trust",
    memberTitle: "Membership should feel clear before you choose",
    memberText:
      "The tiers are separated so Bazinis feels useful, Asmeninis feels clearly central, and Privatus verslas feels premium.",
    memberSignals: [
      "Member access activates immediately after payment",
      "Plans have clear boundaries and different value",
      "Higher plans unlock more while Bazinis remains useful",
      "Privatus verslas adds priority and business resources",
    ],
    circleSummaryTitle: "Asmeninis",
    circleSummaryText: "Recommended for the full Stilloak member experience.",
    privateSummaryTitle: "Privatus verslas",
    privateSummaryText: "Highest tier with priority and a business layer.",
    previewCta: "Preview Stilloak",
    storyCta: "Read the story",
    freeToast: "Bazinis is already active on your account.",
    sessionError: "Could not prepare secure checkout.",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  pricingCopy[languageCode] = pricingCopy.en;
});

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = pricingCopy[language] || pricingCopy.lt;
  const [loadingPlanId, setLoadingPlanId] = useState("");

  const handleChoosePlan = async (plan) => {
    if (!user) {
      navigate("/register", { state: { from: location.pathname, selectedPlan: plan.id } });
      return;
    }

    if (plan.id === "free") {
      toast.success(copy.freeToast);
      navigate("/profile");
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const session = await billingService.createPaymentSession({
        planId: plan.id,
        provider: "stripe",
      });

      window.location.assign(session.url);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.sessionError);
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <div className="space-y-10 pb-8">
      <section className="marketing-dark overflow-hidden rounded-lg px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:gap-10">
          <div className="min-w-0">
            <span className="hero-chip">{copy.eyebrow}</span>
            <h1 className="mt-8 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-[4.5rem]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {copy.pills.map((item) => (
                <span key={item} className="hero-chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/72">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
              <span>{copy.trustLine}</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 2xl:items-stretch">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = user?.subscription?.plan === plan.id;
              const visual = planVisuals[plan.id] || planVisuals.free;
              const isFeatured = plan.id === "circle";
              const isPrivate = plan.id === "private";
              const iconColor = isFeatured || isPrivate ? "rgb(var(--accent-strong))" : "rgb(var(--accent-strong))";

              return (
                <div key={plan.id} className={visual.cardClass} style={visual.cardStyle}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={isFeatured || isPrivate ? "hero-chip" : "signal-pill"}>{visual.eyebrow}</span>
                      <p className={`mt-4 text-xs font-semibold uppercase leading-5 ${isFeatured || isPrivate ? "text-white/56" : "text-muted"}`}>
                        {visual.highlight}
                      </p>
                    </div>
                    {isFeatured && <Sparkles size={18} className="shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />}
                    {isPrivate && <ShieldCheck size={18} className="shrink-0 text-white/56" />}
                  </div>

                  <h2 className="mt-5 break-words font-display text-4xl font-bold leading-tight">{plan.name}</h2>
                  <p className={`mt-3 text-sm leading-6 ${isFeatured || isPrivate ? "text-white/68" : "text-muted"}`}>
                    {plan.description}
                  </p>

                  <div className="mt-7">
                    <span className="break-words font-display text-4xl font-bold leading-tight sm:text-5xl">
                      {formatPlanPrice(plan.price, plan.intervalLabel)}
                    </span>
                  </div>

                  <div className="mt-7 space-y-2.5">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-3 rounded-lg px-3 py-3 text-sm leading-6 ${
                          isFeatured || isPrivate ? "bg-white/6 text-white/78" : "text-muted"
                        }`}
                        style={!isFeatured && !isPrivate ? { backgroundColor: "rgb(var(--surface-soft))" } : undefined}
                      >
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: iconColor }} />
                        <span className="min-w-0">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChoosePlan(plan)}
                    disabled={loadingPlanId === plan.id || isCurrentPlan}
                    className={`mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${visual.buttonClass}`}
                    style={!isFeatured && !isPrivate ? { borderColor: "rgb(var(--line) / 0.82)" } : undefined}
                  >
                    {loadingPlanId === plan.id ? (
                      copy.joinLoading
                    ) : isCurrentPlan ? (
                      copy.currentPlan
                    ) : plan.provider === "stripe" ? (
                      <>
                        <CreditCard size={16} className="shrink-0" />
                        <span>{visual.cta}</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} className="shrink-0" />
                        <span>{visual.cta}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">{copy.compareEyebrow}</span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.compareTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{copy.compareIntro}</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border px-4 py-4 text-sm leading-6 text-muted" style={{ borderColor: "rgb(var(--line) / 0.82)" }}>
            <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
            <span>{copy.trustLine}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.compare.map((item) => {
            const isFeatured = item.id === "circle";
            const isPrivate = item.id === "private";

            return (
              <div
                key={item.label}
                className={`p-6 ${isFeatured ? "plan-shell-featured" : isPrivate ? "marketing-dark rounded-lg" : "marketing-card"}`}
              >
                <span className={isFeatured || isPrivate ? "hero-chip" : "signal-pill"}>{item.label}</span>
                <h3 className="mt-6 font-display text-3xl font-bold leading-tight">{item.title}</h3>
                <div className="mt-6 space-y-4">
                  {["purpose", "included", "value", "nextUnlock"].map((key) => (
                    <div
                      key={key}
                      className={`rounded-lg border p-4 ${
                        isFeatured || isPrivate ? "border-white/10 bg-white/5 text-white/72" : "text-muted"
                      }`}
                      style={!isFeatured && !isPrivate ? { borderColor: "rgb(var(--line) / 0.82)", backgroundColor: "rgb(var(--surface-soft) / 0.62)" } : undefined}
                    >
                      <p className={`text-xs font-semibold uppercase ${isFeatured || isPrivate ? "text-white/54" : "text-[rgb(var(--accent-strong))]"}`}>
                        {copy.compareLabels[key]}
                      </p>
                      <p className="mt-2 text-sm leading-7">{item[key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.memberEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{copy.memberTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.memberText}</p>

          <div className="mt-8 space-y-4">
            {copy.memberSignals.map((item) => (
              <div key={item} className="soft-card rounded-lg px-5 py-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span className="text-sm leading-6 text-muted">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-dark overflow-hidden rounded-lg px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.memberEyebrow}</span>
          <h2 className="mt-6 font-display text-5xl font-bold">Stilloak</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{copy.memberText}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-xs uppercase text-white/45">Rekomenduojama</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.circleSummaryTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy.circleSummaryText}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase text-white/45">Premium</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.privateSummaryTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy.privateSummaryText}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/savings-studio" className="button-primary min-h-[52px]">
              {copy.previewCta}
            </Link>
            <Link to="/story" className="hero-outline-button min-h-[52px]">
              {copy.storyCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
