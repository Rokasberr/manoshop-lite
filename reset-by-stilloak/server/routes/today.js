import express from "express";
import Craving from "../models/Craving.js";
import DailyEntry from "../models/DailyEntry.js";
import Habit from "../models/Habit.js";
import Podcast from "../models/Podcast.js";
import ProgramDay from "../models/ProgramDay.js";
import SmokingEvent from "../models/SmokingEvent.js";
import { requireAuth, requireLifetime } from "../middleware/auth.js";
import { buildProgramDay, getCurrentProgramDay } from "../services/programService.js";
import { boredomSuggestions, buildRoutine, completionPercent } from "../services/routineService.js";
import { dateKey, isDateKey } from "../utils/dates.js";
import { hasLifetimeAccess } from "../utils/access.js";
import { asyncRoute, clamp, cleanText, httpError } from "../utils/http.js";

const router = express.Router();

const ensureToday = async (user, now = new Date()) => {
  const key = dateKey(now, user.preferences.timeZone);
  const [habits, found] = await Promise.all([
    Habit.find({ userId: user._id, archived: false }).lean(),
    DailyEntry.findOne({ userId: user._id, date: key })
  ]);
  const routine = buildRoutine({ preferences: user.preferences, habits, existing: found?.routine || [], date: now });
  const defaults = {
    routine,
    cigaretteTarget: user.preferences.cigaretteTarget,
    screenTargetMinutes: user.preferences.screenTargetMinutes
  };
  const entry = found || (await DailyEntry.create({ userId: user._id, date: key, ...defaults }));
  if (found && JSON.stringify(found.routine) !== JSON.stringify(routine)) {
    entry.routine = routine;
    await entry.save();
  }
  return entry;
};

router.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    if (!request.user.onboardingComplete) throw httpError("Complete onboarding first.", 409, "ONBOARDING_REQUIRED");
    const now = new Date();
    const entry = await ensureToday(request.user, now);
    const day = getCurrentProgramDay(request.user, now);
    const override = await ProgramDay.findOne({ duration: request.user.resetDuration, day, active: true }).lean();
    const podcast = await Podcast.findOne({ active: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    const premium = hasLifetimeAccess(request.user);
    const [recentCravings, smokingEvents] = premium
      ? await Promise.all([
          Craving.find({ userId: request.user._id, startedAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) } })
            .sort({ startedAt: -1 })
            .lean(),
          SmokingEvent.find({ userId: request.user._id, date: entry.date }).sort({ smokedAt: 1 }).lean()
        ])
      : [[], []];
    const cravings = recentCravings.filter((item) => isDateKey(item.startedAt, entry.date, request.user.preferences.timeZone));
    const intervals = smokingEvents.slice(1).map((event, index) => (new Date(event.smokedAt) - new Date(smokingEvents[index].smokedAt)) / 60_000);
    const averageIntervalMinutes = intervals.length ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : null;
    response.json({
      date: entry.date,
      day,
      duration: request.user.resetDuration,
      program: override || buildProgramDay(day),
      entry,
      completion: completionPercent(entry.routine),
      podcast,
      smoking: {
        cravingsDelayed: cravings.filter((item) => item.resolvedAt).length,
        cigarettesAvoided: cravings.filter((item) => item.cigaretteAvoided).length,
        averageIntervalMinutes,
        lastCigaretteAt: smokingEvents.at(-1)?.smokedAt || entry.lastCigaretteAt || null
      }
    });
  })
);

router.patch(
  "/items/:key",
  requireAuth,
  asyncRoute(async (request, response) => {
    const entry = await ensureToday(request.user);
    const item = entry.routine.find((candidate) => candidate.key === request.params.key);
    if (!item) throw httpError("Routine item not found.", 404);
    if (!["pending", "done", "skipped"].includes(request.body.status)) throw httpError("Invalid routine status.", 400);
    item.status = request.body.status;
    item.note = cleanText(request.body.note, 400);
    await entry.save();
    response.json({ entry, completion: completionPercent(entry.routine) });
  })
);

router.post(
  "/check-in",
  requireAuth,
  asyncRoute(async (request, response) => {
    const entry = await ensureToday(request.user);
    if (hasLifetimeAccess(request.user)) {
      entry.cigarettes = request.body.cigarettes === "" ? null : clamp(request.body.cigarettes, 0, 200);
      entry.screenTimeMinutes = request.body.screenTimeMinutes === "" ? null : clamp(request.body.screenTimeMinutes, 0, 1440);
    }
    entry.workout = typeof request.body.workout === "boolean" ? request.body.workout : null;
    entry.readingMinutes = request.body.readingMinutes === "" ? null : clamp(request.body.readingMinutes, 0, 600);
    entry.mood = request.body.mood === "" ? null : clamp(request.body.mood, 1, 5);
    entry.wentWell = cleanText(request.body.wentWell, 500);
    entry.completedAt = new Date();
    await entry.save();
    response.json({ entry, completion: completionPercent(entry.routine) });
  })
);

router.post(
  "/smoking",
  requireAuth,
  requireLifetime,
  asyncRoute(async (request, response) => {
    const entry = await ensureToday(request.user);
    entry.cigarettes = clamp(request.body.cigarettes, 0, 200);
    entry.cigaretteTarget = clamp(request.body.target, 0, 200);
    if (request.body.lastCigaretteAt) entry.lastCigaretteAt = new Date(request.body.lastCigaretteAt);
    await entry.save();
    response.json({ entry });
  })
);

router.post(
  "/smoking/cigarette",
  requireAuth,
  requireLifetime,
  asyncRoute(async (request, response) => {
    const entry = await ensureToday(request.user);
    const smokedAt = request.body.smokedAt ? new Date(request.body.smokedAt) : new Date();
    if (Number.isNaN(smokedAt.getTime())) throw httpError("Invalid cigarette time.", 400);
    const event = await SmokingEvent.create({
      userId: request.user._id,
      date: entry.date,
      smokedAt,
      trigger: cleanText(request.body.trigger, 100)
    });
    entry.cigarettes = Number(entry.cigarettes || 0) + 1;
    entry.lastCigaretteAt = smokedAt;
    await entry.save();
    response.status(201).json({ event, entry });
  })
);

router.post(
  "/smoking/cravings",
  requireAuth,
  requireLifetime,
  asyncRoute(async (request, response) => {
    const craving = await Craving.create({
      userId: request.user._id,
      level: clamp(request.body.level, 1, 5),
      trigger: cleanText(request.body.trigger, 100)
    });
    response.status(201).json({ craving, readyAt: new Date(craving.startedAt.getTime() + 10 * 60 * 1000) });
  })
);

router.patch(
  "/smoking/cravings/:id",
  requireAuth,
  requireLifetime,
  asyncRoute(async (request, response) => {
    if (typeof request.body.stillWanted !== "boolean") throw httpError("Choose yes or no.", 400);
    const craving = await Craving.findOne({ _id: request.params.id, userId: request.user._id });
    if (!craving) throw httpError("Craving check-in not found.", 404);
    craving.resolvedAt = new Date();
    craving.stillWanted = request.body.stillWanted;
    craving.cigaretteAvoided = !request.body.stillWanted;
    await craving.save();
    response.json({ craving });
  })
);

router.post(
  "/screen",
  requireAuth,
  requireLifetime,
  asyncRoute(async (request, response) => {
    const entry = await ensureToday(request.user);
    entry.screenTimeMinutes = clamp(request.body.screenTimeMinutes, 0, 1440);
    entry.screenTargetMinutes = clamp(request.body.targetMinutes, 0, 1440);
    entry.noScrollCompleted = typeof request.body.noScrollCompleted === "boolean" ? request.body.noScrollCompleted : null;
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(request.body.noScrollStart)) entry.noScrollStart = request.body.noScrollStart;
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(request.body.noScrollEnd)) entry.noScrollEnd = request.body.noScrollEnd;
    await entry.save();
    response.json({ entry });
  })
);

router.get("/bored/:minutes", requireAuth, requireLifetime, (request, response) => {
  const minutes = [5, 15, 30, 60, 120].includes(Number(request.params.minutes)) ? Number(request.params.minutes) : 15;
  response.json({ minutes, suggestions: boredomSuggestions[minutes] });
});

export default router;
