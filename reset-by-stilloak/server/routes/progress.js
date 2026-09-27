import express from "express";
import Craving from "../models/Craving.js";
import DailyEntry from "../models/DailyEntry.js";
import { requireAuth } from "../middleware/auth.js";
import { buildProgress } from "../services/analyticsService.js";
import { dateKey } from "../utils/dates.js";
import { asyncRoute } from "../utils/http.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncRoute(async (request, response) => {
    const requested = request.query.range === "all" ? "all" : Number(request.query.range) === 30 ? 30 : 7;
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
    response.json(buildProgress({ entries, cravings }));
  })
);

export default router;
