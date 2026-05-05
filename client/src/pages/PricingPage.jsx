import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { subscriptionPlans } from "../constants/subscriptionPlans";
import billingService from "../services/billingService";

const formatPlanPrice = (value) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const pricingCopy = {
  lt: {
    pills: [
      "Pilna nario erdvė",
      "Mėnesinės suvestinės",
      "Tikslų ir progreso kortelės",
      "Pilnos nario naujienos",
    ],
    eyebrow: "Narystė",
    title: "Pasirink narystę, kuri ramiai palaiko tavo mėnesį",
    intro:
      "Bazinis suteikia aiškų pradžios sluoksnį. Asmeninis atveria pilną nario patirtį. Privatus verslas skirtas projektams, prioritetui ir gilesnei atramai.",
    joinLoading: "Jungiama...",
    currentPlan: "Aktyvus planas",
    continueStripe: "Tęsti į saugų apmokėjimą",
    enterGuest: "Pasirinkti Bazinį",
    compareEyebrow: "Kas skiriasi",
    compareTitle: "Trys aiškūs lygiai. Viena ramesnė sistema.",
    compareIntro:
      "Bazinis skirtas pradžiai. Asmeninis tinka nuosekliam asmeniniam ritmui. Privatus verslas prideda verslo sluoksnį ir prioritetą.",
    compare: [
      {
        label: "Bazinis",
        title: "Ramus pagrindas",
        text: "Pagrindinė nario erdvė, mėnesio apžvalga, riboti skaitmeniniai resursai ir aiškus būdas pradėti.",
      },
      {
        label: "Asmeninis",
        title: "Pilna asmeninė patirtis",
        text: "Pilna nario erdvė, mėnesinės suvestinės, tikslų kortelės, nario naujienos ir premium skaitmeniniai resursai.",
      },
      {
        label: "Privatus verslas",
        title: "Verslui ir projektams",
        text: "Verslo skydelis, prioritetinė pagalba, šablonai, premium patirtis ir individualios rekomendacijos, kai jos paruoštos.",
      },
    ],
    memberEyebrow: "Ką gauni",
    memberTitle: "Narystė suteikia aiškesnį mėnesį, ne tik uždarą zoną",
    memberText:
      "Stilloak sujungia privačią darbo erdvę, archyvą, suvestines ir nuoseklią nario patirtį nuo apmokėjimo iki kasdienio naudojimo.",
    memberSignals: [
      "Po apmokėjimo iškart aktyvuojama nario prieiga",
      "Visos suvestinės ir sąskaitos lieka privačiame archyve",
      "Mėnesio apžvalga padeda pradėti be chaoso",
      "Privatus verslas suteikia daugiau prioriteto ir verslo resursų",
    ],
    circleSummaryTitle: "Asmeninis ritmas",
    circleSummaryText: "Pilna Stilloak nario erdvė aiškesniam mėnesio valdymui.",
    privateSummaryTitle: "Privatus verslas",
    privateSummaryText: "Daugiau prioriteto, verslo resursų ir premium patirties.",
    previewCta: "Peržiūrėti Stilloak",
    storyCta: "Skaityti istoriją",
    freeToast: "Bazinis planas jau aktyvus tavo paskyrai.",
    sessionError: "Nepavyko paruošti saugaus apmokėjimo.",
  },
  en: {
    pills: [
      "Full Stilloak access",
      "Monthly summaries",
      "Goal and progress cards",
      "Private member archive",
      "Premium digital resources",
    ],
    eyebrow: "Membership",
    title: "Choose the membership that gives your month more clarity",
    intro:
      "Bazinis gives you the foundation. Asmeninis opens the full member experience. Privatus verslas is built for projects, priority, and business resources.",
    joinLoading: "Connecting...",
    currentPlan: "Current plan",
    continueStripe: "Start secure checkout",
    enterGuest: "Choose Bazinis",
    compareEyebrow: "What changes",
    compareTitle: "Three clear paths. One calmer month.",
    compareIntro:
      "Bazinis is the foundation. Asmeninis supports regular personal use. Privatus verslas adds a business layer and priority support.",
    compare: [
      {
        label: "Bazinis",
        title: "A calm foundation",
        text: "Basic member area, monthly overview, limited digital resources, member news previews, and cancel anytime.",
      },
      {
        label: "Asmeninis",
        title: "The full personal experience",
        text: "Full member area, monthly summaries, progress cards, member news, premium resources, and early product access.",
      },
      {
        label: "Privatus verslas",
        title: "For business and projects",
        text: "Business dashboard, priority support, business templates, premium experience, and recommendations when available.",
      },
    ],
    memberEyebrow: "What you get",
    memberTitle: "Membership unlocks a clearer month, not just a closed area",
    memberText:
      "Stilloak brings together a private workspace, personal archive, summaries, and a coherent member experience from payment to weekly use.",
    memberSignals: [
      "Member access activates immediately after payment",
      "Summaries and invoices stay inside a private archive",
      "The first monthly setup helps you start without chaos",
      "Privatus verslas adds more priority and business resources",
    ],
    circleSummaryTitle: "Asmeninis rhythm",
    circleSummaryText: "The full Stilloak member area for a clearer month.",
    privateSummaryTitle: "Privatus verslas",
    privateSummaryText: "More priority, business resources, and a premium experience.",
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
                    <span className="font-display text-4xl font-bold sm:text-5xl">{formatPlanPrice(plan.price)}</span>
                    <span className={`pb-1 text-sm ${isFeatured ? "text-white/56" : "text-muted"}`}>{plan.intervalLabel}</span>
                  </div>

                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
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
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Asmeninis</p>
              <p className="mt-3 font-display text-3xl font-bold">{copy.circleSummaryTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy.circleSummaryText}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Privatus verslas</p>
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
