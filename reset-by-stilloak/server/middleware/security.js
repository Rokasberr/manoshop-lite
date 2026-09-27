import { getConfig } from "../config.js";

export const securityHeaders = (_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src https://open.spotify.com; connect-src 'self'"
  );

  if (getConfig().nodeEnv === "production") {
    response.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
};

const buckets = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 30, key = "default" } = {}) =>
  (request, response, next) => {
    const now = Date.now();
    const address = request.ip || request.headers["x-forwarded-for"] || "unknown";
    const bucketKey = `${key}:${address}`;
    const current = buckets.get(bucketKey);

    if (!current || current.resetAt <= now) {
      buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      response.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return response.status(429).json({ error: "Too many requests. Try again shortly." });
    }
    return next();
  };
