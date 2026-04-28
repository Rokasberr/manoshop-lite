const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const connectDatabase = require("../database/connect");
const authRoutes = require("./routes/authRoutes");
const billingRoutes = require("./routes/billingRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const savingsStudioRoutes = require("./routes/savingsStudioRoutes");
const { startSavingsStudioSummaryScheduler } = require("./services/savingsStudioScheduler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { handleStripeWebhook } = require("./controllers/billingController");
const { getConfiguredOrigins, isAllowedOrigin } = require("./utils/originMatcher");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = getConfiguredOrigins();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "manoshop-server" });
});

app.use("/api", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/savings-studio", savingsStudioRoutes);

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
