const crypto = require("crypto");

const User = require("../models/User");
const { sendPasswordResetEmail } = require("./passwordResetEmailService");
const { getPasswordPolicyError, isValidEmail, normalizeEmail } = require("../utils/authInput");
const { createHttpError } = require("../utils/httpError");

const PASSWORD_RESET_GENERIC_MESSAGE =
  "Jei paskyra su šiuo el. paštu egzistuoja, išsiuntėme slaptažodžio atkūrimo nuorodą.";
const PASSWORD_RESET_INVALID_MESSAGE = "Slaptažodžio atkūrimo nuoroda neteisinga arba pasibaigusi.";
const DEFAULT_RESET_TOKEN_TTL_MINUTES = 15;
const RESET_TOKEN_BYTES = 32;

const getResetTokenTtlMinutes = () => {
  const parsed = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || DEFAULT_RESET_TOKEN_TTL_MINUTES);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 60
    ? parsed
    : DEFAULT_RESET_TOKEN_TTL_MINUTES;
};

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(String(token || ""), "utf8").digest("hex");

const generateResetToken = () => crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");

const firstClientUrl = () => String(process.env.CLIENT_URL || "").split(",")[0]?.trim() || "";

const getPasswordResetBaseUrl = () =>
  process.env.PASSWORD_RESET_BASE_URL?.trim() || firstClientUrl() || "http://localhost:5174";

const buildPasswordResetUrl = (token) => {
  const baseUrl = getPasswordResetBaseUrl();
  const url = new URL("/reset-password", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

const resolveQuery = async (query, select = "") =>
  typeof query?.select === "function" ? query.select(select) : query;

const requestPasswordReset = async ({
  email,
  userModel = User,
  emailSender = sendPasswordResetEmail,
  logger = console,
  now = () => new Date(),
  tokenFactory = generateResetToken,
} = {}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError("Įvesk galiojantį el. pašto adresą.", 400);
  }

  const user = await resolveQuery(
    userModel.findOne({ email: normalizedEmail }),
    "+passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (!user) {
    return { message: PASSWORD_RESET_GENERIC_MESSAGE, emailSent: false };
  }

  const rawToken = tokenFactory();
  const expiresAt = new Date(now().getTime() + getResetTokenTtlMinutes() * 60_000);

  user.passwordResetTokenHash = hashResetToken(rawToken);
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  try {
    await emailSender({
      to: user.email,
      resetUrl: buildPasswordResetUrl(rawToken),
      userName: user.name,
    });
  } catch (error) {
    logger.warn?.("[auth] Password reset email failed.", {
      reason: error?.code || error?.statusCode || error?.name || "email-error",
    });
  }

  return { message: PASSWORD_RESET_GENERIC_MESSAGE, emailSent: true };
};

const resetPassword = async ({
  token,
  password,
  userModel = User,
  now = () => new Date(),
} = {}) => {
  const rawToken = String(token || "").trim();
  const passwordError = getPasswordPolicyError(password);

  if (!rawToken || rawToken.length < 32 || rawToken.length > 256) {
    throw createHttpError(PASSWORD_RESET_INVALID_MESSAGE, 400);
  }

  if (passwordError) {
    throw createHttpError(passwordError, 400);
  }

  const tokenHash = hashResetToken(rawToken);
  const user = await resolveQuery(
    userModel.findOne({ passwordResetTokenHash: tokenHash }),
    "+password +passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= now().getTime()) {
    if (user) {
      user.passwordResetTokenHash = "";
      user.passwordResetExpiresAt = null;
      await user.save();
    }

    throw createHttpError(PASSWORD_RESET_INVALID_MESSAGE, 400);
  }

  user.password = String(password);
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.authVersion = Number(user.authVersion || 0) + 1;
  user.passwordChangedAt = now();
  await user.save();

  return { message: "Slaptažodis atnaujintas. Dabar gali prisijungti." };
};

module.exports = {
  PASSWORD_RESET_GENERIC_MESSAGE,
  PASSWORD_RESET_INVALID_MESSAGE,
  buildPasswordResetUrl,
  generateResetToken,
  getResetTokenTtlMinutes,
  hashResetToken,
  requestPasswordReset,
  resetPassword,
};
