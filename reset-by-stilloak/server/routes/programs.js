import express from "express";
import ProgramDay from "../models/ProgramDay.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeUser } from "../services/authService.js";
import { buildProgram } from "../services/programService.js";
import { asyncRoute, httpError } from "../utils/http.js";

const router = express.Router();

router.get(
  "/:duration",
  requireAuth,
  asyncRoute(async (request, response) => {
    const duration = Number(request.params.duration);
    if (![7, 30, 60, 90].includes(duration)) throw httpError("Unknown reset duration.", 404);
    if (duration > 7 && !request.user.lifetime?.active && request.user.role !== "admin") {
      throw httpError("Founding Lifetime access is required.", 403, "LIFETIME_REQUIRED");
    }
    const overrides = await ProgramDay.find({ duration, active: true }).lean();
    const overrideMap = new Map(overrides.map((day) => [day.day, day]));
    const program = buildProgram(duration).map((day) => overrideMap.get(day.day) || day);
    response.json({ duration, program });
  })
);

router.post(
  "/select",
  requireAuth,
  asyncRoute(async (request, response) => {
    const duration = Number(request.body.duration);
    if (![7, 30, 60, 90].includes(duration)) throw httpError("Unknown reset duration.", 400);
    if (duration > 7 && !request.user.lifetime?.active && request.user.role !== "admin") {
      throw httpError("Founding Lifetime access is required.", 403, "LIFETIME_REQUIRED");
    }
    request.user.resetDuration = duration;
    request.user.resetStartedAt = new Date();
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  })
);

export default router;
