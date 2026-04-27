import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailSchema } from "@/lib/schemas";
import { requireUser, unauthorizedResponse } from "@/lib/session";
import { sendLeadEmail } from "@/lib/email";
import { queueFollowUp } from "@/lib/follow-up";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = sendEmailSchema.safeParse(body);

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

  const message = await sendLeadEmail({
    userId: user.id,
    leadId: lead.id,
    to: lead.email,
    subject: parsed.data.subject,
    content: parsed.data.content,
    tone: parsed.data.tone,
    isAutomated: parsed.data.isAutomated,
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      lastContactedAt: new Date(),
      activities: {
        create: {
          type: "EMAIL_SENT",
          message: `Outbound email sent: ${parsed.data.subject}`,
        },
      },
    },
  });

  if (parsed.data.scheduleFollowUps) {
    await queueFollowUp(lead.id);
  }

  return NextResponse.json({ message }, { status: 201 });
}
