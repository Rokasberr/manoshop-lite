const createHttpError = (message, statusCode = 400, details = undefined) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (details !== undefined) {
    error.details = details;
  }

  return error;
};

const normalizeError = (error) => {
  if (error?.name === "ValidationError") {
    return createHttpError(
      "Duomenų validacija nepavyko.",
      400,
      Object.values(error.errors || {}).map((entry) => entry.message)
    );
  }

  if (error?.name === "CastError") {
    return createHttpError("Netinkamas įrašo identifikatorius.", 400);
  }

  if (error?.code === 11000) {
    return createHttpError("Toks įrašas jau egzistuoja.", 409, error.keyValue || undefined);
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return createHttpError("Neteisingas arba pasibaigęs tokenas.", 401);
  }

  return error;
};

module.exports = {
  createHttpError,
  normalizeError,
};
