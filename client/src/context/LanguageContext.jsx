import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "stilloak_site_language";

export const languageOptions = [
  { code: "lt", label: "LT" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
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
