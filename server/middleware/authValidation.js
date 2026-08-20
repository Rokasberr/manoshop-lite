const { createHttpError } = require("../utils/httpError");
const { getPasswordPolicyError, isValidEmail, normalizeEmail } = require("../utils/authInput");

const validateRegisterInput = (req, _res, next) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (name.length < 2 || name.length > 80) {
    return next(createHttpError("Vardui reikia 2-80 simbolių.", 400));
  }

  if (!isValidEmail(email)) {
    return next(createHttpError("Įvesk galiojantį el. pašto adresą.", 400));
  }

  const passwordError = getPasswordPolicyError(password);

  if (passwordError) {
    return next(createHttpError(passwordError, 400));
  }

  req.body.name = name;
  req.body.email = email;
  next();
};

const validateLoginInput = (req, _res, next) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!isValidEmail(email) || !password) {
    return next(createHttpError("Įvesk galiojančius prisijungimo duomenis.", 400));
  }

  req.body.email = email;
  next();
};

const validateForgotPasswordInput = (req, _res, next) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return next(createHttpError("Įvesk galiojantį el. pašto adresą.", 400));
  }

  req.body.email = email;
  next();
};

const validateResetPasswordInput = (req, _res, next) => {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");
  const passwordError = getPasswordPolicyError(password);

  if (!token || token.length < 32 || token.length > 256) {
    return next(createHttpError("Slaptažodžio atkūrimo nuoroda neteisinga arba pasibaigusi.", 400));
  }

  if (passwordError) {
    return next(createHttpError(passwordError, 400));
  }

  req.body.token = token;
  next();
};

const validateChangePasswordInput = (req, _res, next) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  const passwordError = getPasswordPolicyError(newPassword);

  if (!currentPassword) {
    return next(createHttpError("Dabartinis slaptažodis yra privalomas.", 400));
  }

  if (passwordError) {
    return next(createHttpError(passwordError, 400));
  }

  req.body.currentPassword = currentPassword;
  req.body.newPassword = newPassword;
  next();
};

module.exports = {
  validateChangePasswordInput,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
};
