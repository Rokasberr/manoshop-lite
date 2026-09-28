import express from "express";
import Craving from "../models/Craving.js";
import DailyEntry from "../models/DailyEntry.js";
import { requireAuth } from "../middleware/auth.js";
import { buildProgress } from "../services/analyticsService.js";
import { dateKey } from "../utils/dates.js";
import { hasLifetimeAccess } from "../utils/access.js";
import { asyncRoute, httpError } from "../utils/http.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const requested = request.query.range === "all" ? "all" : Number(request.query.range) === 30 ? 30 : 7;
    if (requested !== 7 && !hasLifetimeAccess(request.user)) {
      throw httpError("Founding Lifetime access is required for 30-day and all-time progress.", 403, "LIFETIME_REQUIRED");
    }
    const query = { userId: request.user._id };
    let fromDate = request.user.createdAt;
    if (requested !== "all") {
      fromDate = new Date(Date.now() - (requested - 1) * 86_400_000);
      query.date = { $gte: dateKey(fromDate, request.user.preferences.timeZone) };
    }
    const [entries, cravings] = await Promise.all([
      DailyEntry.find(query).sort({ date: 1 }).lean(),
      Craving.find({ userId: request.user._id, createdAt: { $gte: fromDate } }).lean()
    ]);
    const progress = buildProgress({ entries, cravings });
    if (!hasLifetimeAccess(request.user)) {
      progress.summary.averageCigarettes = null;
      progress.summary.cigarettesAvoided = 0;
      progress.summary.averageScreenTimeMinutes = null;
      progress.points = progress.points.map((point) => ({ ...point, cigarettes: null, screenTimeMinutes: null }));
    }
    response.json(progress);
  })
);

export default router;
