const { normalizeError } = require("../utils/httpError");
const { recordOperationalEvent } = require("../services/operationalAlertService");

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Kelias nerastas: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, _next) => {
  const normalizedError = normalizeError(err);
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : normalizedError.statusCode || normalizedError.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    statusCode >= 500 && isProduction
      ? "Serverio klaida. Bandyk dar kartą vėliau."
      : normalizedError.message || "Serverio klaida";

  if (statusCode >= 500) {
    void recordOperationalEvent({
      type: "application_error",
      severity: "critical",
      message: normalizedError.message || "Nežinoma serverio klaida",
      context: { method: req.method, path: req.originalUrl, statusCode },
      notify: true,
    }).catch((recordError) => console.error(JSON.stringify({ level: "error", event: "operational_event_write_failed", message: recordError.message })));
  }

  res.status(statusCode).json({
    message,
    code: normalizedError.code || undefined,
    details: normalizedError.details || undefined,
    stack: isProduction ? undefined : normalizedError.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
