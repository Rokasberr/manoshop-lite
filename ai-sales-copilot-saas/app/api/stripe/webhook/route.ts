import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { upsertPaidSubscription } from "@/lib/subscriptions";

function mapPriceIdToPlan(priceId: string | null | undefined) {
  const mapping: Record<string, SubscriptionPlan> = {};

  if (process.env.STRIPE_STARTER_PRICE_ID) {
    mapping[process.env.STRIPE_STARTER_PRICE_ID] = SubscriptionPlan.STARTER;
  }
  if (process.env.STRIPE_GROWTH_PRICE_ID) {
    mapping[process.env.STRIPE_GROWTH_PRICE_ID] = SubscriptionPlan.GROWTH;
  }
  if (process.env.STRIPE_AGENCY_PRICE_ID) {
    mapping[process.env.STRIPE_AGENCY_PRICE_ID] = SubscriptionPlan.AGENCY;
  }
  if (process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    mapping[process.env.STRIPE_ENTERPRISE_PRICE_ID] = SubscriptionPlan.ENTERPRISE;
  }

  return priceId ? mapping[priceId] ?? SubscriptionPlan.STARTER : SubscriptionPlan.STARTER;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INACTIVE;
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price?.id;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const user = await prisma.user.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!user) {
    return;
  }

  await upsertPaidSubscription({
    userId: user.id,
    customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: mapPriceIdToPlan(priceId),
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const userId = session.metadata?.userId;

      if (userId && customerId) {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }

      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;

      if (customerId) {
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: SubscriptionStatus.PAST_DUE,
          },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
