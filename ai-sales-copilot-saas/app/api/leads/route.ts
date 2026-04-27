import { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { scoreLead } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/schemas";
import { forbiddenResponse, requireUser, unauthorizedResponse } from "@/lib/session";
import { getPlanLimitForUser } from "@/lib/subscriptions";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const leads = await prisma.lead.findMany({
    where: { userId: user.id },
    include: {
      deal: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const existingCount = await prisma.lead.count({
    where: {
      userId: user.id,
      status: {
        not: LeadStatus.CLOSED,
      },
    },
  });
  const leadLimit = await getPlanLimitForUser(user.id);

  if (existingCount >= leadLimit) {
    return forbiddenResponse(`Lead limit reached for your current plan (${leadLimit}).`);
  }

  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const score = scoreLead({
    companySize: data.companySize,
    source: data.source,
    status: data.status ?? LeadStatus.NEW,
    engagementScore: 20,
  });

  const lead = await prisma.lead.create({
    data: {
      userId: user.id,
      name: data.name,
      email: data.email.toLowerCase(),
      company: data.company,
      companySize: data.companySize,
      industry: data.industry,
      website: data.website || null,
      source: data.source,
      notes: data.notes,
      status: data.status ?? LeadStatus.NEW,
      score,
      nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activities: {
        create: {
          type: "CREATED",
          message: "Lead created from CRM workspace.",
        },
      },
    },
    include: {
      deal: true,
      messages: true,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
