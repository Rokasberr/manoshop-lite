const crypto = require("crypto");

const EmailDelivery = require("../models/EmailDelivery");

const EVENT_STATUS = {
  delivered: "delivered",
  "email.delivered": "delivered",
  bounced: "bounced",
  "email.bounced": "bounced",
  complained: "complained",
  "email.complained": "complained",
  spam: "complained",
};

const safeEqual = (received, expected) => {
  const left = Buffer.from(String(received || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const handleEmailEventWebhook = async (req, res) => {
  const configuredSecret = process.env.EMAIL_EVENT_WEBHOOK_SECRET?.trim() || "";
  if (!configuredSecret) return res.status(503).json({ message: "El. laiškų būsenų webhook dar nesukonfigūruotas." });
  if (!safeEqual(req.headers["x-email-webhook-secret"], configuredSecret)) return res.status(401).json({ message: "Neleistina webhook užklausa." });

  const eventType = String(req.body?.type || req.body?.event || "").trim().toLowerCase();
  const messageId = String(req.body?.messageId || req.body?.message_id || req.body?.data?.message_id || "").trim();
  const deliveryStatus = EVENT_STATUS[eventType];
  if (!deliveryStatus || !messageId) return res.status(400).json({ message: "Webhook įvykio duomenys netinkami." });

  const delivery = await EmailDelivery.findOneAndUpdate(
    { messageId },
    { $set: { deliveryStatus, deliveryStatusAt: new Date() } },
    { new: true }
  );
  return res.json({ received: true, matched: Boolean(delivery) });
};

module.exports = { handleEmailEventWebhook };
