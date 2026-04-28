import { ArrowRight, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { subscriptionPlans } from "../constants/subscriptionPlans";
import billingService from "../services/billingService";
import { formatCurrency } from "../utils/currency";

const featurePills = [
  "Early access drops",
  "Member-only pricing",
  "Private account archive",
  "Priority client care",
  "Savings Studio access",
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
          <h1 className="mt-5 font-display text-5xl font-bold sm:text-6xl">Choose the level of access that fits your pace</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Narystė čia atrodo kaip brand dalis, ne kaip techninis papildinys. Kiekvienas planas atveria kitą
            santykio su kolekcija lygį, o Stripe pasirūpina švariu apmokėjimo keliu.
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
          <span className="eyebrow">member journey</span>
          <h2 className="mt-5 font-display text-4xl font-bold">Designed to feel intimate, not overbuilt</h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Už gražaus paviršiaus vis dar yra tikras produktinis pagrindas: saugi registracija, apmokėjimas,
            aktyvi narystė ir aiški paskyros istorija. Tačiau klientui visa tai jaučiasi lengva.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Create an account and step into the house",
              "Choose Circle or Private membership",
              "Complete payment with Stripe",
              "Manage access from your personal profile",
            ].map((item, index) => (
              <div key={item} className="marketing-mini-card flex items-center justify-between">
                <span className="font-medium">{item}</span>
                <span className="text-sm text-muted">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-dark overflow-hidden rounded-[34px] px-6 py-8 sm:px-8">
          <span className="hero-chip">House benefits</span>
          <h2 className="mt-6 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Membership should feel desirable before it feels transactional.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
            Perkėlėme pricing puslapį iš techninio plano sąrašo į brand’o sluoksnį: ramesnis tonas, stipresnė
            tipografija, išgrynintos kortelės ir aiškesnė nario vertė.
          </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Circle</p>
                <p className="mt-3 font-display text-3xl font-bold">Early drops</p>
                <p className="mt-2 text-sm text-white/62">Priority access to limited pieces and softer perks.</p>
              </div>
              <div className="metric-card">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Private</p>
                <p className="mt-3 font-display text-3xl font-bold">Concierge tone</p>
                <p className="mt-2 text-sm text-white/62">Better fit for frequent orders, gifts and client projects.</p>
              </div>
            </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">New members tool</p>
            <h3 className="mt-3 font-display text-3xl font-bold">Savings Studio</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
              Circle ir Private planai dabar atrakina ir taupymo modulį: narys gali sekti išlaidas, matyti
              mėnesių pokytį ir naudoti programą kaip aiškesnį pinigų kontrolės sluoksnį.
            </p>
            <div className="mt-5">
              <Link to="/savings-studio" className="hero-outline-button">
                Preview the program
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/profile" className="button-primary">
              Open account
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
