import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import billingService from "../services/billingService";
import {
  hasActiveMembership,
  hasPaidMembershipSignal,
  isAdminUser,
  userCanAccessBusinessStudio,
} from "../utils/membership";
import LoadingSpinner from "./LoadingSpinner";

const UpgradeRequired = () => (
  <div className="mx-auto max-w-3xl py-10">
    <section className="panel overflow-hidden p-6 sm:p-8">
      <span className="signal-pill">Verslas</span>
      <h1 className="mt-5 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
        Business Studio prieinama tik Verslas plano nariams
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
        Saving Studio lieka pasiekiama pagal tavo naryste, bet Site Builder, My Store, Orders ir Earnings yra
        papildoma verslo zona.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/pricing" className="button-primary justify-center">
          Perziureti planus
        </Link>
        <Link to="/members/savings-studio" className="button-secondary justify-center">
          Grizti i Saving Studio
        </Link>
      </div>
    </section>
  </div>
);

const AdminRoleGate = ({ user }) => {
  const { refreshProfile } = useAuth();
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
    return <LoadingSpinner fullScreen label="Tikriname administratoriaus teises..." />;
  }

  return <Navigate to="/profile" replace />;
};

const MembershipActivationGate = ({ membershipRedirect, user }) => {
  const { refreshProfile } = useAuth();
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
    return <LoadingSpinner fullScreen label="Tikriname tavo narystę..." />;
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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
