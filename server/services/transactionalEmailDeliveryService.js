const EmailDelivery = require("../models/EmailDelivery");
const User = require("../models/User");
const {
  getEmailTransport,
  getTransportConfig,
  isEmailTransportConfigured,
  normalizeEmailTransportError,
} = require("../utils/emailTransport");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const PROCESSING_STALE_MS = 5 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class EmailDeliveryRetryableError extends Error {
  constructor(message) {
    super(message);
    this.name = "EmailDeliveryRetryableError";
    this.retryable = true;
    this.statusCode = 503;
  }
}

const isValidRecipientEmail = (email) => EMAIL_PATTERN.test(String(email || "").trim().toLowerCase());

const maskEmail = (email = "") => {
  const [local = "", domain = ""] = String(email || "").split("@");

  if (!local || !domain) {
    return "";
  }

  return `${local.slice(0, 2)}***@${domain}`;
};

const sanitizeErrorMessage = (error) =>
  String(error?.message || error || "El. laiško siuntimas nepavyko.")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/sk_(live|test)_[A-Za-z0-9_]+/g, "[stripe-secret]")
    .replace(/whsec_[A-Za-z0-9_]+/g, "[stripe-webhook-secret]")
    .replace(/\b(pi|in|sub|cus|cs|ch|re|evt)_[A-Za-z0-9_]+\b/g, "[stripe-id]")
    .replace(/([?&](?:token|key|secret|signature)=)[^&#\s]+/gi, "$1[redacted]")
    .replace(/[A-Z]:\\[^\s"'<>]+/gi, "[file-path]")
    .replace(/\/(?:[^\s"'<>/]+\/)+[^\s"'<>]+/g, "[file-path]")
    .slice(0, 1000);

const sendThroughSmtp = async ({ to, email }) => {
  const { from, socketTimeout = 15000 } = getTransportConfig();
  const transport = getEmailTransport();
  const maxWaitMs = Math.max(socketTimeout, 15000);
  let timeoutId = null;

  try {
    await Promise.race([
      transport.sendMail({
        from,
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error("SMTP serveris per ilgai neatsako. Patikrink pašto nustatymus.");
          error.statusCode = 504;
          reject(error);
        }, maxWaitMs);
      }),
    ]);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (typeof transport.close === "function") {
      transport.close();
    }

    throw normalizeEmailTransportError(error);
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return { sent: true, provider: "smtp" };
};

const sendTransactionalEmail = async ({ to, email, tags = [] }) => {
  if (isBrevoEmailConfigured()) {
    const result = await sendBrevoTransactionalEmail({
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags,
    });

    return { sent: true, provider: "brevo-api", messageId: result?.messageId || "" };
  }

  if (!isEmailTransportConfigured()) {
    const error = new Error("El. pašto transportas nesukonfigūruotas.");
    error.statusCode = 503;
    throw error;
  }

  return sendThroughSmtp({ to, email });
};

const reserveDelivery = async ({ type, dedupeKey, userId }) => {
  const deliveryKey = `${type}:${dedupeKey}`;
  const now = new Date();
  const staleBefore = new Date(now.getTime() - PROCESSING_STALE_MS);

  const retryClaim = await EmailDelivery.findOneAndUpdate(
    {
      deliveryKey,
      status: { $ne: "sent" },
      $or: [{ status: "failed" }, { status: "processing", updatedAt: { $lte: staleBefore } }],
    },
    {
      $set: {
        status: "processing",
        error: "",
        lastAttemptAt: now,
        user: userId || null,
      },
      $inc: { attempts: 1 },
    },
    { new: true }
  );

  if (retryClaim) {
    return { shouldSend: true, record: retryClaim, duplicate: false };
  }

  try {
    const newClaim = await EmailDelivery.findOneAndUpdate(
      {
        deliveryKey,
        status: { $exists: false },
      },
      {
        $setOnInsert: {
          deliveryKey,
          type,
          dedupeKey,
          user: userId || null,
          status: "processing",
          attempts: 1,
          lastAttemptAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (newClaim?.status === "processing") {
      return { shouldSend: true, record: newClaim, duplicate: false };
    }
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }
  }

  const existing = await EmailDelivery.findOne({ deliveryKey });

  if (existing?.status === "sent") {
    return { shouldSend: false, record: existing, duplicate: true };
  }

  if (existing?.status === "processing") {
    throw new EmailDeliveryRetryableError("El. laiško siuntimas jau vykdomas. Stripe turi pakartoti webhook vėliau.");
  }

  if (existing?.status === "failed") {
    throw new EmailDeliveryRetryableError("El. laiško siuntimo įrašą šiuo metu perima kitas retry procesas.");
  }

  throw new EmailDeliveryRetryableError("El. laiško siuntimo įrašas laikinai nepasiekiamas.");
};

const markDeliverySent = async ({ record, result }) => {
  record.status = "sent";
  record.provider = result?.provider || "";
  record.messageId = result?.messageId || "";
  record.sentAt = new Date();
  record.deliveryStatus = "sent";
  record.deliveryStatusAt = new Date();
  record.lastAttemptAt = new Date();
  record.error = "";
  await record.save();
  return record;
};

const markDeliveryFailed = async ({ record, error }) => {
  record.status = "failed";
  record.lastAttemptAt = new Date();
  record.error = sanitizeErrorMessage(error);
  await record.save();
  return record;
};

const ensureTransactionalEmailDelivery = async ({
  type,
  dedupeKey,
  userId,
  emailBuilder,
  tags = [],
  userModel = User,
  emailSender = sendTransactionalEmail,
}) => {
  if (!type || !dedupeKey || !userId) {
    return { sent: false, skipped: true, reason: "missing-required-fields" };
  }

  const userQuery = userModel.findById(userId);
  const user = userQuery?.select ? userQuery.select("-password") : userQuery;
  const resolvedUser = user && typeof user.then === "function" ? await user : user;

  if (!resolvedUser || resolvedUser.isDeleted || !isValidRecipientEmail(resolvedUser.email)) {
    return { sent: false, skipped: true, reason: "invalid-or-deleted-user" };
  }

  const { shouldSend, record, duplicate } = await reserveDelivery({
    type,
    dedupeKey,
    userId: resolvedUser._id || userId,
  });

  if (!shouldSend) {
    return { sent: false, skipped: true, duplicate, status: record?.status || "" };
  }

  try {
    const email = emailBuilder({ user: resolvedUser });
    const result = await emailSender({
      to: resolvedUser.email,
      email,
      tags: ["transactional", type, ...tags],
    });

    if (!result?.sent) {
      const error = new Error(result?.reason || "El. laiško transportas nepatvirtino siuntimo.");
      error.statusCode = 503;
      throw error;
    }

    await markDeliverySent({ record, result });
    return { sent: true, provider: result.provider || "", duplicate: false };
  } catch (error) {
    await markDeliveryFailed({ record, error });
    console.error("[email] Transactional email delivery failed.", {
      type,
      dedupeKey: "[redacted]",
      recipient: maskEmail(resolvedUser.email),
      reason: error?.code || error?.statusCode || error?.name || "email-error",
    });
    throw error;
  }
};

module.exports = {
  EmailDeliveryRetryableError,
  ensureTransactionalEmailDelivery,
  isValidRecipientEmail,
  maskEmail,
  reserveDelivery,
  sanitizeErrorMessage,
  sendTransactionalEmail,
};
