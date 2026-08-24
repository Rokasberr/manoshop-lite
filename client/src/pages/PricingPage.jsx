import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";
import launchFeatures from "../../../shared/launchFeatures.cjs";
import { createCheckoutAttemptKey } from "../utils/checkoutAttempt";
import { normalizePlan } from "../utils/membership";

const businessPlanSalesEnabled = launchFeatures.BUSINESS_PLAN_SALES_ENABLED === true;

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [loadingPlanId, setLoadingPlanId] = useState("");
  const [pendingPlan, setPendingPlan] = useState(null);
  const [acceptedSubscriptionTerms, setAcceptedSubscriptionTerms] = useState(false);
  const [checkoutAttemptKey, setCheckoutAttemptKey] = useState("");

  const handleChoosePlan = async (plan) => {
    if (plan.id === "private_business" && !businessPlanSalesEnabled) {
      navigate("/launch-soon?focus=business", {
        state: { email: user?.email || "", focus: "business" },
      });
      return;
    }

    if (!user) {
      navigate("/register", { state: { from: location.pathname, selectedPlan: plan.id } });
      return;
    }

    try {
      setLoadingPlanId(plan.id);

      if (plan.id === "basic") {
        await billingService.activateDemoPlan();
        await refreshProfile();
        toast.success(t("pricing.demoActivated"));
        navigate("/members/savings-studio");
        return;
      }

      const attemptKey = createCheckoutAttemptKey();
      setCheckoutAttemptKey(attemptKey);
      setPendingPlan(plan);
      setAcceptedSubscriptionTerms(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.purchaseReadyFailed"));
    } finally {
      setLoadingPlanId("");
    }
  };

  const handleConfirmPaidPlan = async () => {
    if (!pendingPlan || loadingPlanId) {
      return;
    }

    if (!acceptedSubscriptionTerms) {
      toast.error("Prieš apmokėjimą patvirtink prenumeratos sąlygas.");
      return;
    }

    if (!checkoutAttemptKey) {
      toast.error("Nepavyko saugiai paruosti checkout bandymo. Uzdaryk langa ir bandyk dar karta.");
      return;
    }

    try {
      setLoadingPlanId(pendingPlan.id);
      const session = await billingService.createPaymentSession({
        planId: pendingPlan.id,
        provider: "stripe",
        acceptedSubscriptionTerms: true,
      }, { attemptKey: checkoutAttemptKey });

      window.location.assign(session.url);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.purchaseReadyFailed"));
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <div className="pb-8">
      <Seo
        title={t("pricing.seoTitle")}
        description={t("pricing.seoDescription")}
        path="/pricing"
        schema={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: "Stilloak Studio memberships",
          description: t("pricing.seoDescription"),
          url: "https://www.stilloak-studio.com/pricing",
        }}
      />
      <MembershipPricingShowcase
        onChoosePlan={handleChoosePlan}
        loadingPlanId={loadingPlanId}
        currentPlanId={normalizePlan(user?.subscription?.plan || "")}
      />
      {pendingPlan ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-checkout-title"
            className="w-full max-w-xl rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-[0_28px_90px_rgba(13,24,21,0.28)] sm:p-6"
          >
            <p className="eyebrow">Prenumeratos patvirtinimas</p>
            <h2 id="subscription-checkout-title" className="mt-3 font-display text-3xl font-bold">
              {pendingPlan.name}
            </h2>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-muted">
              <p>
                Kaina: <strong className="text-[rgb(var(--text))]">{pendingPlan.price.toFixed(2).replace(".", ",")} €/mėn.</strong>
              </p>
              <p>Prenumerata apmokestinama kas mėnesį ir automatiškai atnaujinama, kol ją atšauksi Stripe Customer Portal savitarnoje.</p>
              <p>Prieiga suteikiama po sėkmingo Stripe mokėjimo patvirtinimo. Atšaukus su periodo pabaiga, prieiga paprastai galioja iki apmokėto laikotarpio pabaigos.</p>
              <p>
                Detaliau:{" "}
                <Link to="/subscription-terms" target="_blank" rel="noopener noreferrer" className="font-semibold accent-text">
                  Prenumeratos sąlygos
                </Link>
                .
              </p>
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface-soft))] p-4 text-sm leading-6 text-muted">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-[rgb(var(--line))] accent-[rgb(var(--accent-strong))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-strong))]"
                checked={acceptedSubscriptionTerms}
                onChange={(event) => setAcceptedSubscriptionTerms(event.target.checked)}
              />
              <span>Patvirtinu, kad perskaičiau prenumeratos informaciją ir sutinku tęsti mokamą checkout.</span>
            </label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setPendingPlan(null); setCheckoutAttemptKey(""); }} className="button-secondary">
                Grįžti
              </button>
              <button
                type="button"
                onClick={handleConfirmPaidPlan}
                disabled={!acceptedSubscriptionTerms || loadingPlanId === pendingPlan.id}
                className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlanId === pendingPlan.id
                  ? "Ruošiamas checkout..."
                  : `Užsakyti ir mokėti ${pendingPlan.price.toFixed(2).replace(".", ",")} €/mėn.`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default PricingPage;
