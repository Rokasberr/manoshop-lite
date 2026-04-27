import { NextResponse } from "next/server";
import { ReplyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const signature = request.headers.get("resend-signature");
  const expected = process.env.RESEND_WEBHOOK_SECRET;

  if (expected && signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await request.json();
  const eventType = body.type as string | undefined;
  const from = body.data?.from ?? body.data?.email_from;
  const messageId = body.data?.email_id ?? body.data?.id ?? body.data?.message_id;

  if (!eventType || !from) {
    return NextResponse.json({ ok: true });
  }

  const targetEmail = Array.isArray(from) ? from[0] : from;

  if (typeof targetEmail !== "string") {
    return NextResponse.json({ ok: true });
  }

  const lead = messageId
    ? await prisma.lead.findFirst({
        where: {
          messages: {
            some: {
              providerMessageId: messageId,
            },
          },
        },
      })
    : await prisma.lead.findFirst({
        where: {
          email: targetEmail.toLowerCase(),
        },
      });

  if (!lead) {
    return NextResponse.json({ ok: true });
  }

  if (eventType === "email.received" || eventType === "email.replied") {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          repliedAt: new Date(),
          nextFollowUpAt: null,
          activities: {
            create: {
              type: "REPLIED",
              message: "Lead replied. Automation paused.",
            },
          },
        },
      }),
      prisma.message.updateMany({
        where: { leadId: lead.id },
        data: {
          replyStatus: ReplyStatus.REPLIED,
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
