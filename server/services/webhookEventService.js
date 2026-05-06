const WebhookEvent = require("../models/WebhookEvent");

const STALE_PROCESSING_MS = 5 * 60 * 1000;

const beginStripeWebhookEvent = async (event) => {
  const existingEvent = await WebhookEvent.findOne({ stripeEventId: event.id });

  if (existingEvent?.processingStatus === "processed") {
    return { shouldProcess: false, record: existingEvent };
  }

  if (
    existingEvent?.processingStatus === "processing" &&
    Date.now() - new Date(existingEvent.updatedAt).getTime() < STALE_PROCESSING_MS
  ) {
    return { shouldProcess: false, record: existingEvent };
  }

  if (existingEvent) {
    existingEvent.processingStatus = "processing";
    existingEvent.error = "";
    existingEvent.attempts += 1;
    await existingEvent.save();
    return { shouldProcess: true, record: existingEvent };
  }

  const record = await WebhookEvent.create({
    stripeEventId: event.id,
    type: event.type,
    livemode: Boolean(event.livemode),
    apiVersion: event.api_version || "",
    processingStatus: "processing",
  });

  return { shouldProcess: true, record };
};

const markStripeWebhookEventProcessed = async (record) => {
  if (!record) {
    return null;
  }

  record.processingStatus = "processed";
  record.processedAt = new Date();
  record.error = "";
  return record.save();
};

const markStripeWebhookEventFailed = async (record, error) => {
  if (!record) {
    return null;
  }

  record.processingStatus = "failed";
  record.error = String(error?.message || error || "Webhook processing failed.").slice(0, 1000);
  return record.save();
};

module.exports = {
  beginStripeWebhookEvent,
  markStripeWebhookEventFailed,
  markStripeWebhookEventProcessed,
};
