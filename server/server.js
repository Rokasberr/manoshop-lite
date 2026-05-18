const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const connectDatabase = require("../database/connect");
const authRoutes = require("./routes/authRoutes");
const billingRoutes = require("./routes/billingRoutes");
const digitalProductRoutes = require("./routes/digitalProductRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const savingsStudioRoutes = require("./routes/savingsStudioRoutes");
const launchSoonRoutes = require("./routes/launchSoonRoutes");
const businessRoutes = require("./routes/businessRoutes");
const storeRoutes = require("./routes/storeRoutes");
const { validateEnvironment } = require("./config/env");
const { startSavingsStudioSummaryScheduler } = require("./services/savingsStudioScheduler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const securityHeaders = require("./middleware/securityHeaders");
const { handleStripeWebhook } = require("./controllers/billingController");
const { getConfiguredOrigins, isAllowedOrigin } = require("./utils/originMatcher");

dotenv.config({ path: path.resolve(__dirname, ".env") });
validateEnvironment();

const app = express();
const defaultPort = 5000;
const normalizePort = (value) => {
  if (!value) {
    return defaultPort;
  }

  const trimmedValue = String(value).trim();

  if (!/^\d+$/.test(trimmedValue)) {
    console.warn(
      `[server] Netinkama PORT reikšmė "${value}". Naudojamas atsarginis portas ${defaultPort}.`
    );
    return defaultPort;
  }

  const parsedPort = Number.parseInt(trimmedValue, 10);

  if (parsedPort < 1 || parsedPort > 65535) {
    console.warn(
      `[server] PORT turi būti tarp 1 ir 65535. Naudojamas atsarginis portas ${defaultPort}.`
    );
    return defaultPort;
  }

  return parsedPort;
};

const port = normalizePort(process.env.PORT);
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
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/digital-products", digitalProductRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/savings-studio", savingsStudioRoutes);
app.use("/api/launch-soon", launchSoonRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/stores", storeRoutes);

app.use(notFound);
app.use(errorHandler);

const printPortInUseHelp = (busyPort) => {
  console.error(
    [
      `[server] Portas ${busyPort} jau užimtas (EADDRINUSE).`,
      "",
      "Windows PowerShell komandos procesui rasti ir sustabdyti:",
      `  Get-NetTCPConnection -LocalPort ${busyPort} -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess`,
      "  Stop-Process -Id <PID> -Force",
      "",
      "Windows CMD alternatyva:",
      `  netstat -ano | findstr :${busyPort}`,
      "  taskkill /PID <PID> /F",
      "",
      "Kitas variantas: pakeisk server/.env į PORT=5001 ir client/.env į VITE_API_URL=http://localhost:5001/api.",
    ].join("\n")
  );
};

const listen = () =>
  new Promise((resolve, reject) => {
    const httpServer = app.listen(port, () => {
      console.log(`Serveris paleistas: http://localhost:${port}`);
      resolve(httpServer);
    });

    httpServer.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        printPortInUseHelp(port);
      }

      reject(error);
    });
  });

const startServer = async () => {
  try {
    await connectDatabase();
    await listen();
    startSavingsStudioSummaryScheduler();
  } catch (error) {
    if (error.code !== "EADDRINUSE") {
      console.error("Nepavyko paleisti serverio:", error.message);
    }

    process.exit(1);
  }
};

startServer();
