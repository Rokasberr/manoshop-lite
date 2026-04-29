import { createContext, useContext, useEffect, useState } from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);
const tokenKey = "manoshop_token";
const userKey = "manoshop_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(localStorage.getItem(tokenKey)));

  useEffect(() => {
    const restoreAuth = async () => {
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const profile = await authService.profile();
        setUser(profile);
        localStorage.setItem(userKey, JSON.stringify(profile));
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

  const persistAuth = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(tokenKey, payload.token);
    localStorage.setItem(userKey, JSON.stringify(payload.user));
  };

  const refreshProfile = async () => {
    if (!token) {
      return null;
    }

    const profile = await authService.profile();
    setUser(profile);
    localStorage.setItem(userKey, JSON.stringify(profile));
    return profile;
  };

  const login = async (credentials) => {
    const payload = await authService.login(credentials);
    persistAuth(payload);
    return payload;
  };

  const register = async (formData) => {
    const payload = await authService.register(formData);
    persistAuth(payload);
    return payload;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  };

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
