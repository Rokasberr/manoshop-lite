import { ArrowRight, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { subscriptionPlans } from "../constants/subscriptionPlans";
import billingService from "../services/billingService";
import { formatCurrency } from "../utils/currency";

const featurePills = [
  "Full Stilloak access",
  "AI weekly and monthly summaries",
  "Private account archive",
  "Members-only Journal",
  "Priority client care",
];

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState("");

  const handleChoosePlan = async (plan) => {
    if (!user) {
      navigate("/register", { state: { from: location.pathname, selectedPlan: plan.id } });
      return;
    }

    if (plan.id === "free") {
      toast.success("Free planas jau aktyvus tavo paskyrai.");
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
      toast.error(error.response?.data?.message || "Nepavyko sukurti Stripe sesijos.");
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <div className="space-y-10">
      <section className="public-section">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">membership</span>
          <h1 className="mt-5 font-display text-5xl font-bold sm:text-6xl">Unlock the level of Stilloak access that fits your pace</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Narystė čia nėra techninis priedas. Ji atrakina patį produktą: Stilloak dashboardą, biudžetus,
            taupymo tikslus, AI suvestines ir ramesnį santykį su visa nario erdve.
          </p>
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
                      isFeatured
                        ? "bg-white/10 text-white/80"
                        : "accent-text"
                    }`}
                    style={!isFeatured ? { backgroundColor: "rgb(var(--accent) / 0.1)" } : undefined}
                  >
                    {plan.badge}
                  </span>
                  {isFeatured && <Sparkles size={16} style={{ color: "rgb(156 131 255)" }} />}
                </div>

                <h2 className="mt-6 font-display text-3xl font-bold">{plan.name}</h2>
                <p className={`mt-3 text-sm leading-6 ${isFeatured ? "text-white/62" : "text-muted"}`}>
                  {plan.description}
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-display text-5xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className={`pb-2 text-sm ${isFeatured ? "text-white/62" : "text-muted"}`}>
                    {plan.intervalLabel}
                  </span>
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-start gap-3 rounded-[18px] px-3 py-2 text-sm ${
                        isFeatured ? "bg-white/4 text-white/78" : ""
                      }`}
                      style={!isFeatured ? { backgroundColor: "rgb(var(--surface-soft))" } : undefined}
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5"
                        style={isFeatured ? { color: "rgb(156 131 255)" } : undefined}
                      />
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
                    "Jungiama..."
                  ) : isCurrentPlan ? (
                    "Current plan"
                  ) : isPaidPlan ? (
                    <>
                      <CreditCard size={16} />
                      Continue to Stripe
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      Enter as guest
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featurePills.map((item) => (
            <div key={item} className="marketing-mini-card flex items-center gap-3">
              <CheckCircle2 size={16} style={{ color: "rgb(var(--accent))" }} />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="public-section">
          <span className="eyebrow">member path</span>
          <h2 className="mt-5 font-display text-4xl font-bold">Aiškus kelias nuo pricing iki pirmo mėnesio aiškumo</h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Pricing puslapis turi greitai atsakyti į vieną klausimą: ką realiai gaunu nusipirkęs narystę.
            Dėl to visa logika veda ne į abstraktų klubą, o į konkretų Stilloak įrankį ir aiškesnį finansinį vaizdą.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Sukuri paskyrą ir pasirenki Circle arba Private",
              "Apmoki narystę per Stripe be papildomo triukšmo",
              "Atsidarai Stilloak ir susivedi pirmą mėnesio setup",
              "Gauni dashboardą, suvestines ir privatų nario archyvą",
            ].map((item, index) => (
              <div key={item} className="marketing-mini-card flex items-center justify-between">
                <span className="font-medium">{item}</span>
                <span className="text-sm text-muted">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">Why membership works</span>
          <h2 className="mt-6 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Geras membership puslapis turi parduoti rezultatą, ne tik planą.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
            Circle yra skirtas žmogui, kuris nori pilnai naudotis Stilloak. Private skirtas tiems, kurie nori
            stipresnio palaikymo, daugiau premium sluoksnio ir aukštesnio lygio santykio su nario erdve.
          </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Circle</p>
                <p className="mt-3 font-display text-3xl font-bold">Pilnas įrankis</p>
                <p className="mt-2 text-sm text-white/62">Biudžetai, tikslai, recurring išlaidos, CSV importas ir AI suvestinės.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Private</p>
                <p className="mt-3 font-display text-3xl font-bold">Aukštesnis tonas</p>
                <p className="mt-2 text-sm text-white/62">Daugiau palaikymo, stipresnė nario patirtis ir daugiau vietos premium plėtrai.</p>
              </div>
            </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Core member product</p>
            <h3 className="mt-3 font-display text-3xl font-bold">Stilloak</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
              Circle ir Private planai atrakina Stilloak: narys gali sekti išlaidas, nusistatyti biudžetus,
              valdyti recurring mokėjimus, importuoti CSV ir gauti AI suvestines su konkrečiu veiksmų planu.
            </p>
            <div className="mt-5">
              <Link to="/savings-studio" className="hero-outline-button">
                Preview Stilloak
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/profile" className="button-primary">
              Open profile
            </Link>
            <Link to="/" className="hero-outline-button">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
