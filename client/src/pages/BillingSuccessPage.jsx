import { CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";
import { hasActiveMembership } from "../utils/membership";

const BillingSuccessPage = () => {
  const { refreshProfile, user } = useAuth();
  const { t } = useLanguage();
  const copy = t("billing");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(copy.checking);
  const [confirmedProfile, setConfirmedProfile] = useState(null);
  const sessionId = searchParams.get("session_id") || "";

  const isStripeActive = hasActiveMembership(confirmedProfile || user);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const syncSubscription = async () => {
      if (!sessionId) {
        setStatusMessage("Trūksta Stripe sesijos patvirtinimo. Narystė neaktyvuota.");
        setLoading(false);
        return;
      }

      while (!cancelled && attempts < 4) {
        attempts += 1;

        try {
          const syncResult = await billingService.syncStripeMembership(sessionId);
          const profile = await refreshProfile();
          if (cancelled) {
            return;
          }

          setConfirmedProfile(profile);

          if (syncResult?.synced && hasActiveMembership(profile)) {
            setStatusMessage(copy.activated);
            setLoading(false);
            setTimeout(() => {
              if (!cancelled) {
                navigate("/members/savings-studio?welcome=membership", { replace: true });
              }
            }, 1400);
            return;
          }

          setStatusMessage(syncResult?.message || copy.fallback);
        } catch (_error) {
          // Intentionally retry a few times because webhook activation can lag behind the redirect.
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
      }

      if (!cancelled) {
        setStatusMessage(copy.fallback);
        setLoading(false);
      }
    };

    syncSubscription();

    return () => {
      cancelled = true;
    };
  }, [copy.activated, copy.fallback, navigate, refreshProfile, sessionId, user]);

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow={copy.successEyebrow} title={copy.successTitle} subtitle={copy.successSubtitle} />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label={copy.checking} />
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              {isStripeActive ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">{statusMessage}</h2>
            <p className="mt-4 text-muted">{copy.saved}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isStripeActive ? (
                <Link to="/members/savings-studio?welcome=membership" className="button-primary">
                  {t("common.buttons.openStudio")}
                </Link>
              ) : null}
              <Link to="/pricing" className="button-secondary">
                {t("common.buttons.viewMembership")}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingSuccessPage;
