import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";
import { normalizePlan } from "../utils/membership";

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [loadingPlanId, setLoadingPlanId] = useState("");

  const handleChoosePlan = async (plan) => {
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

      const session = await billingService.createPaymentSession({
        planId: plan.id,
        provider: "stripe",
      });

      window.location.assign(session.url);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.toast.purchaseReadyFailed"));
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <div className="pb-8">
      <MembershipPricingShowcase
        onChoosePlan={handleChoosePlan}
        loadingPlanId={loadingPlanId}
        currentPlanId={normalizePlan(user?.subscription?.plan || "")}
      />
    </div>
  );
};

export default PricingPage;
