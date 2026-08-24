const { getDigitalProductById } = require("../config/digitalProducts");
const { getPlanById, normalizePlanId } = require("../config/subscriptionPlans");
const EmailDelivery = require("../models/EmailDelivery");
const Subscription = require("../models/Subscription");
const {
  ensureTransactionalEmailDelivery,
  isValidRecipientEmail,
} = require("./transactionalEmailDeliveryService");
const {
  buildDigitalProductDeliveredEmail,
  buildSubscriptionCanceledEmail,
  buildSubscriptionCancelScheduledEmail,
  buildSubscriptionPaymentIssueEmail,
  buildSubscriptionPaymentSucceededEmail,
} = require("./transactionalEmailTemplateService");

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const getPlanName = (subscriptionRecord, fallbackPlan = "") => {
  const normalizedPlan = normalizePlanId(subscriptionRecord?.plan || fallbackPlan || "free");
  return subscriptionRecord?.planName || getPlanById(normalizedPlan)?.name || normalizedPlan;
};

const getInvoiceAmount = (invoice, payment) => {
  if (payment?.amount !== undefined && payment?.amount !== null) {
    return payment.amount;
  }

  return Number(((invoice?.amount_paid || invoice?.amount_due || invoice?.total || 0) / 100).toFixed(2));
};

const getInvoiceDate = (invoice) => {
  if (invoice?.status_transitions?.paid_at) {
    return new Date(invoice.status_transitions.paid_at * 1000);
  }

  if (invoice?.created) {
    return new Date(invoice.created * 1000);
  }

  return new Date();
};

const sendSubscriptionPaymentSucceededEmail = async ({ invoice, payment, subscriptionRecord, emailSender }) => {
  if (!invoice?.id || !payment?.user || payment.status !== "succeeded") {
    return { sent: false, skipped: true, reason: "payment-not-succeeded" };
  }

  const resolvedSubscription =
    subscriptionRecord ||
    (payment.subscription ? await Subscription.findById(payment.subscription) : null) ||
    null;

  return ensureTransactionalEmailDelivery({
    type: "subscription-payment-succeeded",
    dedupeKey: invoice.id,
    userId: payment.user,
    tags: ["subscription", "payment-succeeded"],
    emailSender,
    emailBuilder: () =>
      buildSubscriptionPaymentSucceededEmail({
        planName: getPlanName(resolvedSubscription, invoice.metadata?.plan),
        amount: getInvoiceAmount(invoice, payment),
        currency: payment.currency || invoice.currency || "eur",
        paidAt: getInvoiceDate(invoice),
        status: resolvedSubscription?.status || "",
      }),
  });
};

const sendSubscriptionPaymentIssueEmail = async ({
  invoice,
  payment,
  subscriptionRecord,
  actionRequired = false,
  emailSender,
}) => {
  if (!invoice?.id || !payment?.user || !["failed", "pending"].includes(payment.status)) {
    return { sent: false, skipped: true, reason: "payment-state-not-supported" };
  }

  const resolvedSubscription =
    subscriptionRecord ||
    (payment.subscription ? await Subscription.findById(payment.subscription) : null) ||
    null;
  const type = actionRequired ? "subscription-payment-action-required" : "subscription-payment-failed";

  return ensureTransactionalEmailDelivery({
    type,
    dedupeKey: invoice.id,
    userId: payment.user,
    tags: ["subscription", actionRequired ? "payment-action-required" : "payment-failed"],
    emailSender,
    emailBuilder: () =>
      buildSubscriptionPaymentIssueEmail({
        actionRequired,
        planName: getPlanName(resolvedSubscription, invoice.metadata?.plan),
        amount: getInvoiceAmount(invoice, payment),
        currency: payment.currency || invoice.currency || "eur",
        date: getInvoiceDate(invoice),
        status: resolvedSubscription?.status || "",
      }),
  });
};

const sendSubscriptionCancellationEmail = async ({ subscription, subscriptionRecord, eventType, emailSender }) => {
  const stripeSubscriptionId = getStripeId(subscription?.id) || subscriptionRecord?.stripeSubscriptionId || "";
  const userId = subscriptionRecord?.user;

  if (!stripeSubscriptionId || !userId) {
    return { sent: false, skipped: true, reason: "subscription-owner-missing" };
  }

  const status = subscriptionRecord?.status || subscription?.status || "";
  const currentPeriodEnd = subscriptionRecord?.currentPeriodEnd || null;

  if (eventType === "customer.subscription.deleted" || status === "canceled") {
    return ensureTransactionalEmailDelivery({
      type: "subscription-canceled",
      dedupeKey: stripeSubscriptionId,
      userId,
      tags: ["subscription", "canceled"],
      emailSender,
      emailBuilder: () =>
        buildSubscriptionCanceledEmail({
          planName: getPlanName(subscriptionRecord, subscription?.metadata?.plan),
          canceledAt: subscriptionRecord?.canceledAt || new Date(),
          status,
        }),
    });
  }

  if (["active", "trialing", "past_due", "unpaid"].includes(status) && subscriptionRecord?.cancelAtPeriodEnd === true) {
    const periodKey = currentPeriodEnd ? new Date(currentPeriodEnd).toISOString().slice(0, 10) : "unknown-period";

    return ensureTransactionalEmailDelivery({
      type: "subscription-cancel-scheduled",
      dedupeKey: `${stripeSubscriptionId}:${periodKey}`,
      userId,
      tags: ["subscription", "cancel-scheduled"],
      emailSender,
      emailBuilder: () =>
        buildSubscriptionCancelScheduledEmail({
          planName: getPlanName(subscriptionRecord, subscription?.metadata?.plan),
          currentPeriodEnd,
          status,
        }),
    });
  }

  return { sent: false, skipped: true, reason: "no-cancellation-email-needed" };
};

const sendDigitalProductPurchaseEmail = async ({ purchase, emailSender }) => {
  if (!purchase?._id || !purchase.user || purchase.status !== "paid") {
    return { sent: false, skipped: true, reason: "purchase-not-paid" };
  }

  const product = getDigitalProductById(purchase.productId);

  if (!product) {
    return { sent: false, skipped: true, reason: "product-not-found" };
  }

  return ensureTransactionalEmailDelivery({
    type: "digital-product-delivered",
    dedupeKey: purchase._id.toString(),
    userId: purchase.user,
    tags: ["digital-product", "delivered"],
    emailSender,
    emailBuilder: () =>
      buildDigitalProductDeliveredEmail({
        productName: product.title,
        purchasedAt: purchase.purchasedAt || purchase.updatedAt || new Date(),
      }),
  });
};

const hasSentDigitalProductEmail = async (purchaseId) => {
  if (!purchaseId) {
    return false;
  }

  const delivery = await EmailDelivery.exists({
    type: "digital-product-delivered",
    dedupeKey: purchaseId.toString(),
    status: "sent",
  });

  return Boolean(delivery);
};

module.exports = {
  sendDigitalProductPurchaseEmail,
  sendSubscriptionCancellationEmail,
  sendSubscriptionPaymentIssueEmail,
  sendSubscriptionPaymentSucceededEmail,
  hasSentDigitalProductEmail,
  isValidRecipientEmail,
};
