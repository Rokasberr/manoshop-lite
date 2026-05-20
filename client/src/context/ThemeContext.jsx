import { createContext, useContext, useEffect, useState } from "react";

import { hasCookieConsent } from "../utils/cookieConsent";

const ThemeContext = createContext(null);
const storageKey = "manoshop_theme";

const getInitialTheme = () => {
  if (typeof window === "undefined" || !hasCookieConsent("functional")) {
    return "light";
  }

  return localStorage.getItem(storageKey) || "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    if (hasCookieConsent("functional")) {
      localStorage.setItem(storageKey, theme);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [theme]);

  const value = {
    theme,
    toggleTheme: () =>
      setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark")),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme turi būti naudojamas ThemeProvider viduje.");
  }

  return context;
};
