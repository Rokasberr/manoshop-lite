import { trackAnalyticsEvent } from "./analytics";
import { getLeadAttribution } from "./leadAttribution";

let installed = false;

export const installLeadTracking = () => {
  if (installed) return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const isLeadRequest = method === "POST" && /\/web-service-requests\/?(?:\?|$)/.test(url);

    if (!isLeadRequest || typeof init?.body !== "string") {
      return nativeFetch(input, init);
    }

    let nextInit = init;
    const attribution = getLeadAttribution();

    try {
      const body = JSON.parse(init.body) as Record<string, unknown>;
      nextInit = {
        ...init,
        body: JSON.stringify({ ...body, attribution })
      };
    } catch {
      // Keep the original request body if it is not JSON.
    }

    const response = await nativeFetch(input, nextInit);

    if (response.ok) {
      trackAnalyticsEvent("generate_lead", {
        lead_source: attribution.source,
        lead_medium: attribution.medium,
        campaign: attribution.campaign || undefined
      });
    }

    return response;
  };
};
