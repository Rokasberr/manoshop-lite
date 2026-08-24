const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { getPlanById, normalizePlanId, subscriptionPlans } = require("../config/subscriptionPlans");
const { getPlanPriceId } = require("./stripeCheckoutService");

const stripePlans = Object.values(subscriptionPlans).filter((plan) => plan.provider === "stripe");

const serializeSubscription = (subscription) => ({
  plan: normalizePlanId(subscription?.plan || "free"),
  planName: subscription?.planName || getPlanById(subscription?.plan || "free")?.name || "",
  status: subscription?.status || "active",
  provider: subscription?.provider || "internal",
  currentPeriodEnd: subscription?.currentPeriodEnd || null,
  cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
  canceledAt: subscription?.canceledAt || null,
  lastSyncedAt: subscription?.lastSyncedAt || null,
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
    planName: plan.name,
    status,
    provider: plan.provider === "stripe" ? "stripe" : "internal",
    stripeCustomerId: stripeCustomerId || user.subscription?.stripeCustomerId || "",
    stripeSubscriptionId: stripeSubscriptionId || user.subscription?.stripeSubscriptionId || "",
    stripePriceId: stripePriceId || user.subscription?.stripePriceId || "",
    currentPeriodEnd: currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
    canceledAt: canceledAt || null,
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
          planName: plan.name,
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
  const metadataPlanId = subscription?.metadata?.plan;

  if (metadataPlanId && getPlanById(metadataPlanId)) {
    return normalizePlanId(metadataPlanId);
  }

  const price = subscription?.items?.data?.[0]?.price;

  if (!price) {
    return "free";
  }

  const matchedByPriceId = stripePlans.find((plan) => getPlanPriceId(plan) && getPlanPriceId(plan) === price.id);

  if (matchedByPriceId) {
    return matchedByPriceId.id;
  }

  const lowerPriceId = String(price.id || "").toLowerCase();
  const matchedByPriceIdHint = stripePlans.find(
    (plan) =>
      lowerPriceId.includes(plan.id) ||
      (plan.legacyId && lowerPriceId.includes(plan.legacyId))
  );

  if (matchedByPriceIdHint) {
    return matchedByPriceIdHint.id;
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

  const knownStatuses = new Set([
    "active",
    "trialing",
    "past_due",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "unpaid",
    "paused",
    "inactive",
  ]);

  if (knownStatuses.has(rawStatus)) {
    return rawStatus;
  }

  return hasConfirmedPayment ? "active" : "incomplete";
};

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const isSameUserId = (left, right) => String(left || "") === String(right || "");

const customerBelongsToUser = async ({ stripeCustomerId, stripeCustomer, user }) => {
  if (!stripeCustomerId) {
    return false;
  }

  const userId = user._id.toString();
  const userCustomerId = user.subscription?.stripeCustomerId || "";
  const customerOwner = await User.findOne({ "subscription.stripeCustomerId": stripeCustomerId });

  if (customerOwner && !isSameUserId(customerOwner._id, userId)) {
    return false;
  }

  if (userCustomerId) {
    return userCustomerId === stripeCustomerId;
  }

  const metadataUserId = stripeCustomer?.metadata?.userId || "";

  if (metadataUserId && !isSameUserId(metadataUserId, userId)) {
    return false;
  }

  return metadataUserId === userId || (customerOwner && isSameUserId(customerOwner._id, userId));
};

const subscriptionBelongsToUser = (subscription, userId) => {
  const metadataUserId = subscription?.metadata?.userId || "";

  return !metadataUserId || isSameUserId(metadataUserId, userId);
};

const resolveTrustedCheckoutUserId = async ({ session, stripeCustomerId }) => {
  const candidateUserId = session?.metadata?.userId || session?.client_reference_id || "";

  if (!candidateUserId) {
    return "";
  }

  const user = await User.findById(candidateUserId);

  if (!user) {
    return "";
  }

  if (stripeCustomerId) {
    const customerOwner = await User.findOne({ "subscription.stripeCustomerId": stripeCustomerId });

    if (customerOwner && customerOwner._id.toString() !== user._id.toString()) {
      return "";
    }

    const userCustomerId = user.subscription?.stripeCustomerId || "";

    if (userCustomerId && userCustomerId !== stripeCustomerId) {
      return "";
    }
  }

  return user._id.toString();
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

  const stripeCustomerId = getStripeId(session.customer) || getStripeId(subscription.customer);
  const userId =
    (await resolveTrustedCheckoutUserId({ session, stripeCustomerId })) ||
    (fallbackUserId && !stripeCustomerId ? fallbackUserId : "");

  if (!userId) {
    return null;
  }

  return syncUserSubscriptionFromStripeSubscription({
    userId,
    stripeCustomerId,
    subscription,
    sessionPaymentStatus: session.payment_status || "",
  });
};

const findLatestStripeSubscriptionForUser = async (stripe, user) => {
  const knownCustomerId = user.subscription?.stripeCustomerId || "";
  let stripeCustomerId = knownCustomerId;
  let selectedCustomer = null;

  if (!stripeCustomerId) {
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10,
    });

    const userId = user._id.toString();

    for (const customer of customers.data || []) {
      const emailMatches = customer.email?.toLowerCase() === user.email.toLowerCase();
      const metadataMatches = customer.metadata?.userId === userId;

      if (!emailMatches && !metadataMatches) {
        continue;
      }

      if (await customerBelongsToUser({ stripeCustomerId: customer.id, stripeCustomer: customer, user })) {
        selectedCustomer = customer;
        stripeCustomerId = customer.id;
        break;
      }
    }
  }

  if (!stripeCustomerId) {
    return null;
  }

  if (
    !(await customerBelongsToUser({
      stripeCustomerId,
      stripeCustomer: selectedCustomer,
      user,
    }))
  ) {
    return null;
  }

  const subscriptionList = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 10,
  });

  const userId = user._id.toString();
  const trustedSubscriptions = (subscriptionList.data || []).filter((entry) => subscriptionBelongsToUser(entry, userId));
  const selectedSubscription =
    trustedSubscriptions.find((entry) => entry.metadata?.userId === userId) ||
    trustedSubscriptions.find((entry) => ["active", "trialing", "past_due", "incomplete"].includes(entry.status)) ||
    trustedSubscriptions[0];

  if (!selectedSubscription) {
    return null;
  }

  const subscription = await stripe.subscriptions.retrieve(selectedSubscription.id, {
    expand: ["latest_invoice.payment_intent"],
  });

  if (!subscriptionBelongsToUser(subscription, userId)) {
    return null;
  }

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
