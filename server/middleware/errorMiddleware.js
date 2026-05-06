const { normalizeError } = require("../utils/httpError");

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Kelias nerastas: ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
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
