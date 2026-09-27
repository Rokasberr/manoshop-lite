import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { serializeUser } from "../services/authService.js";
import { asyncRoute, clamp } from "../utils/http.js";

const router = express.Router();
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

router.patch(
  "/email",
  requireAuth,
  asyncRoute(async (request, response) => {
    request.user.emailPreferences = {
      morningEnabled: Boolean(request.body.morningEnabled),
      morningTime: timePattern.test(request.body.morningTime) ? request.body.morningTime : request.user.emailPreferences.morningTime,
      eveningEnabled: Boolean(request.body.eveningEnabled),
      eveningTime: timePattern.test(request.body.eveningTime) ? request.body.eveningTime : request.user.emailPreferences.eveningTime,
      weeklyEnabled: Boolean(request.body.weeklyEnabled)
    };
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  })
);

router.patch(
  "/targets",
  requireAuth,
  asyncRoute(async (request, response) => {
    request.user.preferences.cigaretteTarget = clamp(request.body.cigaretteTarget, 0, 200);
    request.user.preferences.screenTargetMinutes = clamp(request.body.screenTargetMinutes, 0, 1440);
    request.user.preferences.readingMinutes = clamp(request.body.readingMinutes, 0, 600);
    request.user.preferences.scheduleMode = request.body.scheduleMode === "flexible" ? "flexible" : "exact";
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  })
);

export default router;
