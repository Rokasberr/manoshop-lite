import cookieParser from "cookie-parser";
import express from "express";
import { getConfig, validateRuntimeConfig } from "./config.js";
import { connectDatabase } from "./db.js";
import { apiSecurity, securityHeaders } from "./middleware/security.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import billingRoutes, { stripeWebhook } from "./routes/billing.js";
import contentRoutes from "./routes/content.js";
import cronRoutes from "./routes/cron.js";
import habitRoutes from "./routes/habits.js";
import onboardingRoutes from "./routes/onboarding.js";
import programRoutes from "./routes/programs.js";
import progressRoutes from "./routes/progress.js";
import settingsRoutes from "./routes/settings.js";
import todayRoutes from "./routes/today.js";
import { asyncRoute } from "./utils/http.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);

app.post("/api/billing/webhook", express.raw({ type: "application/json", limit: "1mb" }), stripeWebhook);

app.use("/api", apiSecurity);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));
app.use(cookieParser());

app.get(
  "/api/health",
  asyncRoute(async (_request, response) => {
    validateRuntimeConfig();
    const connection = await connectDatabase();
    await connection.db.admin().ping();
    response.json({ status: "ok", service: "reset-by-stilloak" });
  })
);

app.use(
  "/api",
  asyncRoute(async (_request, _response, next) => {
    validateRuntimeConfig();
    await connectDatabase();
    next();
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/today", todayRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cron", cronRoutes);

app.use("/api", (_request, response) => response.status(404).json({ error: "API route not found." }));

app.use((error, _request, response, _next) => {
  void _next;
  const statusCode = Number(error.statusCode || error.status || 500);
  const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;
  const message = safeStatus >= 500 && getConfig().nodeEnv === "production" ? "Something went wrong." : error.message;
  if (getConfig().nodeEnv !== "test" && safeStatus >= 500) console.error("[reset-api]", error);
  response.status(safeStatus).json({ error: message || "Request failed.", code: error.code || "REQUEST_FAILED" });
});

export default app;
