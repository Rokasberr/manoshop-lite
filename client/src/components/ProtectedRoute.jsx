import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";
import {
  hasActiveMembership,
  hasPaidMembershipSignal,
  isAdminUser,
  userCanAccessBusinessStudio,
} from "../utils/membership";
import LoadingSpinner from "./LoadingSpinner";

const UpgradeRequired = () => (
  <UpgradeRequiredContent />
);

const UpgradeRequiredContent = () => {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl py-10">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <span className="signal-pill">{t("protected.businessEyebrow")}</span>
        <h1 className="mt-5 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
          {t("protected.businessTitle")}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{t("protected.businessText")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/pricing" className="button-primary justify-center">
            {t("common.buttons.viewPlans")}
          </Link>
          <Link to="/members/savings-studio" className="button-secondary justify-center">
            {t("protected.backToSaving")}
          </Link>
        </div>
      </section>
    </div>
  );
};

const AdminRoleGate = ({ user }) => {
  const { refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [isResolving, setIsResolving] = useState(true);
  const [canAccess, setCanAccess] = useState(() => isAdminUser(user));

  useEffect(() => {
    let cancelled = false;

    const resolveRole = async () => {
      try {
        const profile = await refreshProfile();

        if (!cancelled) {
          setCanAccess(isAdminUser(profile));
        }
      } catch (_error) {
        if (!cancelled) {
          setCanAccess(false);
        }
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    resolveRole();

    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  if (canAccess) {
    return <Outlet />;
  }

  if (isResolving) {
    return <LoadingSpinner fullScreen label={t("common.loadingAdmin")} />;
  }

  return <Navigate to="/profile" replace />;
};

const MembershipActivationGate = ({ membershipRedirect, user }) => {
  const { refreshProfile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isResolving, setIsResolving] = useState(true);
  const [canAccess, setCanAccess] = useState(() => hasActiveMembership(user));
  const sessionId = new URLSearchParams(location.search).get("session_id") || "";
  const shouldAttemptSync = Boolean(sessionId) || hasPaidMembershipSignal(user);

  useEffect(() => {
    if (hasActiveMembership(user)) {
      setCanAccess(true);
      setIsResolving(false);
      return;
    }

    if (!shouldAttemptSync) {
      setIsResolving(false);
      return;
    }

    let cancelled = false;

    const resolveMembership = async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          await billingService.syncStripeMembership(sessionId);
          const profile = await refreshProfile();

          if (cancelled) {
            return;
          }

          if (hasActiveMembership(profile)) {
            setCanAccess(true);
            setIsResolving(false);
            return;
          }
        } catch (_error) {
          // Retry a few times because Stripe/webhook updates can lag slightly behind the redirect.
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 1200);
        });
      }

      if (!cancelled) {
        setIsResolving(false);
      }
    };

    resolveMembership();

    return () => {
      cancelled = true;
    };
  }, [refreshProfile, sessionId, shouldAttemptSync, user]);

  if (canAccess) {
    return <Outlet />;
  }

  if (isResolving) {
    return <LoadingSpinner fullScreen label={t("common.loadingMembership")} />;
  }

  return <Navigate to={membershipRedirect} replace state={{ from: `${location.pathname}${location.search}` }} />;
};

const ProtectedRoute = ({
  requireAdmin = false,
  requireMembership = false,
  requireBusinessPlan = false,
  membershipRedirect = "/pricing",
}) => {
  const { user, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (requireAdmin && !isAdminUser(user)) {
    return <AdminRoleGate user={user} />;
  }

  if (requireMembership && !hasActiveMembership(user)) {
    return <MembershipActivationGate membershipRedirect={membershipRedirect} user={user} />;
  }

  if (requireBusinessPlan && !userCanAccessBusinessStudio(user)) {
    return <UpgradeRequired />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
