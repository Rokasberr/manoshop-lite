const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { getPlanById, normalizePlanId, subscriptionPlans } = require("../config/subscriptionPlans");
const { getPlanPriceId } = require("./stripeCheckoutService");

const stripePlans = Object.values(subscriptionPlans).filter((plan) => plan.provider === "stripe");

const serializeSubscription = (subscription) => ({
  plan: normalizePlanId(subscription?.plan || "free"),
  status: subscription?.status || "active",
  provider: subscription?.provider || "internal",
  currentPeriodEnd: subscription?.currentPeriodEnd || null,
});

const updateUserSubscription = async ({
  userId,
  planId,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  stripePriceId,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  canceledAt,
  latestInvoiceId,
}) => {
  const plan = getPlanById(planId) || getPlanById("free");
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  user.subscription = {
    ...user.subscription,
    plan: plan.id,
    status,
    provider: plan.provider === "stripe" ? "stripe" : "internal",
    stripeCustomerId: stripeCustomerId || user.subscription?.stripeCustomerId || "",
    stripeSubscriptionId: stripeSubscriptionId || user.subscription?.stripeSubscriptionId || "",
    stripePriceId: stripePriceId || user.subscription?.stripePriceId || "",
    currentPeriodEnd: currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
    lastSyncedAt: new Date(),
  };

  await user.save();

  if (stripeSubscriptionId) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        $set: {
          user: user._id,
          plan: plan.id,
          status,
          provider: "stripe",
          stripeCustomerId: stripeCustomerId || user.subscription?.stripeCustomerId || "",
          stripeSubscriptionId,
          stripePriceId: stripePriceId || "",
          latestInvoiceId: latestInvoiceId || "",
          currentPeriodStart: currentPeriodStart || null,
          currentPeriodEnd: currentPeriodEnd || null,
          cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
          canceledAt: canceledAt || null,
          lastSyncedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return user;
};

const inferPlanIdFromStripeSubscription = (subscription) => {
  const metadataPlanId = subscription?.metadata?.planId;

  if (getPlanById(metadataPlanId)) {
    return metadataPlanId;
  }

  const price = subscription?.items?.data?.[0]?.price;

  if (!price) {
    return "free";
  }

  const matchedByPriceId = stripePlans.find((plan) => getPlanPriceId(plan) && getPlanPriceId(plan) === price.id);

  if (matchedByPriceId) {
    return matchedByPriceId.id;
  }

  const matchedPlan = stripePlans.find(
    (plan) =>
      plan.currency === price.currency &&
      plan.interval === price.recurring?.interval &&
      Math.round(plan.price * 100) === price.unit_amount
  );

  return matchedPlan?.id || "free";
};

const normalizeStripeSubscriptionStatus = (subscription, { sessionPaymentStatus = "" } = {}) => {
  const rawStatus = subscription?.status || "";
  const latestInvoice = typeof subscription?.latest_invoice === "object" ? subscription.latest_invoice : null;
  const latestInvoiceStatus = latestInvoice?.status || "";
  const paymentIntent =
    typeof latestInvoice?.payment_intent === "object" ? latestInvoice.payment_intent : null;
  const paymentIntentStatus = paymentIntent?.status || "";
  const hasConfirmedPayment =
    sessionPaymentStatus === "paid" ||
    latestInvoiceStatus === "paid" ||
    paymentIntentStatus === "succeeded";

  if (hasConfirmedPayment && ["incomplete", "past_due", "unpaid", "incomplete_expired"].includes(rawStatus)) {
    return "active";
  }

  if (["unpaid", "incomplete_expired"].includes(rawStatus)) {
    return "inactive";
  }

  return rawStatus || (hasConfirmedPayment ? "active" : "incomplete");
};

const syncUserSubscriptionFromStripeSubscription = async ({
  userId,
  stripeCustomerId,
  subscription,
  sessionPaymentStatus = "",
}) =>
  updateUserSubscription({
    userId,
    planId: inferPlanIdFromStripeSubscription(subscription),
    status: normalizeStripeSubscriptionStatus(subscription, { sessionPaymentStatus }),
    stripeCustomerId: stripeCustomerId || subscription?.customer || "",
    stripeSubscriptionId: subscription?.id || "",
    stripePriceId: subscription?.items?.data?.[0]?.price?.id || "",
    currentPeriodStart: subscription?.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : null,
    currentPeriodEnd: subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    canceledAt: subscription?.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    latestInvoiceId:
      typeof subscription?.latest_invoice === "string"
        ? subscription.latest_invoice
        : subscription?.latest_invoice?.id || "",
  });

const syncUserSubscriptionFromCheckoutSession = async ({
  stripe,
  session,
  fallbackUserId,
}) => {
  const userId = session.metadata?.userId || session.client_reference_id || fallbackUserId;

  if (!userId) {
    return null;
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id || "";

  let subscription = typeof session.subscription === "object" ? session.subscription : null;

  if (!subscription && subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice.payment_intent"],
    });
  }

  if (!subscription) {
    return null;
  }

  return syncUserSubscriptionFromStripeSubscription({
    userId,
    stripeCustomerId: session.customer || "",
    subscription,
    sessionPaymentStatus: session.payment_status || "",
  });
};

const findLatestStripeSubscriptionForUser = async (stripe, user) => {
  const knownCustomerId = user.subscription?.stripeCustomerId || "";
  let stripeCustomerId = knownCustomerId;

  if (!stripeCustomerId) {
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10,
    });

    const matchedCustomer =
      customers.data.find((customer) => customer.email?.toLowerCase() === user.email.toLowerCase()) ||
      customers.data[0];

    stripeCustomerId = matchedCustomer?.id || "";
  }

  if (!stripeCustomerId) {
    return null;
  }

  const subscriptionList = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 10,
  });

  const userId = user._id.toString();
  const selectedSubscription =
    subscriptionList.data.find((entry) => entry.metadata?.userId === userId) ||
    subscriptionList.data.find((entry) => ["active", "trialing", "past_due", "incomplete"].includes(entry.status)) ||
    subscriptionList.data[0];

  if (!selectedSubscription) {
    return null;
  }

  const subscription = await stripe.subscriptions.retrieve(selectedSubscription.id, {
    expand: ["latest_invoice.payment_intent"],
  });

  return syncUserSubscriptionFromStripeSubscription({
    userId,
    stripeCustomerId,
    subscription,
  });
};

module.exports = {
  serializeSubscription,
  updateUserSubscription,
  inferPlanIdFromStripeSubscription,
  normalizeStripeSubscriptionStatus,
  syncUserSubscriptionFromStripeSubscription,
  syncUserSubscriptionFromCheckoutSession,
  findLatestStripeSubscriptionForUser,
};
