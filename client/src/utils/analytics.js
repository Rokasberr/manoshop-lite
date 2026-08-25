const readPublicEnv = (key) => {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "";
  }

  return String(import.meta.env[key] || "").trim();
};

export const analyticsConfig = {
  gaMeasurementId: readPublicEnv("VITE_GA_MEASUREMENT_ID"),
  googleAdsConversionId: readPublicEnv("VITE_GOOGLE_ADS_CONVERSION_ID"),
  googleAdsConversionLabel: readPublicEnv("VITE_GOOGLE_ADS_CONVERSION_LABEL"),
  metaPixelId: readPublicEnv("VITE_META_PIXEL_ID"),
};

const loadedScripts = new Set();
const configuredGtagIds = new Set();
const trackedConversions = new Set();
let hasDefaultedGtagConsent = false;
let currentTrackingConsent = {
  analytics: false,
  marketing: false,
};

const canUseDom = () => typeof window !== "undefined" && typeof document !== "undefined";

const loadScriptOnce = (id, src) => {
  if (!canUseDom() || loadedScripts.has(id) || document.getElementById(id)) {
    loadedScripts.add(id);
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
  loadedScripts.add(id);
};

const toGoogleConsentState = ({ analytics = false, marketing = false } = {}) => ({
  analytics_storage: analytics ? "granted" : "denied",
  ad_storage: marketing ? "granted" : "denied",
  ad_user_data: marketing ? "granted" : "denied",
  ad_personalization: marketing ? "granted" : "denied",
});

const updateGtagConsent = (command, consentState) => {
  if (!canUseDom() || !window.gtag) {
    return;
  }

  window.gtag("consent", command, consentState);
};

const ensureGtag = (bootstrapId) => {
  if (!canUseDom() || !bootstrapId) {
    return null;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (!hasDefaultedGtagConsent) {
    updateGtagConsent("default", toGoogleConsentState());
    hasDefaultedGtagConsent = true;
  }

  loadScriptOnce("stilloak-gtag", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(bootstrapId)}`);

  if (!window.__stilloakGtagBootstrapped) {
    window.gtag("js", new Date());
    window.__stilloakGtagBootstrapped = true;
  }

  return window.gtag;
};

const configureGtagId = (id) => {
  const gtag = ensureGtag(id);

  if (!gtag || configuredGtagIds.has(id)) {
    return;
  }

  gtag("config", id, { send_page_view: false });
  configuredGtagIds.add(id);
};

const ensureMetaPixel = () => {
  if (!canUseDom() || !analyticsConfig.metaPixelId || window.fbq) {
    return;
  }

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", analyticsConfig.metaPixelId);
};

export const applyTrackingConsent = ({ analytics = false, marketing = false } = {}) => {
  currentTrackingConsent = {
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
  };

  if (!canUseDom()) {
    return;
  }

  if (currentTrackingConsent.analytics && analyticsConfig.gaMeasurementId) {
    configureGtagId(analyticsConfig.gaMeasurementId);
  }

  if (currentTrackingConsent.marketing && analyticsConfig.googleAdsConversionId) {
    configureGtagId(analyticsConfig.googleAdsConversionId);
  }

  if (currentTrackingConsent.marketing && analyticsConfig.metaPixelId) {
    ensureMetaPixel();
  }

  updateGtagConsent("update", toGoogleConsentState(currentTrackingConsent));
};

export const trackPageView = (path) => {
  if (!canUseDom() || !currentTrackingConsent.analytics || !analyticsConfig.gaMeasurementId || !window.gtag) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

export const trackAdConversion = ({ eventName = "conversion", value = 0, currency = "EUR", transactionId = "" } = {}) => {
  if (!canUseDom() || !currentTrackingConsent.marketing) {
    return;
  }

  const dedupeKey = `${eventName}:${transactionId || window.location.href}`;

  if (trackedConversions.has(dedupeKey)) {
    return;
  }

  if (analyticsConfig.googleAdsConversionId && analyticsConfig.googleAdsConversionLabel && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${analyticsConfig.googleAdsConversionId}/${analyticsConfig.googleAdsConversionLabel}`,
      value,
      currency,
      transaction_id: transactionId,
    });
  }

  if (analyticsConfig.metaPixelId && window.fbq) {
    window.fbq("track", "Purchase", {
      value,
      currency,
      content_name: eventName,
      eventID: transactionId || dedupeKey,
    });
  }

  trackedConversions.add(dedupeKey);
};
