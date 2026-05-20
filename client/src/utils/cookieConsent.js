export const COOKIE_CONSENT_STORAGE_KEY = "stilloak_cookie_consent";
export const COOKIE_CONSENT_VERSION = "2026-05-20";

export const COOKIE_CATEGORIES = ["necessary", "functional", "analytics", "marketing"];

export const FUNCTIONAL_STORAGE_KEYS = ["manoshop_theme"];

export const DEFAULT_COOKIE_CATEGORIES = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const normalizeCookieCategories = (categories = {}) => ({
  necessary: true,
  functional: Boolean(categories.functional),
  analytics: Boolean(categories.analytics),
  marketing: Boolean(categories.marketing),
});

export const readCookieConsent = () => {
  if (!hasStorage()) {
    return null;
  }

  try {
    const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!storedConsent) {
      return null;
    }

    const parsedConsent = JSON.parse(storedConsent);

    if (parsedConsent?.version !== COOKIE_CONSENT_VERSION || !parsedConsent.categories) {
      return null;
    }

    return {
      ...parsedConsent,
      categories: normalizeCookieCategories(parsedConsent.categories),
    };
  } catch (_error) {
    return null;
  }
};

export const writeCookieConsent = (categories) => {
  const consent = {
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: normalizeCookieCategories(categories),
  };

  if (hasStorage()) {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));

    if (!consent.categories.functional) {
      FUNCTIONAL_STORAGE_KEYS.forEach((storageKey) => window.localStorage.removeItem(storageKey));
    }
  }

  return consent;
};

export const hasCookieConsent = (category, consent = readCookieConsent()) => {
  if (category === "necessary") {
    return true;
  }

  return Boolean(consent?.categories?.[category]);
};
