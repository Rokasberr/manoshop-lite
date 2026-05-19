import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { languageOptions, translations } from "../i18n/translations";

const STORAGE_KEY = "stilloak_site_language";

const getStoredLanguage = () => {
  if (typeof window === "undefined") {
    return "lt";
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return languageOptions.some((option) => option.code === storedLanguage) ? storedLanguage : "lt";
};

const resolveKey = (source, key) =>
  key.split(".").reduce((value, segment) => (value && value[segment] !== undefined ? value[segment] : undefined), source);

const interpolate = (value, params = {}) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, paramKey) =>
    params[paramKey] !== undefined && params[paramKey] !== null ? String(params[paramKey]) : `{${paramKey}}`
  );
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (nextLanguage) => {
    if (!languageOptions.some((option) => option.code === nextLanguage)) {
      return;
    }

    setLanguage(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo(() => {
    const t = (key, params = {}) => {
      const valueForLanguage = resolveKey(translations[language], key);
      const fallbackValue = resolveKey(translations.lt, key);
      const value = valueForLanguage ?? fallbackValue ?? key;

      return interpolate(value, params);
    };

    return {
      language,
      setLanguage: handleSetLanguage,
      languageOptions,
      isLithuanian: language === "lt",
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
