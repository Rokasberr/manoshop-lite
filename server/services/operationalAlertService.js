const OperationalEvent = require("../models/OperationalEvent");
const { isBrevoEmailConfigured, sendBrevoTransactionalEmail } = require("../utils/brevoEmail");

const ALERT_EMAIL = process.env.OPERATIONS_ALERT_EMAIL?.trim() || "projects@stilloak-studio.com";
const FROM = process.env.WEB_ORDERS_FROM_EMAIL?.trim() || "Stilloak Studio <hello@stilloak-studio.com>";
const recentlySent = new Map();

const sanitize = (value) => String(value || "").replace(/sk_(live|test)_[A-Za-z0-9_]+|whsec_[A-Za-z0-9_]+/g, "[paslėpta]").slice(0, 500);

const recordOperationalEvent = async ({ type, severity = "warning", message, context = {}, notify = false }) => {
  const safeMessage = sanitize(message);
  const event = await OperationalEvent.create({ type, severity, message: safeMessage, context });
  console[severity === "critical" ? "error" : "log"](JSON.stringify({ level: severity === "critical" ? "error" : "info", event: type, message: safeMessage, eventId: String(event._id) }));

  const dedupeKey = `${type}:${safeMessage}`;
  const lastSent = recentlySent.get(dedupeKey) || 0;
  if (notify && isBrevoEmailConfigured() && Date.now() - lastSent > 60 * 60 * 1000) {
    recentlySent.set(dedupeKey, Date.now());
    await sendBrevoTransactionalEmail({
      to: ALERT_EMAIL,
      subject: `Stilloak operacijų perspėjimas: ${type}`,
      text: `${safeMessage}\n\nPatikrinkite administravimo operacijų skiltį.`,
      html: `<div style="font-family:Arial,sans-serif"><h1>Operacijų perspėjimas</h1><p>${safeMessage.replace(/[<>&]/g, "")}</p><p>Patikrinkite administravimo operacijų skiltį.</p></div>`,
      tags: ["operations", type],
      senderOverride: FROM,
    });
  }
  return event;
};

module.exports = { recordOperationalEvent };
