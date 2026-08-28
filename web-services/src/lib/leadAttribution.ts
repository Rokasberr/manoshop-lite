export type LeadAttribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  referrer: string;
  landingPage: string;
  gclid: string;
  fbclid: string;
};

const STORAGE_KEY = "stilloak-web-lead-attribution-v1";

const clean = (value: string | null, maxLength = 500) => (value || "").trim().slice(0, maxLength);

const inferSource = (params: URLSearchParams, referrer: string) => {
  const explicitSource = clean(params.get("utm_source"), 100);
  if (explicitSource) return explicitSource;
  if (!referrer) return "direct";

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (hostname.includes("google.")) return "google";
    if (hostname.includes("facebook.com") || hostname.includes("fb.com")) return "facebook";
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("linkedin.com")) return "linkedin";
    return hostname || "referral";
  } catch {
    return "referral";
  }
};

const inferMedium = (params: URLSearchParams, referrer: string) => {
  const explicitMedium = clean(params.get("utm_medium"), 100);
  if (explicitMedium) return explicitMedium;
  if (params.get("gclid")) return "cpc";
  if (params.get("fbclid")) return "paid_social";
  return referrer ? "referral" : "none";
};

export function captureLeadAttribution(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);
  const referrer = clean(document.referrer, 500);
  const current: LeadAttribution = {
    source: inferSource(params, referrer),
    medium: inferMedium(params, referrer),
    campaign: clean(params.get("utm_campaign"), 160),
    content: clean(params.get("utm_content"), 160),
    term: clean(params.get("utm_term"), 160),
    referrer,
    landingPage: clean(`${window.location.pathname}${window.location.search}`, 500),
    gclid: clean(params.get("gclid"), 200),
    fbclid: clean(params.get("fbclid"), 200)
  };

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing) as LeadAttribution;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Attribution remains available for this page even when storage is unavailable.
  }

  return current;
}

export function getLeadAttribution(): LeadAttribution {
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing) as LeadAttribution;
  } catch {
    // Fall through and recapture from the current page.
  }

  return captureLeadAttribution();
}
