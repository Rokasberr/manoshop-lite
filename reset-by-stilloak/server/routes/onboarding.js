import express from "express";
import Habit from "../models/Habit.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeUser } from "../services/authService.js";
import { buildDefaultHabits } from "../services/routineService.js";
import { asyncRoute, clamp, cleanText, httpError } from "../utils/http.js";
import { isValidTimeZone } from "../utils/dates.js";

const router = express.Router();
const allowedGoals = ["scroll", "smoking", "sleep", "exercise", "reading", "procrastination", "routine", "meals", "productivity"];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

router.post(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const input = request.body || {};
    const goals = Array.isArray(input.goals) ? [...new Set(input.goals.filter((goal) => allowedGoals.includes(goal)))] : [];
    if (!goals.length) throw httpError("Choose at least one area to improve.", 400);
    const wakeTime = timePattern.test(input.wakeTime) ? input.wakeTime : "08:00";
    const bedtime = timePattern.test(input.bedtime) ? input.bedtime : "23:30";
    const scheduleMode = input.scheduleMode === "flexible" ? "flexible" : "exact";
    const timeZone = isValidTimeZone(input.timeZone) ? input.timeZone : "Europe/Vilnius";
    const cigarettesPerDay = clamp(input.cigarettesPerDay, 0, 200);
    const screenTimeMinutes = clamp(input.screenTimeMinutes, 0, 1440);
    request.user.preferences = {
      goals,
      wakeTime,
      bedtime,
      cigarettesPerDay,
      cigaretteTarget: Math.max(0, cigarettesPerDay - (goals.includes("smoking") && cigarettesPerDay > 0 ? 1 : 0)),
      screenTimeMinutes,
      screenTargetMinutes: Math.max(30, screenTimeMinutes - (goals.includes("scroll") ? 30 : 0)),
      exerciseFrequency: clamp(input.exerciseFrequency, 0, 14),
      readingMinutes: clamp(input.readingMinutes, 0, 600),
      morningRoutine: cleanText(input.morningRoutine || "Water, shower, breakfast", 240),
      eveningRoutine: cleanText(input.eveningRoutine || "No-scroll wind-down, hygiene, reading", 240),
      scheduleMode,
      timeZone
    };
    request.user.emailPreferences = {
      ...request.user.emailPreferences.toObject?.(),
      morningEnabled: input.morningEmailEnabled !== false,
      morningTime: timePattern.test(input.morningEmailTime) ? input.morningEmailTime : wakeTime,
      eveningEnabled: Boolean(input.eveningEmailEnabled),
      eveningTime: timePattern.test(input.eveningEmailTime) ? input.eveningEmailTime : "21:30",
      weeklyEnabled: true
    };
    request.user.onboardingComplete = true;
    request.user.resetDuration = request.user.lifetime?.active && [30, 60, 90].includes(Number(input.resetDuration)) ? Number(input.resetDuration) : 7;
    request.user.resetStartedAt = new Date();
    await request.user.save();

    await Habit.deleteMany({ userId: request.user._id, isDefault: true });
    const defaults = buildDefaultHabits(goals, scheduleMode);
    await Habit.insertMany(defaults.map((habit) => ({ ...habit, userId: request.user._id })));
    response.json({ user: serializeUser(request.user), generatedHabits: defaults });
  })
);

export default router;
