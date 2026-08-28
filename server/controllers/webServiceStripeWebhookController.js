const {
  syncWebServiceDepositFromSession,
  syncWebServiceDepositRefund,
} = require("../services/webServiceDepositService");
const {
  beginStripeWebhookEvent,
  markStripeWebhookEventFailed,
  markStripeWebhookEventProcessed,
} = require("../services/webhookEventService");
const { getStripeClient } = require("../utils/stripeClient");

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const handleWebServiceStripeWebhook = async (req, res) => {
  let event;

  try {
    const stripe = getStripeClient();
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEB_SERVICE_WEBHOOK_SECRET;
    const tolerance = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);

    if (!endpointSecret) {
      res.status(500);
      throw new Error("STRIPE_WEB_SERVICE_WEBHOOK_SECRET nerastas.");
    }

    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret, tolerance);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  let webhookRecord = null;

  try {
    const webhookState = await beginStripeWebhookEvent(event);
    webhookRecord = webhookState.record;

    if (!webhookState.shouldProcess) {
      return res.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.metadata?.checkoutType === "web_service_deposit") {
          await syncWebServiceDepositFromSession(session);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;

        if (session.metadata?.checkoutType === "web_service_deposit") {
          await syncWebServiceDepositFromSession(session, { expired: true });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = getStripeId(charge.payment_intent);

        if (paymentIntentId) {
          await syncWebServiceDepositRefund({ paymentIntentId });
        }
        break;
      }
      case "refund.updated": {
        const refund = event.data.object;
        const paymentIntentId = getStripeId(refund.payment_intent);

        if (refund.status === "succeeded" && paymentIntentId) {
          await syncWebServiceDepositRefund({ paymentIntentId });
        }
        break;
      }
      default:
        break;
    }

    await markStripeWebhookEventProcessed(webhookRecord);
    return res.json({ received: true });
  } catch (error) {
    await markStripeWebhookEventFailed(webhookRecord, error);
    return res.status(500).json({
      message: "Stilloak Web Stripe webhook apdoroti nepavyko. Stripe gali pakartoti įvykį.",
    });
  }
};

module.exports = {
  handleWebServiceStripeWebhook,
};
