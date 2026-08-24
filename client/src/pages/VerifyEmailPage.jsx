import { CheckCircle2, MailWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = searchParams.get("token") || "";

    const verify = async () => {
      if (!token) {
        setStatus("invalid");
        setMessage("Patvirtinimo nuoroda neteisinga arba pasibaigusi.");
        return;
      }

      try {
        const result = await authService.verifyEmail(token);

        if (cancelled) {
          return;
        }

        setStatus("success");
        setMessage(result.message || "El. paštas patvirtintas.");
        await refreshProfile().catch(() => null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("invalid");
        setMessage(error.response?.data?.message || "Patvirtinimo nuoroda neteisinga arba pasibaigusi.");
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [refreshProfile, searchParams]);

  return (
    <div className="mx-auto max-w-2xl">
      <Seo title="El. pašto patvirtinimas" description="Patvirtink Stilloak Studio paskyros el. paštą." path="/verify-email" robots="noindex,nofollow" />
      <div className="panel min-w-0 p-8 text-center">
        {status === "loading" ? (
          <LoadingSpinner />
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
            <h1 className="mt-5 font-display text-3xl font-bold">El. paštas patvirtintas</h1>
            <p className="mt-3 text-muted">{message}</p>
            <Link to="/profile" className="button-primary mt-6 inline-flex w-full justify-center sm:w-auto">
              Grįžti į profilį
            </Link>
          </>
        ) : (
          <>
            <MailWarning className="mx-auto text-amber-600" size={40} />
            <h1 className="mt-5 font-display text-3xl font-bold">Nuoroda nebegalioja</h1>
            <p className="mt-3 text-muted">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/profile" className="button-primary justify-center">
                Atidaryti profilį
              </Link>
              <Link to="/login" className="button-secondary justify-center">
                Prisijungti
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
