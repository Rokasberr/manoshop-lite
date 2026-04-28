import { ArrowRight, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
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
    featurePills: [
      "Pilna Stilloak prieiga",
      "AI savaitinės ir mėnesinės suvestinės",
      "Privatus paskyros archyvas",
      "Members-only Journal",
      "Privatesnė pagalba",
    ],
    eyebrow: "narystė",
    title: "Pasirink Stilloak prieigos lygį, kuris tinka tavo ritmui",
    intro:
      "Narystė čia nėra techninis priedas. Ji atrakina patį produktą: Stilloak dashboardą, biudžetus, taupymo tikslus, AI suvestines ir ramesnį santykį su visa nario erdve.",
    joinLoading: "Jungiama...",
    currentPlan: "Dabartinis planas",
    continueStripe: "Tęsti į Stripe",
    enterGuest: "Tęsti kaip svečiui",
    sectionEyebrow: "nario kelias",
    sectionTitle: "Aiškus kelias nuo pricing iki pirmo mėnesio aiškumo",
    sectionIntro:
      "Pricing puslapis turi greitai atsakyti į vieną klausimą: ką realiai gaunu nusipirkęs narystę. Dėl to visa logika veda ne į abstraktų klubą, o į konkretų Stilloak įrankį ir aiškesnį finansinį vaizdą.",
    journey: [
      "Sukuri paskyrą ir pasirenki Circle arba Private",
      "Apmoki narystę per Stripe be papildomo triukšmo",
      "Atsidarai Stilloak ir susivedi pirmą mėnesio setup",
      "Gauni dashboardą, suvestines ir privatų nario archyvą",
    ],
    benefitsChip: "kodėl tai verta",
    benefitsTitle: "Geras membership puslapis turi parduoti rezultatą, ne tik planą.",
    benefitsIntro:
      "Circle skirtas žmogui, kuris nori pilnai naudotis Stilloak. Private skirtas tiems, kurie nori stipresnio palaikymo, daugiau premium sluoksnio ir aukštesnio lygio santykio su nario erdve.",
    circleTitle: "Pilnas įrankis",
    circleText: "Biudžetai, tikslai, recurring išlaidos, CSV importas ir AI suvestinės.",
    privateTitle: "Aukštesnis tonas",
    privateText: "Daugiau palaikymo, stipresnė nario patirtis ir daugiau vietos premium plėtrai.",
    productEyebrow: "pagrindinis nario produktas",
    productTitle: "Stilloak",
    productText:
      "Circle ir Private planai atrakina Stilloak: narys gali sekti išlaidas, nusistatyti biudžetus, valdyti recurring mokėjimus, importuoti CSV ir gauti AI suvestines su konkrečiu veiksmų planu.",
    previewCta: "Peržiūrėti Stilloak",
    openProfile: "Atidaryti profilį",
    backHome: "Grįžti į pradžią",
    freeToast: "Free planas jau aktyvus tavo paskyrai.",
    sessionError: "Nepavyko sukurti Stripe sesijos.",
  },
  en: {
    featurePills: [
      "Full Stilloak access",
      "AI weekly and monthly summaries",
      "Private account archive",
      "Members-only Journal",
      "Priority support",
    ],
    eyebrow: "membership",
    title: "Choose the Stilloak access level that fits your pace",
    intro:
      "Membership is not a technical add-on here. It unlocks the product itself: the Stilloak dashboard, budgets, savings goals, AI summaries, and a calmer relationship with the whole member space.",
    joinLoading: "Connecting...",
    currentPlan: "Current plan",
    continueStripe: "Continue to Stripe",
    enterGuest: "Continue as guest",
    sectionEyebrow: "member path",
    sectionTitle: "A clear path from pricing to your first month of clarity",
    sectionIntro:
      "The pricing page should answer one question quickly: what do I actually get when I buy membership? That is why the whole structure leads into a concrete tool, not an abstract club.",
    journey: [
      "Create an account and choose Circle or Private",
      "Complete membership checkout through Stripe",
      "Open Stilloak and set up your first month",
      "Receive the dashboard, summaries, and private account archive",
    ],
    benefitsChip: "why it works",
    benefitsTitle: "A strong membership page sells the result, not just the plan.",
    benefitsIntro:
      "Circle is for the person who wants the full Stilloak tool. Private is for those who want stronger support, a more premium layer, and a higher-touch member relationship.",
    circleTitle: "The full tool",
    circleText: "Budgets, goals, recurring spending, CSV import, and AI summaries.",
    privateTitle: "A higher-touch tier",
    privateText: "More support, a stronger member feel, and more room for premium expansion.",
    productEyebrow: "core member product",
    productTitle: "Stilloak",
    productText:
      "Circle and Private unlock Stilloak: members can track spending, set budgets, manage recurring payments, import CSV files, and receive AI summaries with a clear next-step plan.",
    previewCta: "Preview Stilloak",
    openProfile: "Open profile",
    backHome: "Back to homepage",
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
    <div className="space-y-10">
      <section className="public-section">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="mt-5 font-display text-5xl font-bold sm:text-6xl">{copy.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted">{copy.intro}</p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = user?.subscription?.plan === plan.id;
            const isFeatured = plan.id === "pro";
            const isPaidPlan = plan.provider === "stripe";

            return (
              <div
                key={plan.id}
                className={`overflow-hidden rounded-[30px] border p-6 transition duration-300 ${
                  isFeatured
                    ? "border-transparent bg-[linear-gradient(180deg,#0c0c14,#151522)] text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
                    : "bg-white shadow-[0_20px_60px_rgba(20,20,35,0.05)]"
                }`}
                style={!isFeatured ? { borderColor: "rgb(var(--line) / 0.85)" } : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] ${
                      isFeatured ? "bg-white/10 text-white/80" : "accent-text"
                    }`}
                    style={!isFeatured ? { backgroundColor: "rgb(var(--accent) / 0.1)" } : undefined}
                  >
                    {plan.badge}
                  </span>
                  {isFeatured && <Sparkles size={16} style={{ color: "rgb(156 131 255)" }} />}
                </div>

                <h2 className="mt-6 font-display text-3xl font-bold">{plan.name}</h2>
                <p className={`mt-3 text-sm leading-6 ${isFeatured ? "text-white/62" : "text-muted"}`}>{plan.description}</p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-display text-5xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className={`pb-2 text-sm ${isFeatured ? "text-white/62" : "text-muted"}`}>{plan.intervalLabel}</span>
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-start gap-3 rounded-[18px] px-3 py-2 text-sm ${isFeatured ? "bg-white/4 text-white/78" : ""}`}
                      style={!isFeatured ? { backgroundColor: "rgb(var(--surface-soft))" } : undefined}
                    >
                      <CheckCircle2 size={16} className="mt-0.5" style={isFeatured ? { color: "rgb(156 131 255)" } : undefined} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleChoosePlan(plan)}
                  disabled={loadingPlanId === plan.id || isCurrentPlan}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isFeatured
                      ? "bg-[linear-gradient(135deg,rgb(109,71,255),rgb(83,47,227))] text-white"
                      : "border bg-white"
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

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {copy.featurePills.map((item) => (
            <div key={item} className="marketing-mini-card flex items-center gap-3">
              <CheckCircle2 size={16} style={{ color: "rgb(var(--accent))" }} />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="public-section">
          <span className="eyebrow">{copy.sectionEyebrow}</span>
          <h2 className="mt-5 font-display text-4xl font-bold">{copy.sectionTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{copy.sectionIntro}</p>
          <div className="mt-8 space-y-4">
            {copy.journey.map((item, index) => (
              <div key={item} className="marketing-mini-card flex items-center justify-between">
                <span className="font-medium">{item}</span>
                <span className="text-sm text-muted">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">{copy.benefitsChip}</span>
          <h2 className="mt-6 max-w-xl font-display text-4xl font-bold sm:text-5xl">{copy.benefitsTitle}</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">{copy.benefitsIntro}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Circle</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.circleTitle}</p>
              <p className="mt-2 text-sm text-white/62">{copy.circleText}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Private</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.privateTitle}</p>
              <p className="mt-2 text-sm text-white/62">{copy.privateText}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">{copy.productEyebrow}</p>
            <h3 className="mt-3 font-display text-3xl font-bold">{copy.productTitle}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">{copy.productText}</p>
            <div className="mt-5">
              <Link to="/savings-studio" className="hero-outline-button">
                {copy.previewCta}
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/profile" className="button-primary">
              {copy.openProfile}
            </Link>
            <Link to="/" className="hero-outline-button">
              {copy.backHome}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
