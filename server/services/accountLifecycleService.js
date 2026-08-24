const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const DigitalProductPurchase = require("../models/DigitalProductPurchase");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const RecurringExpense = require("../models/RecurringExpense");
const SavingsBudget = require("../models/SavingsBudget");
const SavingsEntry = require("../models/SavingsEntry");
const SavingsGoal = require("../models/SavingsGoal");
const SavingsStudioAuditLog = require("../models/SavingsStudioAuditLog");
const SavingsStudioProfile = require("../models/SavingsStudioProfile");
const Store = require("../models/Store");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { getStripeClient } = require("../utils/stripeClient");
const { createHttpError } = require("../utils/httpError");
const { isAdminUser } = require("../utils/userRole");
const { serializeSubscription } = require("./stripeMembershipService");

const EXPORT_LIMIT = 500;
const DELETE_CONFIRMATION_TEXT = "IŠTRINTI PASKYRĄ";
const BLOCKING_STRIPE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "paused",
]);
const DELETABLE_STRIPE_STATUSES = new Set(["canceled", "incomplete_expired", "inactive"]);
const BUSINESS_OWNERSHIP_BLOCK_MESSAGE =
  "Verslo arba pardavejo objektu savininko paskyrai reikia rankines pagalbos.";

const lean = (query) => (typeof query?.lean === "function" ? query.lean() : query);
const sortLimitLean = (query, sort, limit = EXPORT_LIMIT) => {
  const sorted = typeof query?.sort === "function" ? query.sort(sort) : query;
  const limited = typeof sorted?.limit === "function" ? sorted.limit(limit) : sorted;
  return lean(limited);
};

const safeDate = (value) => (value ? new Date(value).toISOString() : null);

const stripDocument = (doc) => {
  const source = typeof doc?.toObject === "function" ? doc.toObject() : doc || {};
  const { _id, createdAt, updatedAt, __v, user, ...rest } = source;

  return {
    id: _id?.toString?.() || String(_id || ""),
    ...rest,
    createdAt: safeDate(createdAt),
    updatedAt: safeDate(updatedAt),
  };
};

const serializeOrder = (order) => ({
  id: order._id?.toString?.() || String(order._id || ""),
  invoice: order.invoice
    ? {
        number: order.invoice.number || "",
        issuedAt: safeDate(order.invoice.issuedAt),
      }
    : null,
  items: (order.items || []).map((item) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    productType: item.productType,
    downloadLabel: item.digitalAsset?.downloadLabel || "",
  })),
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus || order.status,
  currency: order.currency,
  itemsPrice: order.itemsPrice,
  shippingPrice: order.shippingPrice,
  taxPrice: order.taxPrice,
  totalPrice: order.totalPrice,
  paidAt: safeDate(order.paidAt),
  createdAt: safeDate(order.createdAt),
  updatedAt: safeDate(order.updatedAt),
});

const serializePayment = (payment) => ({
  id: payment._id?.toString?.() || String(payment._id || ""),
  provider: payment.provider,
  type: payment.type,
  status: payment.status,
  amount: payment.amount,
  refundedAmount: payment.refundedAmount,
  currency: payment.currency,
  createdAt: safeDate(payment.createdAt),
  updatedAt: safeDate(payment.updatedAt),
});

const serializeSubscriptionRecord = (subscription) => ({
  id: subscription._id?.toString?.() || String(subscription._id || ""),
  plan: subscription.plan,
  planName: subscription.planName,
  status: subscription.status,
  provider: subscription.provider,
  currentPeriodStart: safeDate(subscription.currentPeriodStart),
  currentPeriodEnd: safeDate(subscription.currentPeriodEnd),
  cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
  canceledAt: safeDate(subscription.canceledAt),
  createdAt: safeDate(subscription.createdAt),
  updatedAt: safeDate(subscription.updatedAt),
});

const serializeDigitalPurchase = (purchase) => ({
  id: purchase._id?.toString?.() || String(purchase._id || ""),
  productId: purchase.productId,
  amount: purchase.amount,
  currency: purchase.currency,
  status: purchase.status,
  purchasedAt: safeDate(purchase.purchasedAt),
  createdAt: safeDate(purchase.createdAt),
  updatedAt: safeDate(purchase.updatedAt),
});

const buildUserDataExport = async (user) => {
  const userId = user._id;
  const [
    profile,
    entries,
    budgets,
    goals,
    recurringExpenses,
    auditLogs,
    subscriptions,
    payments,
    purchases,
    orders,
  ] = await Promise.all([
    lean(SavingsStudioProfile.findOne({ user: userId })),
    sortLimitLean(SavingsEntry.find({ user: userId }), { date: -1, createdAt: -1 }),
    sortLimitLean(SavingsBudget.find({ user: userId }), { month: -1, category: 1 }),
    sortLimitLean(SavingsGoal.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(RecurringExpense.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(SavingsStudioAuditLog.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(Subscription.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(Payment.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(DigitalProductPurchase.find({ user: userId }), { createdAt: -1 }),
    sortLimitLean(Order.find({ $or: [{ user: userId }, { buyer: userId }] }), { createdAt: -1 }),
  ]);

  return {
    schemaVersion: "2026-08-account-export-v1",
    exportGeneratedAt: new Date().toISOString(),
    account: {
      id: user._id?.toString?.() || String(user._id || ""),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerificationRequired !== true || Boolean(user.emailVerifiedAt),
      emailVerificationRequired: user.emailVerificationRequired === true,
      createdAt: safeDate(user.createdAt),
      updatedAt: safeDate(user.updatedAt),
    },
    subscription: serializeSubscription(user.subscription),
    savingStudio: {
      profile: profile ? stripDocument(profile) : null,
      entries: (entries || []).map(stripDocument),
      budgets: (budgets || []).map(stripDocument),
      goals: (goals || []).map(stripDocument),
      recurringExpenses: (recurringExpenses || []).map(stripDocument),
      auditLogs: (auditLogs || []).map(stripDocument),
      limit: EXPORT_LIMIT,
    },
    purchases: {
      digitalProducts: (purchases || []).map(serializeDigitalPurchase),
    },
    orders: (orders || []).map(serializeOrder),
    payments: (payments || []).map(serializePayment),
    subscriptions: (subscriptions || []).map(serializeSubscriptionRecord),
    retentionNotice:
      "Finansiniai ir apskaitos irasai eksportuojami be vidiniu Stripe ID ir gali buti saugomi pagal teisinius reikalavimus.",
  };
};

const getStripeId = (value) => (typeof value === "string" ? value : value?.id || "");

const hasProductOwnership = async (userId) => {
  const ownershipQuery = {
    $or: [
      { owner: userId },
      { storeOwner: userId },
      { seller: userId },
      { sellerId: userId },
      { createdBy: userId },
    ],
  };

  if (Product.collection?.countDocuments) {
    return (await Product.collection.countDocuments(ownershipQuery, { limit: 1 })) > 0;
  }

  return Boolean(await Product.exists(ownershipQuery));
};

const assertNoBusinessOwnership = async (userId) => {
  let ownsBusinessObject = false;

  try {
    ownsBusinessObject =
      Boolean(await Store.exists({ owner: userId })) ||
      Boolean(await hasProductOwnership(userId));
  } catch (_error) {
    throw createHttpError("Verslo nuosavybes patikros nepavyko. Paskyra neistrinta.", 503);
  }

  if (ownsBusinessObject) {
    throw createHttpError(BUSINESS_OWNERSHIP_BLOCK_MESSAGE, 409);
  }
};

const assertStripeDeletionAllowed = async (user) => {
  const stripeSubscriptionId = user.subscription?.stripeSubscriptionId || "";

  if (!stripeSubscriptionId || user.subscription?.provider !== "stripe") {
    return;
  }

  let subscription;

  try {
    subscription = await getStripeClient().subscriptions.retrieve(stripeSubscriptionId);
  } catch (_error) {
    throw createHttpError("Stripe busenos patikrinti nepavyko. Paskyra neistrinta.", 503);
  }

  const status = String(subscription?.status || "").toLowerCase();
  const cancelAtPeriodEnd = Boolean(subscription?.cancel_at_period_end);
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  if (
    BLOCKING_STRIPE_STATUSES.has(status) ||
    (cancelAtPeriodEnd && currentPeriodEnd && currentPeriodEnd > new Date())
  ) {
    throw createHttpError("Pirma atsauk prenumerata Stripe Customer Portal, tada galesi istrinti paskyra.", 409);
  }

  if (!DELETABLE_STRIPE_STATUSES.has(status)) {
    throw createHttpError("Stripe prenumeratos busena neleidzia saugiai istrinti paskyros.", 409);
  }

  if (getStripeId(subscription.customer) && getStripeId(subscription.customer) !== user.subscription?.stripeCustomerId) {
    throw createHttpError("Stripe prenumeratos nuosavybes patikra nepavyko.", 409);
  }
};

const deleteSavingsStudioData = async (userId, options = {}) =>
  Promise.all([
    SavingsStudioProfile.deleteMany({ user: userId }, options),
    SavingsEntry.deleteMany({ user: userId }, options),
    SavingsBudget.deleteMany({ user: userId }, options),
    SavingsGoal.deleteMany({ user: userId }, options),
    RecurringExpense.deleteMany({ user: userId }, options),
    SavingsStudioAuditLog.deleteMany({ user: userId }, options),
  ]);

const anonymizeUser = async (user, options = {}) => {
  const deletedAt = new Date();
  const anonymousSuffix = `${user._id.toString()}-${deletedAt.getTime()}`;
  const randomPasswordHash = await bcrypt.hash(`deleted-${anonymousSuffix}-${Math.random()}`, 10);

  user.name = "Istrinta paskyra";
  user.email = `deleted-${anonymousSuffix}@deleted.local`;
  user.password = randomPasswordHash;
  user.passwordResetTokenHash = "";
  user.passwordResetExpiresAt = null;
  user.emailVerificationTokenHash = "";
  user.emailVerificationExpiresAt = null;
  user.emailVerificationSentAt = null;
  user.emailVerifiedAt = null;
  user.emailVerificationRequired = false;
  user.authVersion = Number(user.authVersion || 0) + 1;
  user.isDeleted = true;
  user.deletedAt = deletedAt;
  user.subscription = {
    ...user.subscription,
    plan: "free",
    planName: "Demo",
    status: "inactive",
    provider: "internal",
    stripeSubscriptionId: "",
    stripePriceId: "",
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    canceledAt: deletedAt,
    lastSyncedAt: deletedAt,
  };

  await user.save(options);
};

const deleteCurrentUserAccount = async ({ userId, currentPassword, confirmationText }) => {
  if (confirmationText !== DELETE_CONFIRMATION_TEXT) {
    throw createHttpError("Patvirtinimo tekstas neteisingas.", 400);
  }

  const user = await User.findById(userId).select(
    "+password +passwordResetTokenHash +passwordResetExpiresAt +emailVerificationTokenHash +emailVerificationExpiresAt +emailVerificationSentAt"
  );

  if (!user || user.isDeleted) {
    throw createHttpError("Paskyra nerasta.", 404);
  }

  if (isAdminUser(user)) {
    throw createHttpError("Admin paskyros savitarnoje istrinti negalima. Susisiek su pagalba.", 403);
  }

  await assertNoBusinessOwnership(user._id);

  if (!(await user.comparePassword(currentPassword))) {
    throw createHttpError("Dabartinis slaptazodis neteisingas.", 401);
  }

  await assertStripeDeletionAllowed(user);

  const runDeletion = async (session = null) => {
    const options = session ? { session } : {};
    await deleteSavingsStudioData(user._id, options);
    await anonymizeUser(user, options);
  };

  if (mongoose.connection.readyState === 1) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(() => runDeletion(session));
    } finally {
      await session.endSession();
    }
  } else {
    await runDeletion();
  }

  return {
    message: "Paskyra istrinta. Asmeniniai Saving Studio duomenys pasalinti, o finansiniai irasai saugomi pagal apskaitos poreikius.",
  };
};

module.exports = {
  BLOCKING_STRIPE_STATUSES,
  BUSINESS_OWNERSHIP_BLOCK_MESSAGE,
  DELETE_CONFIRMATION_TEXT,
  assertNoBusinessOwnership,
  buildUserDataExport,
  deleteCurrentUserAccount,
};
