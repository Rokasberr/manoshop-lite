import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";
import User from "../models/User.js";
import { asyncRoute, httpError } from "../utils/http.js";

export const requireAuth = asyncRoute(async (request, _response, next) => {
  const config = getConfig();
  const token = request.cookies?.[config.cookieName];
  if (!token) throw httpError("Sign in to continue.", 401, "AUTH_REQUIRED");

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: "reset-by-stilloak",
      audience: "reset-web"
    });
  } catch {
    throw httpError("Your session has expired. Sign in again.", 401, "SESSION_EXPIRED");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.deletedAt || Number(payload.authVersion || 0) !== Number(user.authVersion || 0)) {
    throw httpError("Your session is no longer valid.", 401, "SESSION_EXPIRED");
  }
  user.lastActiveAt = new Date();
  await User.updateOne({ _id: user._id }, { $set: { lastActiveAt: user.lastActiveAt } });
  request.user = user;
  next();
});

export const requireLifetime = (request, _response, next) => {
  if (request.user?.role === "admin" || request.user?.lifetime?.active) return next();
  return next(httpError("Founding Lifetime access is required.", 403, "LIFETIME_REQUIRED"));
};

export const requireAdmin = (request, _response, next) => {
  if (request.user?.role === "admin") return next();
  return next(httpError("Admin access is required.", 403, "ADMIN_REQUIRED"));
};
