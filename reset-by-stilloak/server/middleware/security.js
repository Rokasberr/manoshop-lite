import crypto from "node:crypto";
import { getConfig } from "../config.js";
import RateLimitBucket from "../models/RateLimitBucket.js";

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

export const apiSecurity = (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const fetchSite = String(request.headers["sec-fetch-site"] || "").toLowerCase();
    const origin = String(request.headers.origin || "");
    const requestOrigin = `${request.protocol}://${request.get("host")}`;
    const configuredOrigin = getConfig().appUrl;
    if (fetchSite === "cross-site" || (origin && origin !== requestOrigin && origin !== configuredOrigin)) {
      return response.status(403).json({ error: "Cross-site request blocked.", code: "ORIGIN_BLOCKED" });
    }
  }
  return next();
};

export const rateLimit = ({ windowMs = 60_000, max = 30, key = "default" } = {}) =>
  async (request, response, next) => {
    const now = Date.now();
    const address = request.ip || request.headers["x-forwarded-for"] || "unknown";
    const windowId = Math.floor(now / windowMs);
    const secret = getConfig().jwtSecret || "reset-development-rate-limit";
    const bucketId = crypto.createHmac("sha256", secret).update(`${key}:${address}:${windowId}`).digest("hex");
    const resetAt = (windowId + 1) * windowMs;
    try {
      const current = await RateLimitBucket.findOneAndUpdate(
        { _id: bucketId },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt + windowMs) } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
      response.setHeader("RateLimit-Limit", String(max));
      response.setHeader("RateLimit-Remaining", String(Math.max(0, max - current.count)));
      response.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      if (current.count > max) {
        response.setHeader("Retry-After", String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
        return response.status(429).json({ error: "Too many requests. Try again shortly." });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
