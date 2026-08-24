const crypto = require("crypto");

const User = require("../models/User");
const { createHttpError } = require("../utils/httpError");
const { sendEmailVerificationEmail } = require("./emailVerificationEmailService");

const TOKEN_BYTES = 32;
const DEFAULT_TTL_HOURS = 24;
const INVALID_MESSAGE = "El. pasto patvirtinimo nuoroda neteisinga arba pasibaigusi.";

const hashEmailVerificationToken = (token) =>
  crypto.createHash("sha256").update(String(token || ""), "utf8").digest("hex");

const generateEmailVerificationToken = () => crypto.randomBytes(TOKEN_BYTES).toString("hex");

const getEmailVerificationTtlHours = () => {
  const parsed = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS || DEFAULT_TTL_HOURS);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 168 ? parsed : DEFAULT_TTL_HOURS;
};

const firstClientUrl = () => String(process.env.CLIENT_URL || "").split(",")[0]?.trim() || "";

const getEmailVerificationBaseUrl = () =>
  process.env.EMAIL_VERIFICATION_BASE_URL?.trim() || firstClientUrl() || "http://localhost:5174";

const buildEmailVerificationUrl = (token) => {
  const url = new URL("/verify-email", getEmailVerificationBaseUrl());
  url.searchParams.set("token", token);
  return url.toString();
};

const resolveQuery = async (query, select = "") =>
  typeof query?.select === "function" ? query.select(select) : query;

const createEmailVerificationTokenForUser = async ({
  user,
  userModel = User,
  now = () => new Date(),
  tokenFactory = generateEmailVerificationToken,
} = {}) => {
  const rawToken = tokenFactory();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const ttlHours = getEmailVerificationTtlHours();
  const expiresAt = new Date(now().getTime() + ttlHours * 60 * 60_000);
  const sentAt = now();

  user.emailVerificationRequired = true;
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  user.emailVerificationSentAt = sentAt;

  if (typeof user.save === "function") {
    await user.save();
  }

  return {
    rawToken,
    tokenHash,
    expiresAt,
    sentAt,
    ttlHours,
    verificationUrl: buildEmailVerificationUrl(rawToken),
    userModel,
  };
};

const sendVerificationForUser = async ({
  user,
  userModel = User,
  emailSender = sendEmailVerificationEmail,
  logger = console,
  now = () => new Date(),
  tokenFactory = generateEmailVerificationToken,
} = {}) => {
  if (!user || user.isDeleted) {
    return { sent: false, skipped: true };
  }

  if (user.emailVerifiedAt || user.emailVerificationRequired === false) {
    return { sent: false, skipped: true, alreadyVerified: true };
  }

  const tokenState = await createEmailVerificationTokenForUser({ user, userModel, now, tokenFactory });

  try {
    const result = await emailSender({
      to: user.email,
      verificationUrl: tokenState.verificationUrl,
      userName: user.name,
      ttlHours: tokenState.ttlHours,
    });

    return {
      sent: result?.sent !== false && !result?.skipped,
      skipped: Boolean(result?.skipped),
      alreadyVerified: false,
    };
  } catch (error) {
    logger.error?.("[auth] Email verification delivery failed.", {
      reason: error?.code || error?.statusCode || error?.name || "email-error",
    });
    return { sent: false, skipped: false, alreadyVerified: false };
  }
};

const verifyEmailToken = async ({ token, userModel = User, now = () => new Date() } = {}) => {
  const rawToken = String(token || "").trim();

  if (!rawToken || rawToken.length < 32 || rawToken.length > 256) {
    throw createHttpError(INVALID_MESSAGE, 400);
  }

  const tokenHash = hashEmailVerificationToken(rawToken);
  const verifiedAt = now();
  const user = await userModel.findOneAndUpdate(
    {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: verifiedAt },
      isDeleted: { $ne: true },
      emailVerifiedAt: null,
    },
    {
      $set: {
        emailVerifiedAt: verifiedAt,
        emailVerificationRequired: true,
        emailVerificationTokenHash: "",
        emailVerificationExpiresAt: null,
      },
    },
    {
      new: true,
      projection: {
        password: 0,
        passwordResetTokenHash: 0,
        passwordResetExpiresAt: 0,
        emailVerificationTokenHash: 0,
        emailVerificationExpiresAt: 0,
        emailVerificationSentAt: 0,
      },
    }
  );

  if (!user) {
    throw createHttpError(INVALID_MESSAGE, 400);
  }

  return { message: "El. pastas patvirtintas.", user };
};

const isEmailVerifiedForAccess = (user) =>
  Boolean(user) && !user.isDeleted && (user.emailVerificationRequired !== true || Boolean(user.emailVerifiedAt));

const getEmailVerificationDto = (user) => ({
  emailVerified: isEmailVerifiedForAccess(user),
  emailVerificationRequired: user?.emailVerificationRequired === true,
});

module.exports = {
  INVALID_MESSAGE,
  buildEmailVerificationUrl,
  generateEmailVerificationToken,
  getEmailVerificationDto,
  getEmailVerificationTtlHours,
  hashEmailVerificationToken,
  isEmailVerifiedForAccess,
  sendVerificationForUser,
  verifyEmailToken,
};
