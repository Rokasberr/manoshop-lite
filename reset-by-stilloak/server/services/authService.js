import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";
import User from "../models/User.js";
import { httpError } from "../utils/http.js";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const signSession = (user) => {
  const { jwtSecret } = getConfig();
  if (!jwtSecret) throw httpError("Session security is not configured.", 503);
  return jwt.sign(
    { sub: String(user._id), role: user.role, authVersion: Number(user.authVersion || 0) },
    jwtSecret,
    { expiresIn: TOKEN_TTL_SECONDS, issuer: "reset-by-stilloak", audience: "reset-web" }
  );
};

export const setSessionCookie = (response, token) => {
  const config = getConfig();
  response.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS * 1000
  });
};

export const clearSessionCookie = (response) => {
  const config = getConfig();
  response.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/"
  });
};

export const serializeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  plan: user.plan,
  lifetime: {
    active: Boolean(user.lifetime?.active),
    paymentStatus: user.lifetime?.paymentStatus || "not_started",
    activatedAt: user.lifetime?.activatedAt || null
  },
  onboardingComplete: Boolean(user.onboardingComplete),
  resetDuration: user.resetDuration,
  resetStartedAt: user.resetStartedAt,
  preferences: user.preferences,
  emailPreferences: user.emailPreferences,
  createdAt: user.createdAt
});

export const createPasswordResetToken = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  return token;
};

export const consumePasswordResetToken = async (token, password) => {
  const hash = crypto.createHash("sha256").update(String(token || "")).digest("hex");
  const user = await User.findOne({
    passwordResetTokenHash: hash,
    passwordResetExpiresAt: { $gt: new Date() },
    deletedAt: null
  }).select("+password +passwordResetTokenHash +passwordResetExpiresAt");
  if (!user) throw httpError("This reset link is invalid or has expired.", 400);
  user.password = password;
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.authVersion += 1;
  await user.save();
  return user;
};
