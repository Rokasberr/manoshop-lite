import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "stilloak_site_language";

export const languageOptions = [
  { code: "lt", label: "Lietuvių", shortLabel: "LT" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "pl", label: "Polski", shortLabel: "PL" },
  { code: "de", label: "Deutsch", shortLabel: "DE" },
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "es", label: "Español", shortLabel: "ES" },
];

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("lt");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (storedLanguage && languageOptions.some((option) => option.code === storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (nextLanguage) => {
    if (!languageOptions.some((option) => option.code === nextLanguage)) {
      return;
    }

    setLanguage(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      languageOptions,
      isLithuanian: language === "lt",
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
