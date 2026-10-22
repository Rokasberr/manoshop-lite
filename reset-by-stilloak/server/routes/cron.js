import express from "express";
import { getConfig } from "../config.js";
import { runHourlyEmails } from "../services/cronService.js";
import { asyncRoute, httpError } from "../utils/http.js";

const router = express.Router();

router.get(
  "/hourly",
  asyncRoute(async (request, response) => {
    const secret = getConfig().cronSecret;
    if (!secret || request.headers.authorization !== `Bearer ${secret}`) throw httpError("Cron authorization failed.", 401);
    response.json(await runHourlyEmails());
  })
);

export default router;
