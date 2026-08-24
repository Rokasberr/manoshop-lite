const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

const getUserId = (user) => user?._id || user?.id || null;

const clearPasswordResetTokenIfCurrent = async ({
  userModel,
  user,
  tokenHash,
  expiresAt,
}) => {
  const filter = {
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  };
  const userId = getUserId(user);

  if (userId) {
    filter._id = userId;
  }

  await userModel.updateOne(filter, {
    $set: {
      passwordResetTokenHash: "",
      passwordResetExpiresAt: null,
    },
  });
};

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
    userModel.findOne({ email: normalizedEmail, isDeleted: { $ne: true } }),
    "+passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (!user) {
    return { message: PASSWORD_RESET_GENERIC_MESSAGE, emailSent: false };
  }

  const rawToken = tokenFactory();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(now().getTime() + getResetTokenTtlMinutes() * 60_000);

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  let emailSent = false;

  try {
    const sendResult = await emailSender({
      to: user.email,
      resetUrl: buildPasswordResetUrl(rawToken),
      userName: user.name,
    });
    emailSent = sendResult?.sent !== false && !sendResult?.skipped;
  } catch (error) {
    logger.error?.("[auth] Password reset email delivery failed.", {
      reason: error?.code || error?.statusCode || error?.name || "email-error",
    });
  }

  if (!emailSent) {
    await clearPasswordResetTokenIfCurrent({
      userModel,
      user,
      tokenHash,
      expiresAt,
    });
  }

  return { message: PASSWORD_RESET_GENERIC_MESSAGE, emailSent };
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
  const changedAt = now();
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await userModel.findOneAndUpdate(
    {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: changedAt },
      isDeleted: { $ne: true },
    },
    {
      $set: {
        password: passwordHash,
        passwordResetTokenHash: "",
        passwordResetExpiresAt: null,
        passwordChangedAt: changedAt,
      },
      $inc: {
        authVersion: 1,
      },
    },
    {
      new: true,
      projection: { _id: 1 },
    }
  );

  if (!user) {
    throw createHttpError(PASSWORD_RESET_INVALID_MESSAGE, 400);
  }

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
