import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
