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
  const [statusMessage, setStatusMessage] = useState("Tikriname narystės aktyvaciją...");
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
            setStatusMessage("Narystė aktyvuota. Tuoj atidarysime Stilloak.");
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
        setStatusMessage("Apmokėjimas pavyko. Jei planas dar neatsinaujino, po kelių sekundžių atsidaryk profilį dar kartą.");
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
        eyebrow="apmokėjimas pavyko"
        title="Mokėjimas priimtas"
        subtitle="Sinchronizuojame tavo narystę su paskyra."
      />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        {loading ? (
          <LoadingSpinner label="Tikriname narystės aktyvaciją..." />
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              {isStripeActive ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold">{statusMessage}</h2>
            <p className="mt-4 text-muted">
              Narystės informacija išsaugota tavo paskyroje. Jei būsena dar atsinaujina, profilis ją parodys po kelių akimirkų.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/members/savings-studio?welcome=membership" className="button-primary">
                Atidaryti Stilloak
              </Link>
              <Link to="/pricing" className="button-secondary">
                Peržiūrėti narystę
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingSuccessPage;
