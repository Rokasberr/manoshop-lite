import { createContext, useCallback, useContext, useEffect, useState } from "react";

import authService from "../services/authService";
import { normalizeUserRole } from "../utils/membership";

const AuthContext = createContext(null);
const tokenKey = "manoshop_token";
const userKey = "manoshop_user";
const initialToken = localStorage.getItem(tokenKey);

const normalizeAuthUser = (user) =>
  user
    ? {
        ...user,
        role: normalizeUserRole(user),
      }
    : null;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(initialToken));

  useEffect(() => {
    const restoreAuth = async () => {
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const profile = await authService.profile();
        const normalizedProfile = normalizeAuthUser(profile);
        setUser(normalizedProfile);
        localStorage.setItem(userKey, JSON.stringify(normalizedProfile));
      } catch (_error) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setToken(null);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    restoreAuth();
  }, [token]);

  const persistAuth = useCallback((payload) => {
    const normalizedUser = normalizeAuthUser(payload.user);

    setToken(payload.token);
    setUser(normalizedUser);
    localStorage.setItem(tokenKey, payload.token);
    localStorage.setItem(userKey, JSON.stringify(normalizedUser));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null;
    }

    const profile = await authService.profile();
    const normalizedProfile = normalizeAuthUser(profile);
    setUser(normalizedProfile);
    localStorage.setItem(userKey, JSON.stringify(normalizedProfile));
    return normalizedProfile;
  }, [token]);

  const login = useCallback(async (credentials) => {
    const payload = await authService.login(credentials);
    persistAuth(payload);
    return payload;
  }, [persistAuth]);

  const register = useCallback(async (formData) => {
    const payload = await authService.register(formData);
    persistAuth(payload);
    return payload;
  }, [persistAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isCheckingAuth,
    login,
    register,
    logout,
    setUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth turi būti naudojamas AuthProvider viduje.");
  }

  return context;
};
