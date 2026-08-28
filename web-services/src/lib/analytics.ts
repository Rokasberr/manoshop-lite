const CONSENT_STORAGE_KEY = "stilloak-web-cookie-consent-v1";
const CONSENT_EVENT = "stilloak-cookie-consent-changed";
const DEFAULT_MEASUREMENT_ID = "G-3LZW2H0BL5";
const measurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID).trim();
const siteVerification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "").trim();

let initialized = false;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

const getAnalyticsWindow = () => window as AnalyticsWindow;

const hasAnalyticsConsent = () => {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
};

const ensureSiteVerificationMeta = () => {
  if (!siteVerification || document.querySelector('meta[name="google-site-verification"]')) return;
  const meta = document.createElement("meta");
  meta.name = "google-site-verification";
  meta.content = siteVerification;
  document.head.appendChild(meta);
};

const loadGoogleAnalytics = () => {
  if (!measurementId || initialized || !hasAnalyticsConsent()) return;

  const analyticsWindow = getAnalyticsWindow();
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = (...args: unknown[]) => {
    analyticsWindow.dataLayer?.push(args);
  };

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", measurementId, {
    anonymize_ip: true,
    page_title: document.title,
    page_location: window.location.href
  });

  if (!document.querySelector(`script[data-stilloak-ga="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.stilloakGa = measurementId;
    document.head.appendChild(script);
  }

  initialized = true;
};

export const initializeAnalytics = () => {
  ensureSiteVerificationMeta();
  loadGoogleAnalytics();

  window.addEventListener(CONSENT_EVENT, loadGoogleAnalytics);
};

export const trackAnalyticsEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
  if (!initialized || !hasAnalyticsConsent()) return;
  getAnalyticsWindow().gtag?.("event", eventName, parameters);
};

export { CONSENT_EVENT };
