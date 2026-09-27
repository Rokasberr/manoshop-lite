import express from "express";
import { connectDatabase } from "../db.js";
import User from "../models/User.js";
import WebhookEvent from "../models/WebhookEvent.js";
import { requireAuth } from "../middleware/auth.js";
import { emailTemplates, sendTrackedEmail } from "../services/emailService.js";
import { createLifetimeCheckout, getStripe } from "../services/stripeService.js";
import { asyncRoute, httpError } from "../utils/http.js";
import { getConfig } from "../config.js";

const router = express.Router();

router.post(
  "/checkout",
  requireAuth,
  asyncRoute(async (request, response) => {
    if (request.user.lifetime?.active) throw httpError("Lifetime access is already active.", 409);
    const session = await createLifetimeCheckout({ user: request.user });
    response.json({ url: session.url });
  })
);

router.get("/status", requireAuth, (request, response) => {
  response.json({
    plan: request.user.plan,
    lifetime: {
      active: Boolean(request.user.lifetime?.active),
      paymentStatus: request.user.lifetime?.paymentStatus || "not_started",
      activatedAt: request.user.lifetime?.activatedAt || null
    }
  });
});

const beginEvent = async (event) => {
  const existing = await WebhookEvent.findOne({ eventId: event.id });
  if (existing?.status === "processed") return { process: false, record: existing };
  if (existing?.status === "processing" && Date.now() - new Date(existing.updatedAt).getTime() < 5 * 60 * 1000) {
    return { process: false, record: existing };
  }
  if (existing) {
    existing.status = "processing";
    existing.error = "";
    await existing.save();
    return { process: true, record: existing };
  }
  try {
    const record = await WebhookEvent.create({
      eventId: event.id,
      type: event.type,
      livemode: Boolean(event.livemode),
      status: "processing"
    });
    return { process: true, record };
  } catch (error) {
    if (error?.code === 11000) return { process: false, record: null };
    throw error;
  }
};

const fulfillLifetime = async (session) => {
  if (session.payment_status === "unpaid") return { fulfilled: false, reason: "unpaid" };
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId || session.metadata?.product !== "reset_founding_lifetime") {
    throw new Error("Checkout session metadata does not identify the RESET product owner.");
  }
  const user = await User.findById(userId).select("+lifetime.stripeCustomerId +lifetime.stripePaymentIntentId +lifetime.stripeCheckoutSessionId");
  if (!user || user.deletedAt) throw new Error("Checkout session owner no longer exists.");
  user.plan = "lifetime";
  user.lifetime.active = true;
  user.lifetime.activatedAt = user.lifetime.activatedAt || new Date();
  user.lifetime.paymentStatus = "paid";
  user.lifetime.stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || "";
  user.lifetime.stripePaymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";
  user.lifetime.stripeCheckoutSessionId = session.id;
  if (user.resetDuration === 7) user.resetDuration = 30;
  await user.save();
  const template = emailTemplates.payment();
  await sendTrackedEmail({
    user,
    type: "payment-confirmation",
    dedupeKey: session.id,
    subject: template.subject,
    content: template.content
  }).catch(() => ({ sent: false }));
  return { fulfilled: true };
};

export const stripeWebhook = async (request, response) => {
  let eventRecord;
  try {
    await connectDatabase();
    const signature = request.headers["stripe-signature"];
    if (!signature) throw httpError("Missing Stripe signature.", 400);
    const config = getConfig();
    if (!config.stripeWebhookSecret) throw httpError("Stripe webhook is not configured.", 503);
    const event = getStripe().webhooks.constructEvent(request.body, signature, config.stripeWebhookSecret);
    const started = await beginEvent(event);
    eventRecord = started.record;
    if (!started.process) return response.json({ received: true, duplicate: true });

    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await fulfillLifetime(event.data.object);
    }
    if (event.type === "checkout.session.async_payment_failed") {
      const userId = event.data.object.metadata?.userId || event.data.object.client_reference_id;
      if (userId) await User.updateOne({ _id: userId }, { $set: { "lifetime.paymentStatus": "failed" } });
    }
    eventRecord.status = "processed";
    eventRecord.processedAt = new Date();
    await eventRecord.save();
    return response.json({ received: true });
  } catch (error) {
    if (eventRecord) {
      eventRecord.status = "failed";
      eventRecord.error = String(error.message || error).slice(0, 500);
      await eventRecord.save().catch(() => null);
    }
    const status = error.statusCode || 400;
    return response.status(status).json({ error: status === 400 ? "Invalid Stripe webhook." : "Webhook processing failed." });
  }
};

export default router;
