const User = require("../models/User");
const { getPlanById, subscriptionPlans } = require("../config/subscriptionPlans");
const { syncStripeOrderFromSession } = require("../services/orderCheckoutService");
const { getStripeClient, resolveClientUrl } = require("../utils/stripeClient");

const serializeSubscription = (subscription) => ({
  plan: subscription?.plan || "free",
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
  currentPeriodEnd,
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
    currentPeriodEnd: currentPeriodEnd || null,
  };

  await user.save();
  return user;
};

const stripePlans = Object.values(subscriptionPlans).filter((plan) => plan.provider === "stripe");

const inferPlanIdFromStripeSubscription = (subscription) => {
  const metadataPlanId = subscription?.metadata?.planId;

  if (getPlanById(metadataPlanId)) {
    return metadataPlanId;
  }

  const price = subscription?.items?.data?.[0]?.price;

  if (!price) {
    return "free";
  }

  const matchedPlan = stripePlans.find(
    (plan) =>
      plan.currency === price.currency &&
      plan.interval === price.recurring?.interval &&
      Math.round(plan.price * 100) === price.unit_amount
  );

  return matchedPlan?.id || "free";
};

const syncUserSubscriptionFromStripeSubscription = async ({
  userId,
  stripeCustomerId,
  subscription,
}) =>
  updateUserSubscription({
    userId,
    planId: inferPlanIdFromStripeSubscription(subscription),
    status: subscription?.status || "active",
    stripeCustomerId: stripeCustomerId || subscription?.customer || "",
    stripeSubscriptionId: subscription?.id || "",
    currentPeriodEnd: subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
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
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  if (!subscription) {
    return null;
  }

  return syncUserSubscriptionFromStripeSubscription({
    userId,
    stripeCustomerId: session.customer || "",
    subscription,
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
  const subscription =
    subscriptionList.data.find((entry) => entry.metadata?.userId === userId) ||
    subscriptionList.data.find((entry) => ["active", "trialing", "past_due", "incomplete"].includes(entry.status)) ||
    subscriptionList.data[0];

  if (!subscription) {
    return null;
  }

  return syncUserSubscriptionFromStripeSubscription({
    userId,
    stripeCustomerId,
    subscription,
  });
};

const createPaymentSession = async (req, res) => {
  const { planId, provider = "stripe" } = req.body;

  if (provider !== "stripe") {
    res.status(501);
    throw new Error("Šiame MVP šiuo metu įgyvendintas tik Stripe checkout.");
  }

  const plan = getPlanById(planId);

  if (!plan || plan.provider !== "stripe") {
    res.status(400);
    throw new Error("Pasirinktas planas negalioja Stripe checkout srautui.");
  }

  const stripe = getStripeClient();
  const clientUrl = resolveClientUrl(req.headers.origin);
  const successUrl = `${clientUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${clientUrl}/billing/cancel?plan=${plan.id}`;
  const sessionPayload = {
    mode: "subscription",
    client_reference_id: req.user._id.toString(),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: req.user._id.toString(),
      planId: plan.id,
      provider: "stripe",
    },
    subscription_data: {
      metadata: {
        userId: req.user._id.toString(),
        planId: plan.id,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: plan.currency,
          recurring: {
            interval: plan.interval,
          },
          product_data: {
            name: `${plan.name} plan`,
            description: plan.description,
          },
          unit_amount: Math.round(plan.price * 100),
        },
      },
    ],
  };

  if (req.user.subscription?.stripeCustomerId) {
    sessionPayload.customer = req.user.subscription.stripeCustomerId;
  } else {
    sessionPayload.customer_email = req.user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionPayload);

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
    res.status(404);
    throw new Error("Vartotojas nerastas.");
  }

  const { sessionId = "" } = req.body || {};
  let syncedUser = null;

  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    const expectedUserId = req.user._id.toString();
    const sessionUserId = session.metadata?.userId || session.client_reference_id || "";

    if (sessionUserId && sessionUserId !== expectedUserId) {
      res.status(403);
      throw new Error("Ši Stripe sesija nepriklauso dabartinei paskyrai.");
    }

    syncedUser = await syncUserSubscriptionFromCheckoutSession({
      stripe,
      session,
      fallbackUserId: expectedUserId,
    });
  }

  if (!syncedUser) {
    syncedUser = await findLatestStripeSubscriptionForUser(stripe, user);
  }

  const resultUser = syncedUser || user;

  res.json({
    synced: Boolean(syncedUser),
    subscription: serializeSubscription(resultUser.subscription),
  });
};

const handleStripeWebhook = async (req, res) => {
  let event;

  try {
    const stripe = getStripeClient();
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      res.status(500);
      throw new Error("STRIPE_WEBHOOK_SECRET nerastas.");
    }

    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const stripe = getStripeClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.metadata?.checkoutType === "order") {
          await syncStripeOrderFromSession(session);
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id || "";
        let subscription = null;

        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        }

        await updateUserSubscription({
          userId: session.metadata?.userId || session.client_reference_id,
          planId: session.metadata?.planId,
          status:
            subscription?.status ||
            (session.payment_status === "paid" ? "active" : "incomplete"),
          stripeCustomerId: session.customer || "",
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
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
        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId || "free";
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        if (userId) {
          await updateUserSubscription({
            userId,
            planId,
            status: subscription.status || (event.type === "customer.subscription.deleted" ? "canceled" : "inactive"),
            stripeCustomerId: subscription.customer || "",
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: periodEnd,
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeSubscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id || "";

        if (stripeSubscriptionId) {
          const user = await User.findOne({
            "subscription.stripeSubscriptionId": stripeSubscriptionId,
          });

          if (user) {
            user.subscription = {
              ...user.subscription,
              status: "past_due",
            };
            await user.save();
          }
        }
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentSession,
  getBillingProfile,
  syncStripeMembership,
  handleStripeWebhook,
};
