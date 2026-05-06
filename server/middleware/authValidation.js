const { createHttpError } = require("../utils/httpError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterInput = (req, _res, next) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (name.length < 2 || name.length > 80) {
    return next(createHttpError("Vardui reikia 2-80 simbolių.", 400));
  }

  if (!EMAIL_PATTERN.test(email)) {
    return next(createHttpError("Įvesk galiojantį el. pašto adresą.", 400));
  }

  if (password.length < 6 || password.length > 128) {
    return next(createHttpError("Slaptažodis turi būti 6-128 simbolių.", 400));
  }

  req.body.name = name;
  req.body.email = email;
  next();
};

const validateLoginInput = (req, _res, next) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!EMAIL_PATTERN.test(email) || !password) {
    return next(createHttpError("Įvesk galiojančius prisijungimo duomenis.", 400));
  }

  req.body.email = email;
  next();
};

module.exports = {
  validateLoginInput,
  validateRegisterInput,
};
