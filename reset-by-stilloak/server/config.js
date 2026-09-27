const requiredProductionKeys = ["RESET_MONGO_URI", "RESET_JWT_SECRET", "RESET_APP_URL"];

export const getConfig = () => ({
  appUrl: (process.env.RESET_APP_URL || "http://localhost:5173").replace(/\/+$/, ""),
  apiUrl: (process.env.RESET_API_URL || "http://localhost:4000").replace(/\/+$/, ""),
  mongoUri: process.env.RESET_MONGO_URI || "",
  jwtSecret: process.env.RESET_JWT_SECRET || "",
  cookieName: process.env.RESET_COOKIE_NAME || "reset_session",
  nodeEnv: process.env.NODE_ENV || "development",
  stripeSecretKey: process.env.RESET_STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.RESET_STRIPE_WEBHOOK_SECRET || "",
  stripeLifetimePriceId: process.env.RESET_STRIPE_LIFETIME_PRICE_ID || "",
  stripeLiveEnabled: String(process.env.RESET_STRIPE_LIVE_ENABLED || "").toLowerCase() === "true",
  cronSecret: process.env.CRON_SECRET || ""
});

export const validateRuntimeConfig = () => {
  const config = getConfig();
  const missing = requiredProductionKeys.filter((key) => !process.env[key]);

  if (config.nodeEnv === "production" && missing.length) {
    throw new Error(`Missing required environment configuration: ${missing.join(", ")}`);
  }

  if (config.nodeEnv === "production" && config.jwtSecret.length < 32) {
    throw new Error("RESET_JWT_SECRET must contain at least 32 characters in production.");
  }

  return config;
};
