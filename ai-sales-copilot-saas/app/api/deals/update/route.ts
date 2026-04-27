import { NextResponse } from "next/server";
import { calculateDealProbability } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { dealUpdateSchema } from "@/lib/schemas";
import { requireUser, unauthorizedResponse } from "@/lib/session";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = dealUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      userId: user.id,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const probability = calculateDealProbability(lead.score, parsed.data.stage);

  const deal = await prisma.deal.upsert({
    where: {
      leadId: lead.id,
    },
    update: {
      value: parsed.data.value,
      stage: parsed.data.stage,
      probability,
      expectedCloseAt: parsed.data.expectedCloseAt ? new Date(parsed.data.expectedCloseAt) : null,
      aiInsight:
        probability >= 70
          ? "High intent. Push for a decision-maker meeting with ROI framing."
          : "Deal needs stronger momentum. Add social proof and a tighter CTA.",
    },
    create: {
      userId: user.id,
      leadId: lead.id,
      value: parsed.data.value,
      stage: parsed.data.stage,
      probability,
      expectedCloseAt: parsed.data.expectedCloseAt ? new Date(parsed.data.expectedCloseAt) : null,
      aiInsight:
        probability >= 70
          ? "High intent. Push for a decision-maker meeting with ROI framing."
          : "Deal needs stronger momentum. Add social proof and a tighter CTA.",
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "DEAL_UPDATED",
      message: `Deal updated to ${parsed.data.stage} at ${parsed.data.value} EUR.`,
    },
  });

  return NextResponse.json({ deal });
}
