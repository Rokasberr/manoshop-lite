import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  DEFAULT_COOKIE_CATEGORIES,
  hasCookieConsent,
  normalizeCookieCategories,
  readCookieConsent,
  writeCookieConsent,
} from "../utils/cookieConsent";

const CookieConsentContext = createContext(null);

export const CookieConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(readCookieConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const saveConsent = useCallback((categories) => {
    const savedConsent = writeCookieConsent(categories);
    setConsent(savedConsent);
    setIsPreferencesOpen(false);
    return savedConsent;
  }, []);

  const value = useMemo(
    () => ({
      consent,
      hasSavedConsent: Boolean(consent),
      isPreferencesOpen,
      categories: normalizeCookieCategories(consent?.categories || DEFAULT_COOKIE_CATEGORIES),
      openPreferences: () => setIsPreferencesOpen(true),
      closePreferences: () => setIsPreferencesOpen(false),
      acceptAll: () =>
        saveConsent({
          necessary: true,
          functional: true,
          analytics: true,
          marketing: true,
        }),
      rejectNonEssential: () => saveConsent(DEFAULT_COOKIE_CATEGORIES),
      savePreferences: saveConsent,
      canUseCookies: (category) => hasCookieConsent(category, consent),
    }),
    [consent, isPreferencesOpen, saveConsent]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider.");
  }

  return context;
};
