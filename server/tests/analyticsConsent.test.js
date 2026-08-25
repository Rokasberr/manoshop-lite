const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("cookie banner is shown on first visit while optional scripts remain config-gated", () => {
  const cookieUtil = read("client", "src", "utils", "cookieConsent.js");
  const cookieContext = read("client", "src", "context", "CookieConsentContext.jsx");
  const banner = read("client", "src", "components", "CookieConsentBanner.jsx");
  const footer = read("client", "src", "components", "Footer.jsx");
  const translations = read("client", "src", "i18n", "translations.js");
  const envExample = read("client", ".env.example");

  assert.match(cookieUtil, /COOKIE_CATEGORIES = \["necessary", "functional", "analytics", "marketing"\]/);
  assert.match(cookieUtil, /COOKIE_CONSENT_VERSION = "2026-08-25"/);
  assert.match(cookieUtil, /necessary: true/);
  assert.match(cookieUtil, /analytics: false/);
  assert.match(cookieUtil, /marketing: false/);
  assert.match(cookieUtil, /necessary: true,\s*\n\s*functional: Boolean\(categories\.functional\)/);
  assert.match(cookieUtil, /analytics: Boolean\(categories\.analytics\)/);
  assert.match(cookieUtil, /marketing: Boolean\(categories\.marketing\)/);
  assert.match(banner, /disabled=\{category === "necessary"\}/);
  assert.match(cookieUtil, /VITE_GA_MEASUREMENT_ID/);
  assert.match(cookieUtil, /VITE_GOOGLE_ADS_CONVERSION_ID/);
  assert.match(cookieUtil, /VITE_META_PIXEL_ID/);
  assert.doesNotMatch(cookieUtil, /HAS_NON_ESSENTIAL_COOKIE_SCRIPTS = false/);
  assert.match(cookieUtil, /HAS_NON_ESSENTIAL_COOKIE_SCRIPTS = HAS_ANALYTICS_COOKIE_SCRIPTS \|\| HAS_MARKETING_COOKIE_SCRIPTS/);
  assert.doesNotMatch(banner, /HAS_NON_ESSENTIAL_COOKIE_SCRIPTS && !hasSavedConsent/);
  assert.match(banner, /\{!hasSavedConsent && !isPreferencesOpen \? \(/);
  assert.match(banner, /mx-auto w-full max-w-6xl overflow-hidden/);
  assert.match(banner, /lg:grid-cols-\[auto_minmax\(0,1fr\)_auto\]/);
  assert.match(banner, /grid min-w-0 gap-2 sm:grid-cols-3/);
  assert.match(banner, /onClick=\{rejectNonEssential\} className="button-secondary min-w-0 max-w-full justify-center gap-2 whitespace-normal text-center"/);
  assert.match(banner, /onClick=\{openPreferences\} className="button-secondary min-w-0 max-w-full justify-center gap-2 whitespace-normal text-center"/);
  assert.match(banner, /onClick=\{acceptAll\} className="button-secondary min-w-0 max-w-full justify-center gap-2 whitespace-normal text-center"/);
  assert.doesNotMatch(banner, /whitespace-nowrap/);
  assert.doesNotMatch(banner, /onClick=\{acceptAll\} className="button-primary/);
  assert.match(banner, /role="dialog"/);
  assert.match(banner, /aria-modal="true"/);
  assert.match(banner, /aria-labelledby="cookie-preferences-title"/);
  assert.match(banner, /aria-describedby="cookie-preferences-description"/);
  assert.match(banner, /ref=\{dialogRef\}/);
  assert.match(banner, /ref=\{closeButtonRef\}/);
  assert.match(banner, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(banner, /previouslyFocusedElementRef\.current\?\.focus\?\.\(\)/);
  assert.match(banner, /event\.key === "Escape"/);
  assert.match(banner, /event\.key !== "Tab"/);
  assert.match(banner, /event\.shiftKey/);
  assert.match(banner, /querySelectorAll\(/);
  assert.match(banner, /aria-label=\{`\$\{copy\.title\}: \$\{enabled \? copy\.enabled : copy\.disabled\}`\}/);
  assert.match(banner, /aria-pressed=\{enabled\}/);
  assert.match(translations, /enabled: "įjungta"/);
  assert.match(translations, /disabled: "išjungta"/);
  assert.match(translations, /enabled: "enabled"/);
  assert.match(translations, /disabled: "disabled"/);
  assert.match(cookieContext, /openPreferences: \(\) => setIsPreferencesOpen\(true\)/);
  assert.match(cookieContext, /closePreferences: \(\) => setIsPreferencesOpen\(false\)/);
  assert.match(cookieContext, /savePreferences: saveConsent/);
  assert.match(banner, /const \{ categories, closePreferences, savePreferences, acceptAll, rejectNonEssential, hasSavedConsent \}/);
  assert.match(banner, /setSelectedCategories\(categories\)/);
  assert.match(banner, /COOKIE_CATEGORIES\.map\(\(category\) =>/);
  assert.match(banner, /onToggle=\{handleToggle\}/);
  assert.match(banner, /onClick=\{\(\) => savePreferences\(selectedCategories\)\}/);
  assert.match(banner, /\[category\]: !currentCategories\[category\]/);
  assert.match(banner, /copy\.categories\[category\]/);
  assert.match(cookieContext, /acceptAll: \(\) =>\s*\n\s*saveConsent\(\{\s*\n\s*necessary: true,\s*\n\s*functional: true,\s*\n\s*analytics: true,\s*\n\s*marketing: true,/);
  assert.match(cookieContext, /rejectNonEssential: \(\) => saveConsent\(DEFAULT_COOKIE_CATEGORIES\)/);
  assert.match(cookieUtil, /DEFAULT_COOKIE_CATEGORIES = \{\s*\n\s*necessary: true,\s*\n\s*functional: false,\s*\n\s*analytics: false,\s*\n\s*marketing: false,/);
  assert.match(cookieUtil, /version: COOKIE_CONSENT_VERSION/);
  assert.match(cookieUtil, /timestamp: new Date\(\)\.toISOString\(\)/);
  assert.match(cookieUtil, /parsedConsent\?\.version !== COOKIE_CONSENT_VERSION/);
  assert.match(cookieUtil, /return null;\s*\n\s*\}\s*\n\s*\n\s*return \{\s*\n\s*\.\.\.parsedConsent/);
  assert.doesNotMatch(cookieUtil, /analytics\.js|applyTrackingConsent|trackPageView|trackAdConversion|gtag|fbq/);
  assert.match(cookieContext, /hasSavedConsent: Boolean\(consent\)/);
  assert.match(footer, /const \{ openPreferences \} = useCookieConsent\(\)/);
  assert.match(footer, /onClick=\{openPreferences\}/);
  assert.match(footer, /\{copy\.links\.cookieSettings\}/);
  assert.match(envExample, /VITE_GA_MEASUREMENT_ID=/);
  assert.match(envExample, /VITE_GOOGLE_ADS_CONVERSION_ID=/);
  assert.match(envExample, /VITE_GOOGLE_ADS_CONVERSION_LABEL=/);
  assert.match(envExample, /VITE_META_PIXEL_ID=/);
});

test("analytics adapter loads providers only after matching consent categories", () => {
  const analytics = read("client", "src", "utils", "analytics.js");
  const layout = read("client", "src", "components", "Layout.jsx");

  assert.match(analytics, /VITE_GA_MEASUREMENT_ID/);
  assert.match(analytics, /VITE_GOOGLE_ADS_CONVERSION_ID/);
  assert.match(analytics, /VITE_GOOGLE_ADS_CONVERSION_LABEL/);
  assert.match(analytics, /VITE_META_PIXEL_ID/);
  assert.match(analytics, /googletagmanager\.com\/gtag\/js/);
  assert.match(analytics, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(analytics, /const configureGtagId = \(id\) => \{[\s\S]*ensureGtag\(id\)/);
  assert.match(analytics, /const ensureMetaPixel = \(\) => \{[\s\S]*connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(analytics, /if \(currentTrackingConsent\.analytics && analyticsConfig\.gaMeasurementId\)/);
  assert.match(analytics, /if \(currentTrackingConsent\.marketing && analyticsConfig\.googleAdsConversionId\)/);
  assert.match(analytics, /if \(currentTrackingConsent\.marketing && analyticsConfig\.metaPixelId\)/);
  assert.match(analytics, /currentTrackingConsent = \{/);
  assert.match(analytics, /hasDefaultedGtagConsent/);
  assert.match(analytics, /updateGtagConsent\("default", toGoogleConsentState\(\)\)/);
  assert.match(analytics, /updateGtagConsent\("update", toGoogleConsentState\(currentTrackingConsent\)\)/);
  assert.match(analytics, /analytics_storage: analytics \? "granted" : "denied"/);
  assert.match(analytics, /ad_storage: marketing \? "granted" : "denied"/);
  assert.match(analytics, /!currentTrackingConsent\.analytics/);
  assert.match(analytics, /!currentTrackingConsent\.marketing/);
  assert.doesNotMatch(analytics, /document\.cookie|localStorage\.setItem|sessionStorage\.setItem/);

  assert.match(layout, /useCookieConsent/);
  assert.match(layout, /applyTrackingConsent\(categories\)/);
  assert.match(layout, /if \(!categories\.analytics\)/);
  assert.match(layout, /trackPageView\(`\$\{location\.pathname\}\$\{location\.search\}`\)/);
});

test("advertising conversion events are consent-gated and tied to confirmed purchase states", () => {
  const billingSuccess = read("client", "src", "pages", "BillingSuccessPage.jsx");
  const checkoutSuccess = read("client", "src", "pages", "CheckoutSuccessPage.jsx");
  const digitalProducts = read("client", "src", "pages", "DigitalProductsPage.jsx");

  assert.match(billingSuccess, /hasActiveMembership/);
  assert.match(billingSuccess, /!isStripeActive \|\| !categories\.marketing/);
  assert.match(billingSuccess, /trackAdConversion\(\{[\s\S]*eventName: `subscription_\$\{plan\?\.id/);
  assert.match(billingSuccess, /transactionId: sessionId/);

  assert.match(checkoutSuccess, /const isPaid = paymentStatus === "paid"/);
  assert.match(checkoutSuccess, /!isPaid \|\| !order\?\._id \|\| !categories\.marketing/);
  assert.match(checkoutSuccess, /eventName: "store_order"/);
  assert.match(checkoutSuccess, /transactionId: order\._id/);

  assert.match(digitalProducts, /purchaseState === "success"/);
  assert.match(digitalProducts, /categories\.marketing && trackedDigitalPurchaseConversion\.current !== purchasedProductId/);
  assert.match(digitalProducts, /eventName: `digital_product_\$\{purchasedProductId/);
  assert.match(digitalProducts, /Number\(purchasedProduct\?\.priceCents \|\| 0\) \/ 100/);
});
