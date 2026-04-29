import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import billingService from "../services/billingService";
import { hasActiveMembership, hasPaidMembershipSignal } from "../utils/membership";
import LoadingSpinner from "./LoadingSpinner";

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

const ProtectedRoute = ({ requireAdmin = false, requireMembership = false, membershipRedirect = "/pricing" }) => {
  const { user, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireMembership && !hasActiveMembership(user)) {
    return <MembershipActivationGate membershipRedirect={membershipRedirect} user={user} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
