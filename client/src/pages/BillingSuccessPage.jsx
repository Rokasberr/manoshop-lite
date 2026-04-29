import { CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import billingService from "../services/billingService";
import { hasActiveMembership } from "../utils/membership";

const BillingSuccessPage = () => {
  const { refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Tikriname prenumeratos aktyvaciją...");
  const sessionId = searchParams.get("session_id") || "";

  const isStripeActive = hasActiveMembership(user);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const syncSubscription = async () => {
      while (!cancelled && attempts < 4) {
        attempts += 1;

        try {
          await billingService.syncStripeMembership(sessionId);
          const profile = await refreshProfile();
          if (cancelled) {
            return;
          }

          if (hasActiveMembership({ ...(user || {}), subscription: profile?.subscription })) {
            setStatusMessage("Prenumerata aktyvuota. Tuoj atidarysime Stilloak.");
            setLoading(false);
            setTimeout(() => {
              if (!cancelled) {
                navigate("/members/savings-studio?welcome=membership", { replace: true });
              }
            }, 1400);
            return;
          }
        } catch (_error) {
          // Intentionally retry a few times because webhook activation can lag behind the redirect.
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
      }

      if (!cancelled) {
        setStatusMessage("Checkout pavyko. Jei planas dar neatsinaujino, po kelių sekundžių atsidaryk profilį dar kartą.");
        setLoading(false);
      }
    };

    syncSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="payment success"
        title="Mokėjimas priimtas"
        subtitle="Stripe grąžino sėkmingą checkout rezultatą, o mes sinchronizuojame tavo prenumeratos planą su paskyra."
      />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label="Tikriname webhook aktyvaciją..." />
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              {isStripeActive ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">{statusMessage}</h2>
            <p className="mt-4 text-muted">
              Session ID: <span className="font-semibold text-current">{sessionId || "n/a"}</span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/members/savings-studio?welcome=membership" className="button-primary">
                Atidaryti Stilloak
              </Link>
              <Link to="/pricing" className="button-secondary">
                Peržiūrėti planus
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingSuccessPage;
