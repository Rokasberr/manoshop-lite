import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { subscriptionPlans } from "../constants/subscriptionPlans";
import billingService from "../services/billingService";
import { formatCurrency } from "../utils/currency";

const pricingCopy = {
  lt: {
    pills: [
      "Pilna Stilloak prieiga",
      "AI savaitinės ir mėnesinės suvestinės",
      "Privatus nario archyvas",
      "Members-only Journal",
    ],
    eyebrow: "Narystė",
    title: "Pasirink prieigos lygį, kuris atitinka tavo ritmą ir norimą kontrolės gylį",
    intro:
      "Circle ir Private nėra tiesiog kainų planai. Jie atrakina pačią Stilloak vertę: biudžetus, tikslus, recurring išlaidas, AI komentarus ir ramesnį santykį su mėnesio sprendimais.",
    joinLoading: "Jungiama...",
    currentPlan: "Dabartinis planas",
    continueStripe: "Tęsti į Stripe",
    enterGuest: "Tęsti kaip svečiui",
    compareEyebrow: "Kas skiriasi",
    compareTitle: "Kiekvienas planas turi aiškų vaidmenį, o ne tik skirtingą kainą",
    compareIntro:
      "Guest leidžia susipažinti su produktu. Circle skirtas kasdieniam naudojimui. Private prideda aukštesnį palaikymo ir premium patirties sluoksnį.",
    compare: [
      {
        label: "Guest",
        title: "Atsargus pirmas įėjimas",
        text: "Matai pasaulį, paskyros struktūrą ir membership kryptį prieš priimdamas sprendimą.",
      },
      {
        label: "Circle",
        title: "Pati svarbiausia Stilloak versija",
        text: "Pilni biudžetai, tikslai, recurring, CSV importas ir AI suvestinės žmogui, kuris nori naudoti programą realiai.",
      },
      {
        label: "Private",
        title: "Daugiau tono, palaikymo ir santykio",
        text: "Skirtas tiems, kurie nori ne tik įrankio, bet ir stipresnio premium sluoksnio bei gilesnio nario jausmo.",
      },
    ],
    memberEyebrow: "Ką perki iš tikrųjų",
    memberTitle: "Narystė perka prieigą prie aiškesnio mėnesio, ne prie uždaro klubo idėjos",
    memberText:
      "Stilloak turi atrodyti kaip tikras produkto branduolys: vienas premium dashboardas, privatūs archyvai, AI el. laiškai ir nuosekli nario patirtis nuo pirkimo iki kasdienio naudojimo.",
    memberSignals: [
      "Po apmokėjimo iškart aktyvuojama nario prieiga",
      "Visos suvestinės ir sąskaitos lieka privačiame archyve",
      "Programos logika iškart veda į pirmą mėnesio setup",
      "Private sluoksnis palieka vietos gilesnei pagalbai ir premium plėtrai",
    ],
    circleSummaryTitle: "Pilna darbo versija",
    circleSummaryText: "Visi pagrindiniai Stilloak sluoksniai vienoje nuoseklioje nario sistemoje.",
    privateSummaryTitle: "Prabangesnė nario patirtis",
    privateSummaryText: "Aukštesnis palaikymo sluoksnis, daugiau tono ir daugiau erdvės premium plėtrai.",
    previewCta: "Peržiūrėti Stilloak",
    storyCta: "Skaityti Story",
    freeToast: "Free planas jau aktyvus tavo paskyrai.",
    sessionError: "Nepavyko sukurti Stripe sesijos.",
  },
  en: {
    pills: [
      "Full Stilloak access",
      "AI weekly and monthly summaries",
      "Private member archive",
      "Members-only Journal",
    ],
    eyebrow: "Membership",
    title: "Choose the access level that matches your pace and the depth of control you want",
    intro:
      "Circle and Private are not just pricing plans. They unlock the value of Stilloak itself: budgets, goals, recurring spend, AI commentary, and a calmer relationship with monthly money decisions.",
    joinLoading: "Connecting...",
    currentPlan: "Current plan",
    continueStripe: "Continue to Stripe",
    enterGuest: "Continue as guest",
    compareEyebrow: "What changes",
    compareTitle: "Each plan should feel like a clear role, not just a different price",
    compareIntro:
      "Guest lets people explore. Circle is for real ongoing use. Private adds a more premium layer of support and relationship.",
    compare: [
      {
        label: "Guest",
        title: "A careful first entry",
        text: "See the world, the account structure, and the membership direction before committing.",
      },
      {
        label: "Circle",
        title: "The core Stilloak version",
        text: "Full budgets, goals, recurring tracking, CSV import, and AI summaries for people who want to use the product for real.",
      },
      {
        label: "Private",
        title: "More tone, support, and relationship",
        text: "For people who want not just the tool, but a deeper premium layer and stronger member feel.",
      },
    ],
    memberEyebrow: "What you are really buying",
    memberTitle: "Membership should buy access to a clearer month, not an abstract closed-club idea",
    memberText:
      "Stilloak should feel like the core product: one premium dashboard, private archives, AI emails, and a coherent member experience from purchase to weekly use.",
    memberSignals: [
      "Member access activates immediately after payment",
      "Summaries and invoices stay inside a private archive",
      "The product flow leads straight into the first monthly setup",
      "The Private layer leaves room for deeper support and premium expansion",
    ],
    circleSummaryTitle: "The full working version",
    circleSummaryText: "All core Stilloak layers inside one coherent member system.",
    privateSummaryTitle: "A more premium member experience",
    privateSummaryText: "A higher support layer, more tone, and more room for premium expansion.",
    previewCta: "Preview Stilloak",
    storyCta: "Read the story",
    freeToast: "The free plan is already active on your account.",
    sessionError: "Could not create the Stripe session.",
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
      <section className="marketing-dark overflow-hidden rounded-[40px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:gap-10">
          <div>
            <span className="hero-chip">{copy.eyebrow}</span>
            <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.9] sm:text-6xl lg:text-[4.8rem]">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = user?.subscription?.plan === plan.id;
              const isFeatured = plan.id === "circle";
              const isPaidPlan = plan.provider === "stripe";

              return (
                <div key={plan.id} className={isFeatured ? "plan-shell-featured h-full" : "plan-shell h-full"}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={isFeatured ? "hero-chip" : "signal-pill"}>{plan.badge}</span>
                    {isFeatured && <Sparkles size={16} style={{ color: "rgb(var(--accent-strong))" }} />}
                  </div>

                  <h2 className="mt-6 font-display text-4xl font-bold">{plan.name}</h2>
                  <p className={`mt-3 text-sm leading-6 ${isFeatured ? "text-white/64" : "text-muted"}`}>{plan.description}</p>

                  <div className="mt-8 flex flex-wrap items-end gap-x-2 gap-y-1">
                    <span className="font-display text-4xl font-bold sm:text-5xl">{formatCurrency(plan.price)}</span>
                    <span className={`pb-1 text-sm ${isFeatured ? "text-white/56" : "text-muted"}`}>{plan.intervalLabel}</span>
                  </div>

                  <div className="mt-8 space-y-3">
                    {plan.features.slice(0, 4).map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-3 rounded-[18px] px-3 py-3 text-sm ${isFeatured ? "bg-white/5 text-white/78" : ""}`}
                        style={!isFeatured ? { backgroundColor: "rgb(var(--surface-soft))" } : undefined}
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={isFeatured ? { color: "rgb(var(--accent-strong))" } : { color: "rgb(var(--accent-strong))" }}
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChoosePlan(plan)}
                    disabled={loadingPlanId === plan.id || isCurrentPlan}
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isFeatured ? "bg-white text-[rgb(24,20,18)]" : "border bg-white"
                    }`}
                    style={!isFeatured ? { borderColor: "rgb(var(--line) / 0.82)", color: "rgb(var(--text))" } : undefined}
                  >
                    {loadingPlanId === plan.id ? (
                      copy.joinLoading
                    ) : isCurrentPlan ? (
                      copy.currentPlan
                    ) : isPaidPlan ? (
                      <>
                        <CreditCard size={16} />
                        {copy.continueStripe}
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} />
                        {copy.enterGuest}
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
        <div className="max-w-3xl">
          <span className="eyebrow">{copy.compareEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.compareTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.compareIntro}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.compare.map((item) => (
            <div key={item.label} className="marketing-card p-6">
              <span className="signal-pill">{item.label}</span>
              <h3 className="mt-6 font-display text-3xl font-bold">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.memberEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.memberTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.memberText}</p>

          <div className="mt-8 space-y-4">
            {copy.memberSignals.map((item) => (
              <div key={item} className="soft-card rounded-[24px] px-5 py-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" style={{ color: "rgb(var(--accent-strong))" }} />
                  <span className="text-sm leading-6 text-muted">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.memberEyebrow}</span>
          <h2 className="mt-6 font-display text-5xl font-bold">Stilloak</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{copy.memberText}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Circle</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.circleSummaryTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy.circleSummaryText}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Private</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.privateSummaryTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy.privateSummaryText}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/savings-studio" className="button-primary">
              {copy.previewCta}
            </Link>
            <Link to="/story" className="hero-outline-button">
              {copy.storyCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
