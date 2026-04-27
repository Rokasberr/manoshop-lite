import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPlanById } from "@/lib/subscription-plans";

export async function ensureDefaultSubscription(userId: string) {
  const active = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (active) {
    return active;
  }

  return prisma.subscription.create({
    data: {
      userId,
      plan: SubscriptionPlan.FREE_TRIAL,
      status: SubscriptionStatus.TRIALING,
      leadLimit: 25,
    },
  });
}

export async function getCurrentSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription ?? ensureDefaultSubscription(userId);
}

export async function getPlanLimitForUser(userId: string) {
  const subscription = await getCurrentSubscription(userId);
  return subscription.leadLimit;
}

export async function syncUserPlan(userId: string, plan: SubscriptionPlan) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentPlan: plan,
    },
  });
}

export async function upsertPaidSubscription(input: {
  userId: string;
  customerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const plan = getPlanById(input.plan);

  if (!plan) {
    throw new Error(`Unknown plan ${input.plan}`);
  }

  const existing = input.stripeSubscriptionId
    ? await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: input.stripeSubscriptionId },
      })
    : await prisma.subscription.findFirst({
        where: {
          userId: input.userId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.TRIALING],
          },
        },
      });

  const payload = {
    userId: input.userId,
    plan: input.plan,
    status: input.status,
    stripeCustomerId: input.customerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    stripePriceId: input.stripePriceId ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    leadLimit: plan.leadLimit,
  };

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: payload,
      })
    : await prisma.subscription.create({
        data: payload,
      });

  await syncUserPlan(
    input.userId,
    input.status === SubscriptionStatus.CANCELED || input.status === SubscriptionStatus.INACTIVE
      ? SubscriptionPlan.FREE_TRIAL
      : input.plan,
  );

  return subscription;
}
