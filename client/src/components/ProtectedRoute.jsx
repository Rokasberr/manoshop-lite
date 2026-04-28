import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { hasActiveMembership } from "../utils/membership";
import LoadingSpinner from "./LoadingSpinner";

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
    return <Navigate to={membershipRedirect} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
