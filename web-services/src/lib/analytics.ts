const CONSENT_STORAGE_KEY = "stilloak-web-cookie-consent-v1";
const CONSENT_EVENT = "stilloak-cookie-consent-changed";
const DEFAULT_MEASUREMENT_ID = "G-3LZW2H0BL5";
const measurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID).trim();
const metaPixelId = String(import.meta.env.VITE_META_PIXEL_ID || "").trim();
const siteVerification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "").trim();

let initialized = false;
let metaInitialized = false;

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[][];
    loaded?: boolean;
    version?: string;
  };
  _fbq?: (...args: unknown[]) => void;
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

const hasMarketingConsent = () => {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { marketing?: boolean };
    return Boolean(parsed.marketing);
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
  const queueGoogleAnalyticsCommand: (...args: unknown[]) => void = function () {
    // Google gtag's official bootstrap queues the function's arguments object.
    // eslint-disable-next-line prefer-rest-params
    analyticsWindow.dataLayer?.push(arguments);
  };
  analyticsWindow.gtag = queueGoogleAnalyticsCommand;

  if (!document.querySelector(`script[data-stilloak-ga="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.stilloakGa = measurementId;
    document.head.appendChild(script);
  }

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", measurementId, {
    anonymize_ip: true,
    page_title: document.title,
    page_location: window.location.href
  });

  initialized = true;
};

const loadMetaPixel = () => {
  if (!metaPixelId || metaInitialized || !hasMarketingConsent()) return;

  const analyticsWindow = getAnalyticsWindow();
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue?.push(args);
  } as NonNullable<AnalyticsWindow["fbq"]>;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  analyticsWindow.fbq = fbq;
  analyticsWindow._fbq = fbq;

  if (!document.querySelector(`script[data-stilloak-meta-pixel="${metaPixelId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.stilloakMetaPixel = metaPixelId;
    document.head.appendChild(script);
  }

  analyticsWindow.fbq("init", metaPixelId);
  analyticsWindow.fbq("track", "PageView");
  metaInitialized = true;
};

export const initializeAnalytics = () => {
  ensureSiteVerificationMeta();
  loadGoogleAnalytics();
  loadMetaPixel();

  window.addEventListener(CONSENT_EVENT, loadGoogleAnalytics);
  window.addEventListener(CONSENT_EVENT, loadMetaPixel);
};

export const trackAnalyticsEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
  if (!initialized || !hasAnalyticsConsent()) return false;
  getAnalyticsWindow().gtag?.("event", eventName, parameters);
  return true;
};

export const trackMetaEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
  if (!metaInitialized || !hasMarketingConsent()) return false;
  getAnalyticsWindow().fbq?.("track", eventName, parameters);
  return true;
};

export { CONSENT_EVENT };
