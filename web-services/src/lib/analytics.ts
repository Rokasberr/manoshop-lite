const CONSENT_STORAGE_KEY = "stilloak-web-cookie-consent-v1";
const CONSENT_EVENT = "stilloak-cookie-consent-changed";
const DEFAULT_MEASUREMENT_ID = "G-3LZW2H0BL5";
const DEFAULT_META_PIXEL_ID = "28222053707404185";
const measurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID).trim();
const googleAdsId = String(import.meta.env.VITE_GOOGLE_ADS_ID || "").trim();
const googleAdsLeadLabel = String(import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL || "").trim();
const metaPixelId = String(import.meta.env.VITE_META_PIXEL_ID || DEFAULT_META_PIXEL_ID).trim();
const siteVerification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "").trim();

let initialized = false;
let googleAdsInitialized = false;
let metaInitialized = false;
let consentDefaultsSet = false;

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

const readConsent = () => {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return { analytics: false, marketing: false };
    const parsed = JSON.parse(raw) as { analytics?: boolean; marketing?: boolean };
    return { analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) };
  } catch {
    return { analytics: false, marketing: false };
  }
};

const hasAnalyticsConsent = () => {
  try {
    return readConsent().analytics;
  } catch {
    return false;
  }
};

const hasMarketingConsent = () => {
  try {
    return readConsent().marketing;
  } catch {
    return false;
  }
};

const ensureGoogleTagQueue = () => {
  const analyticsWindow = getAnalyticsWindow();
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  if (!analyticsWindow.gtag) {
    analyticsWindow.gtag = function () {
      // Google gtag queues the function's arguments object.
      // eslint-disable-next-line prefer-rest-params
      analyticsWindow.dataLayer?.push(arguments);
    };
  }

  if (!consentDefaultsSet) {
    analyticsWindow.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
    consentDefaultsSet = true;
  }

  return analyticsWindow;
};

const updateGoogleConsent = () => {
  const consent = readConsent();
  ensureGoogleTagQueue().gtag?.("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied"
  });
};

const loadGoogleTagScript = (id: string) => {
  if (!id || document.querySelector("script[data-stilloak-google-tag]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.stilloakGoogleTag = id;
  document.head.appendChild(script);
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

  const analyticsWindow = ensureGoogleTagQueue();
  loadGoogleTagScript(measurementId);

  analyticsWindow.gtag?.("js", new Date());
  analyticsWindow.gtag?.("config", measurementId, {
    anonymize_ip: true,
    page_title: document.title,
    page_location: window.location.href
  });

  initialized = true;
};

const loadGoogleAds = () => {
  if (!googleAdsId || googleAdsInitialized || !hasMarketingConsent()) return;
  const analyticsWindow = ensureGoogleTagQueue();
  loadGoogleTagScript(googleAdsId);
  analyticsWindow.gtag?.("config", googleAdsId);
  googleAdsInitialized = true;
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
  ensureGoogleTagQueue();
  updateGoogleConsent();
  loadGoogleAnalytics();
  loadGoogleAds();
  loadMetaPixel();

  window.addEventListener(CONSENT_EVENT, () => {
    updateGoogleConsent();
    loadGoogleAnalytics();
    loadGoogleAds();
    loadMetaPixel();
  });
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

export const trackGoogleAdsLead = () => {
  if (!googleAdsInitialized || !googleAdsLeadLabel || !hasMarketingConsent()) return false;
  getAnalyticsWindow().gtag?.("event", "conversion", {
    send_to: `${googleAdsId}/${googleAdsLeadLabel}`
  });
  return true;
};

export { CONSENT_EVENT };
