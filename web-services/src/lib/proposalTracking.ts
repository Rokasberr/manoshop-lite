import { trackAnalyticsEvent } from "./analytics";

let installed = false;

const proposalEndpointPattern = /\/web-service-requests\/proposal\/([a-f0-9]{64})(?:\/(accept|deposit(?:\/confirm)?))?(?:\?|$)/i;

const getRequestUrl = (input: RequestInfo | URL) =>
  typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

const getRequestMethod = (input: RequestInfo | URL, init?: RequestInit) =>
  String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();

const getSessionId = (init?: RequestInit) => {
  if (typeof init?.body !== "string") return "";
  try {
    const body = JSON.parse(init.body) as { sessionId?: unknown };
    return typeof body.sessionId === "string" ? body.sessionId : "";
  } catch {
    return "";
  }
};

export const installProposalTracking = () => {
  if (installed) return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = getRequestUrl(input);
    const method = getRequestMethod(input, init);
    const match = url.match(proposalEndpointPattern);

    const response = await nativeFetch(input, init);
    if (!match || !response.ok) return response;

    const token = match[1];
    const action = match[2] || "";

    if (method === "GET" && !action) {
      trackAnalyticsEvent("proposal_viewed");
      return response;
    }

    if (method === "POST" && action === "accept") {
      trackAnalyticsEvent("proposal_accepted");
      return response;
    }

    if (method === "POST" && action === "deposit") {
      trackAnalyticsEvent("begin_checkout", {
        currency: "EUR",
        checkout_type: "web_project_deposit"
      });
      return response;
    }

    if (method === "POST" && action === "deposit/confirm") {
      try {
        const data = (await response.clone().json()) as {
          requestNumber?: string;
          deposit?: { status?: string; amount?: number | null };
        };
        if (data.deposit?.status !== "paid") return response;

        const sessionId = getSessionId(init);
        const dedupeKey = `stilloak-ga-deposit-paid:${token}:${sessionId || data.requestNumber || "paid"}`;
        if (window.localStorage.getItem(dedupeKey)) return response;

        const tracked = trackAnalyticsEvent("deposit_paid", {
          currency: "EUR",
          value: data.deposit.amount ?? undefined,
          request_number: data.requestNumber || undefined
        });

        if (tracked) window.localStorage.setItem(dedupeKey, "1");
      } catch {
        // Analytics must never interfere with proposal payment confirmation.
      }
    }

    return response;
  };
};
