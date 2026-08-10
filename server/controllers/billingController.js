const User = require("../models/User");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const { getPlanById, normalizePlanId } = require("../config/subscriptionPlans");
const {
  syncStripeOrderFromSession,
  syncStripeRefundFromPayment,
} = require("../services/orderCheckoutService");
const { syncDigitalProductPurchaseFromSession } = require("../services/digitalProductPurchaseService");
const { ensureStripeCustomerForUser } = require("../services/stripeCustomerService");
const { buildIdempotencyKey } = require("../services/stripeCheckoutService");
const {
  beginStripeWebhookEvent,
  markStripeWebhookEventFailed,
  markStripeWebhookEventProcessed,
} = require("../services/webhookEventService");
const {
  serializeSubscription,
  syncUserSubscriptionFromStripeSubscription,
  syncUserSubscriptionFromCheckoutSession,
} = require("../services/stripeMembershipService");
const { getStripeClient, resolveClientUrl } = require("../utils/stripeClient");
const { createHttpError } = require("../utils/httpError");

const createPaymentSession = async (req, res) => {
  const { planId, provider = "stripe" } = req.body;
  const requestedPlanId = String(planId || "").trim().toLowerCase();

  if (provider !== "stripe") {
    res.status(501);
    throw new Error("Šiame MVP šiuo metu įgyvendintas tik Stripe checkout.");
  }

  const plan = getPlanById(requestedPlanId);

  if (!plan || plan.provider !== "stripe") {
    res.status(400);
    throw new Error("Pasirinktas planas negalioja Stripe checkout srautui.");
  }

  if (!plan.priceId) {
    res.status(500);
    throw new Error(`Stripe kainos ID nesukonfigūruotas planui: ${plan.id}.`);
  }

  const stripe = getStripeClient();
  const clientUrl = resolveClientUrl(req.headers.origin);
  const successUrl = `${clientUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${clientUrl}/billing/cancel?plan=${plan.id}`;
  const stripeCustomerId = await ensureStripeCustomerForUser(stripe, req.user);
  const sessionPayload = {
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: req.user._id.toString(),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: req.user._id.toString(),
      plan: plan.id,
      planName: plan.name,
      provider: "stripe",
    },
    subscription_data: {
      metadata: {
        userId: req.user._id.toString(),
        plan: plan.id,
        planName: plan.name,
      },
    },
    line_items: [{ price: plan.priceId, quantity: 1 }],
  };

  const session = await stripe.checkout.sessions.create(sessionPayload, {
    idempotencyKey: buildIdempotencyKey(
      "subscription-checkout",
      [req.user._id, plan.id, req.headers["idempotency-key"] || Date.now()],
      req.headers["idempotency-key"]
    ),
  });

  res.status(201).json({
    url: session.url,
    sessionId: session.id,
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
    },
  });
};

const activateDemoPlan = async (req, res) => {
  const plan = getPlanById("basic");

  if (!plan || plan.provider !== "internal") {
    res.status(500);
    throw new Error("Demo versija šiuo metu nepasiekiama.");
  }

  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Vartotojas nerastas.");
  }

  const currentPlan = normalizePlanId(user.subscription?.plan || "free");

  if (["personal", "private_business"].includes(currentPlan) && user.subscription?.status === "active") {
    return res.json({
      subscription: serializeSubscription(user.subscription),
    });
  }

  user.subscription = {
    ...user.subscription,
    plan: plan.id,
    planName: plan.name,
    status: "active",
    provider: "internal",
    currentPeriodEnd: null,
    stripeCustomerId: user.subscription?.stripeCustomerId || "",
    stripeSubscriptionId: user.subscription?.stripeSubscriptionId || "",
    stripePriceId: user.subscription?.stripePriceId || "",
    lastSyncedAt: new Date(),
  };

  await user.save();

  res.json({
    subscription: serializeSubscription(user.subscription),
  });
};

const getBillingProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Vartotojas nerastas.");
  }

  res.json({
    subscription: serializeSubscription(user.subscription),
  });
};

const syncStripeMembership = async (req, res) => {
  const stripe = getStripeClient();
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw createHttpError("Vartotojas nerastas.", 404);
  }

  const { sessionId = "" } = req.body || {};
  const normalizedSessionId = String(sessionId || "").trim();

  if (!normalizedSessionId) {
    throw createHttpError("Reikalingas Stripe Checkout Session ID.", 400);
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(normalizedSessionId, {
      expand: ["subscription.latest_invoice.payment_intent"],
    });
  } catch (_error) {
    const currentUser = await User.findById(req.user._id).select("-password");

    return res.status(202).json({
      synced: false,
      pendingWebhook: true,
      message: "Mokejimas vis dar apdorojamas. Naryste bus atnaujinta, kai Stripe patvirtins sesija.",
      subscription: serializeSubscription(currentUser?.subscription || user.subscription),
    });
  }

  const expectedUserId = req.user._id.toString();
  const sessionUserId = session.metadata?.userId || session.client_reference_id || "";

  if (!sessionUserId || sessionUserId !== expectedUserId) {
    throw createHttpError("Si Stripe sesija nepriklauso dabartinei paskyrai.", 403);
  }

  if (session.metadata?.checkoutType === "order" || session.metadata?.type === "digital_product") {
    throw createHttpError("Si Stripe sesija nera narystes apmokejimas.", 400);
  }

  if (session.mode !== "subscription") {
    throw createHttpError("Si Stripe sesija nera prenumeratos apmokejimas.", 400);
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id || "";

  if (!subscriptionId) {
    const currentUser = await User.findById(req.user._id).select("-password");

    return res.status(202).json({
      synced: false,
      pendingWebhook: true,
      message: "Stripe prenumerata dar nepriskirta sesijai. Bandyk dar karta po keliu akimirku.",
      subscription: serializeSubscription(currentUser?.subscription || user.subscription),
    });
  }

  if (session.status !== "complete" || session.payment_status !== "paid") {
    const currentUser = await User.findById(req.user._id).select("-password");

    return res.status(202).json({
      synced: false,
      pendingWebhook: true,
      message: "Stripe dar nepatvirtino mokejimo. Naryste neaktyvuota.",
      subscription: serializeSubscription(currentUser?.subscription || user.subscription),
    });
  }

  const subscription =
    typeof session.subscription === "object"
      ? session.subscription
      : await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["latest_invoice.payment_intent"],
        });
  const syncedUser = await syncUserSubscriptionFromCheckoutSession({
    stripe,
    session: {
      ...session,
      subscription,
      payment_status: session.payment_status,
    },
    fallbackUserId: expectedUserId,
  });
  const currentUser = syncedUser || (await User.findById(req.user._id).select("-password"));

  res.json({
    synced: Boolean(syncedUser),
    pendingWebhook: !syncedUser,
    message: syncedUser ? "Naryste patvirtinta pagal Stripe sesija." : "Mokejimas vis dar apdorojamas.",
    subscription: serializeSubscription(currentUser?.subscription || user.subscription),
  });
};

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const resolveUserIdForStripeSubscription = async (subscription) => {
  const metadataUserId = subscription?.metadata?.userId;

  if (metadataUserId) {
    return metadataUserId;
  }

  const subscriptionRecord = subscription?.id
    ? await Subscription.findOne({ stripeSubscriptionId: subscription.id })
    : null;

  if (subscriptionRecord?.user) {
    return subscriptionRecord.user.toString();
  }

  const stripeCustomerId = getStripeId(subscription?.customer);
  const user = stripeCustomerId
    ? await User.findOne({ "subscription.stripeCustomerId": stripeCustomerId })
    : null;

  return user?._id?.toString() || "";
};

const syncInvoicePayment = async ({ stripe, invoice, status }) => {
  const stripeSubscriptionId = getStripeId(invoice.subscription);
  let subscription = null;
  let userId = "";

  if (stripeSubscriptionId) {
    subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ["latest_invoice.payment_intent"],
    });
    userId = await resolveUserIdForStripeSubscription(subscription);

    if (userId) {
      await syncUserSubscriptionFromStripeSubscription({
        userId,
        stripeCustomerId: getStripeId(invoice.customer) || getStripeId(subscription.customer),
        subscription,
        sessionPaymentStatus: status === "succeeded" ? "paid" : "",
      });
    }
  }

  if (!userId) {
    const stripeCustomerId = getStripeId(invoice.customer);
    const user = stripeCustomerId
      ? await User.findOne({ "subscription.stripeCustomerId": stripeCustomerId })
      : null;
    userId = user?._id?.toString() || "";
  }

  if (!userId || !invoice.id) {
    return null;
  }

  const subscriptionRecord = stripeSubscriptionId
    ? await Subscription.findOne({ stripeSubscriptionId })
    : null;
  const amount = Number(((invoice.amount_paid || invoice.amount_due || invoice.total || 0) / 100).toFixed(2));

  return Payment.findOneAndUpdate(
    { stripeInvoiceId: invoice.id, type: "subscription_invoice" },
    {
      $set: {
        user: userId,
        subscription: subscriptionRecord?._id || null,
        provider: "stripe",
        type: "subscription_invoice",
        status,
        amount,
        currency: invoice.currency || "eur",
        stripeCustomerId: getStripeId(invoice.customer),
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: getStripeId(invoice.payment_intent),
        metadata: {
          stripeSubscriptionId,
          invoiceStatus: invoice.status || "",
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const handleStripeWebhook = async (req, res) => {
  let event;

  try {
    const stripe = getStripeClient();
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const tolerance = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);

    if (!endpointSecret) {
      res.status(500);
      throw new Error("STRIPE_WEBHOOK_SECRET nerastas.");
    }

    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret, tolerance);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  let webhookRecord = null;

  try {
    const stripe = getStripeClient();
    const webhookState = await beginStripeWebhookEvent(event);
    webhookRecord = webhookState.record;

    if (!webhookState.shouldProcess) {
      return res.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.metadata?.checkoutType === "order") {
          await syncStripeOrderFromSession(session);
          break;
        }

        if (session.metadata?.type === "digital_product" || session.metadata?.checkoutType === "digital_product") {
          await syncDigitalProductPurchaseFromSession(session);
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id || "";
        let subscription = null;

        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["latest_invoice.payment_intent"],
          });
        }

        await syncUserSubscriptionFromCheckoutSession({
          stripe,
          session: {
            ...session,
            subscription: subscription || session.subscription,
          },
          fallbackUserId: session.metadata?.userId || session.client_reference_id,
        });
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;

        if (session.metadata?.checkoutType === "order") {
          await syncStripeOrderFromSession(session);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = await resolveUserIdForStripeSubscription(subscription);

        if (userId) {
          await syncUserSubscriptionFromStripeSubscription({
            userId,
            stripeCustomerId: getStripeId(subscription.customer),
            subscription,
          });
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await syncInvoicePayment({ stripe, invoice, status: "succeeded" });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await syncInvoicePayment({ stripe, invoice, status: "failed" });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const refundId = charge.refunds?.data?.[0]?.id || "";

        await syncStripeRefundFromPayment({
          paymentIntentId: getStripeId(charge.payment_intent),
          chargeId: charge.id,
          refundId,
          amountRefunded: charge.amount_refunded || 0,
          amount: charge.amount || 0,
        });
        break;
      }
      case "refund.updated": {
        const refund = event.data.object;

        if (refund.status === "succeeded" && refund.charge) {
          const charge = await stripe.charges.retrieve(getStripeId(refund.charge));

          await syncStripeRefundFromPayment({
            paymentIntentId: getStripeId(refund.payment_intent) || getStripeId(charge.payment_intent),
            chargeId: charge.id,
            refundId: refund.id,
            amountRefunded: charge.amount_refunded || refund.amount || 0,
            amount: charge.amount || 0,
          });
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
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  activateDemoPlan,
  createPaymentSession,
  getBillingProfile,
  syncStripeMembership,
  handleStripeWebhook,
};
