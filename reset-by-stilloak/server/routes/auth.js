import crypto from "node:crypto";
import express from "express";
import Craving from "../models/Craving.js";
import DailyEntry from "../models/DailyEntry.js";
import EmailDelivery from "../models/EmailDelivery.js";
import Habit from "../models/Habit.js";
import SmokingEvent from "../models/SmokingEvent.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/security.js";
import {
  clearSessionCookie,
  consumePasswordResetToken,
  createPasswordResetToken,
  serializeUser,
  setSessionCookie,
  signSession
} from "../services/authService.js";
import { emailTemplates, sendEmail } from "../services/emailService.js";
import { asyncRoute, httpError, isEmail, normalizeEmail, passwordError } from "../utils/http.js";

const router = express.Router();

router.post(
  "/register",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 12, key: "register" }),
  asyncRoute(async (request, response) => {
    const name = String(request.body?.name || "").trim();
    const email = normalizeEmail(request.body?.email);
    const password = String(request.body?.password || "");
    if (name.length < 2 || name.length > 80) throw httpError("Use a name between 2 and 80 characters.", 400);
    if (!isEmail(email)) throw httpError("Enter a valid email address.", 400);
    const policyError = passwordError(password);
    if (policyError) throw httpError(policyError, 400);

    if (await User.exists({ email, deletedAt: null })) throw httpError("An account with this email already exists.", 409);
    let user;
    try {
      user = await User.create({ name, email, password });
    } catch (error) {
      if (error?.code === 11000) throw httpError("An account with this email already exists.", 409);
      throw error;
    }
    setSessionCookie(response, signSession(user));
    const template = emailTemplates.welcome(user);
    let welcomeEmailSent = false;
    try {
      await sendEmail({ to: user.email, subject: template.subject, ...template.content });
      welcomeEmailSent = true;
    } catch {
      welcomeEmailSent = false;
    }
    response.status(201).json({ user: serializeUser(user), welcomeEmailSent });
  })
);

router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: "login" }),
  asyncRoute(async (request, response) => {
    const email = normalizeEmail(request.body?.email);
    const password = String(request.body?.password || "");
    if (!isEmail(email) || !password) throw httpError("Enter valid sign-in details.", 400);
    const user = await User.findOne({ email, deletedAt: null }).select("+password");
    if (!user || !(await user.comparePassword(password))) throw httpError("Email or password is incorrect.", 401);
    setSessionCookie(response, signSession(user));
    response.json({ user: serializeUser(user) });
  })
);

router.post(
  "/logout",
  requireAuth,
  asyncRoute(async (request, response) => {
    request.user.authVersion += 1;
    await request.user.save();
    clearSessionCookie(response);
    response.json({ ok: true });
  })
);

router.get("/me", requireAuth, (request, response) => response.json({ user: serializeUser(request.user) }));

router.post(
  "/forgot-password",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 8, key: "forgot" }),
  asyncRoute(async (request, response) => {
    const email = normalizeEmail(request.body?.email);
    if (!isEmail(email)) throw httpError("Enter a valid email address.", 400);
    const user = await User.findOne({ email, deletedAt: null }).select("+passwordResetTokenHash +passwordResetExpiresAt");
    if (user) {
      const token = await createPasswordResetToken(user);
      const template = emailTemplates.passwordReset(user, token);
      try {
        await sendEmail({ to: user.email, subject: template.subject, ...template.content });
      } catch {
        // Keep the response generic to avoid account enumeration and provider detail leaks.
      }
    }
    response.json({ message: "If an account exists, a password reset email is on its way." });
  })
);

router.post(
  "/reset-password",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10, key: "reset-password" }),
  asyncRoute(async (request, response) => {
    const token = String(request.body?.token || "").trim();
    const password = String(request.body?.password || "");
    if (!/^[a-f\d]{64}$/i.test(token)) throw httpError("This reset link is invalid or has expired.", 400);
    const policyError = passwordError(password);
    if (policyError) throw httpError(policyError, 400);
    await consumePasswordResetToken(token, password);
    clearSessionCookie(response);
    response.json({ message: "Password changed. Sign in with your new password." });
  })
);

router.get(
  "/export",
  requireAuth,
  asyncRoute(async (request, response) => {
    const user = serializeUser(request.user);
    const [habits, dailyEntries, cravings, smokingEvents, emailDeliveries] = await Promise.all([
      Habit.find({ userId: request.user._id }).lean(),
      DailyEntry.find({ userId: request.user._id }).sort({ date: 1 }).lean(),
      Craving.find({ userId: request.user._id }).sort({ createdAt: 1 }).lean(),
      SmokingEvent.find({ userId: request.user._id }).sort({ smokedAt: 1 }).lean(),
      EmailDelivery.find({ userId: request.user._id }).sort({ createdAt: 1 }).lean()
    ]);
    response.setHeader("Content-Disposition", `attachment; filename="reset-data-${new Date().toISOString().slice(0, 10)}.json"`);
    response.json({ exportedAt: new Date().toISOString(), account: user, habits, dailyEntries, cravings, smokingEvents, emailDeliveries });
  })
);

router.delete(
  "/account",
  requireAuth,
  asyncRoute(async (request, response) => {
    const password = String(request.body?.password || "");
    const confirmation = String(request.body?.confirmation || "");
    const user = await User.findById(request.user._id).select("+password");
    if (confirmation !== "DELETE MY RESET" || !(await user.comparePassword(password))) {
      throw httpError("Password or confirmation text is incorrect.", 400);
    }
    user.email = `deleted-${crypto.randomUUID()}@invalid.local`;
    user.name = "Deleted user";
    user.deletedAt = new Date();
    user.authVersion += 1;
    user.password = crypto.randomBytes(32).toString("hex");
    user.role = "user";
    user.plan = "free";
    user.lifetime.active = false;
    user.lifetime.paymentStatus = "deleted";
    user.lifetime.stripeCustomerId = "";
    user.lifetime.stripePaymentIntentId = "";
    user.lifetime.stripeCheckoutSessionId = "";
    user.preferences = { goals: [] };
    user.emailPreferences = { morningEnabled: false, eveningEnabled: false, weeklyEnabled: false };
    await user.save();
    await Promise.all([
      Habit.deleteMany({ userId: user._id }),
      DailyEntry.deleteMany({ userId: user._id }),
      Craving.deleteMany({ userId: user._id }),
      SmokingEvent.deleteMany({ userId: user._id }),
      EmailDelivery.deleteMany({ userId: user._id })
    ]);
    clearSessionCookie(response);
    response.json({ ok: true });
  })
);

export default router;
