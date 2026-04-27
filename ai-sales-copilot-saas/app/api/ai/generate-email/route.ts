import { NextResponse } from "next/server";
import { generateSalesEmail } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { aiEmailSchema } from "@/lib/schemas";
import { requireUser, unauthorizedResponse } from "@/lib/session";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const limiter = rateLimit(`ai:${user.id}`, 20, 60 * 60 * 1000);

  if (!limiter.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAt: limiter.retryAt,
      },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = aiEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      userId: user.id,
    },
    include: {
      deal: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const email = await generateSalesEmail(lead, parsed.data.objective);

  return NextResponse.json({
    email,
    leadScore: lead.score,
  });
}
