const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const connectDatabase = require("../database/connect");
const authRoutes = require("./routes/authRoutes");
const billingRoutes = require("./routes/billingRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const savingsStudioRoutes = require("./routes/savingsStudioRoutes");
const launchSoonRoutes = require("./routes/launchSoonRoutes");
const { validateEnvironment } = require("./config/env");
const { startSavingsStudioSummaryScheduler } = require("./services/savingsStudioScheduler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const securityHeaders = require("./middleware/securityHeaders");
const { handleStripeWebhook } = require("./controllers/billingController");
const { getConfiguredOrigins, isAllowedOrigin } = require("./utils/originMatcher");

dotenv.config();
validateEnvironment();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = getConfiguredOrigins();

if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin, allowedOrigins)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin neleidžiamas."));
    },
    credentials: true,
  })
);
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const uploadsDirectories = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "..", "uploads"),
];

uploadsDirectories.forEach((uploadsDirectory) => {
  app.use("/uploads", express.static(uploadsDirectory));
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "manoshop-server" });
});

app.use("/api", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/savings-studio", savingsStudioRoutes);
app.use("/api/launch-soon", launchSoonRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    startSavingsStudioSummaryScheduler();
    app.listen(port, () => {
      console.log(`Serveris paleistas: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Nepavyko paleisti serverio:", error.message);
    process.exit(1);
  }
};

startServer();
