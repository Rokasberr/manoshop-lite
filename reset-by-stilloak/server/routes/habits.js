import express from "express";
import DailyEntry from "../models/DailyEntry.js";
import Habit from "../models/Habit.js";
import { requireAuth } from "../middleware/auth.js";
import { buildHabitStats } from "../services/analyticsService.js";
import { asyncRoute, cleanText, httpError } from "../utils/http.js";

const router = express.Router();
const anchors = ["Morning", "Midday", "Afternoon", "Evening", "Before bed"];
const frequencies = ["daily", "weekdays", "custom"];
const parseHabit = (body) => {
  const title = cleanText(body.title, 100);
  if (title.length < 2) throw httpError("Habit title is too short.", 400);
  const frequency = frequencies.includes(body.frequency) ? body.frequency : "daily";
  const scheduleMode = body.scheduleMode === "exact" ? "exact" : "flexible";
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(body.time) ? body.time : "";
  const anchor = anchors.includes(body.anchor) ? body.anchor : "Morning";
  const days = frequency === "custom" && Array.isArray(body.days) ? [...new Set(body.days.map(Number).filter((day) => day >= 0 && day <= 6))] : [];
  return { title, frequency, scheduleMode, time, anchor, days };
};

router.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const habits = await Habit.find({ userId: request.user._id, archived: false }).sort({ createdAt: 1 }).lean();
    const since = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);
    const entries = await DailyEntry.find({ userId: request.user._id, date: { $gte: since } }).sort({ date: 1 }).lean();
    response.json({ habits: habits.map((habit) => ({ ...habit, stats: buildHabitStats({ habit, entries }) })) });
  })
);

router.post(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const activeCount = await Habit.countDocuments({ userId: request.user._id, archived: false });
    if (!request.user.lifetime?.active && activeCount >= 5) throw httpError("Free accounts can track up to 5 habits.", 403, "HABIT_LIMIT");
    const habit = await Habit.create({ userId: request.user._id, ...parseHabit(request.body) });
    response.status(201).json({ habit });
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    const habit = await Habit.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id, archived: false },
      { $set: parseHabit(request.body) },
      { new: true, runValidators: true }
    );
    if (!habit) throw httpError("Habit not found.", 404);
    response.json({ habit });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncRoute(async (request, response) => {
    const habit = await Habit.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      { $set: { archived: true } },
      { new: true }
    );
    if (!habit) throw httpError("Habit not found.", 404);
    response.json({ ok: true });
  })
);

export default router;
