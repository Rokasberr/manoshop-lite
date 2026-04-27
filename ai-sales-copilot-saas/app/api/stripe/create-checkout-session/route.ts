import { SubscriptionPlan } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/schemas";
import { requireUser, unauthorizedResponse } from "@/lib/session";
import { getPlanById, getStripePriceId } from "@/lib/subscription-plans";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.planId === SubscriptionPlan.FREE_TRIAL) {
    return NextResponse.json({ error: "This plan is not sold via Stripe." }, { status: 400 });
  }

  const plan = getPlanById(parsed.data.planId);

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const priceId = getStripePriceId(plan);

  if (!priceId) {
    return NextResponse.json({ error: `Missing price id for ${plan.name}` }, { status: 500 });
  }

  const stripe = getStripe();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = dbUser.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name ?? undefined,
      metadata: {
        userId: dbUser.id,
      },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        stripeCustomerId: customerId,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing/cancel`,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: {
      userId: dbUser.id,
      planId: plan.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
