import { MessageType, ReplyStatus } from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendLeadEmail(input: {
  userId: string;
  leadId: string;
  to: string;
  subject: string;
  content: string;
  tone?: string;
  isAutomated?: boolean;
  messageType?: MessageType;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? "AI Sales Copilot <onboarding@resend.dev>";

  let providerMessageId: string | null = null;

  if (resend) {
    const response = await resend.emails.send({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.content
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join(""),
    });

    providerMessageId = response.data?.id ?? null;
  }

  return prisma.message.create({
    data: {
      userId: input.userId,
      leadId: input.leadId,
      subject: input.subject,
      content: input.content,
      tone: input.tone,
      type: input.messageType ?? MessageType.EMAIL,
      isAutomated: input.isAutomated ?? false,
      sentAt: new Date(),
      replyStatus: resend ? ReplyStatus.PENDING : ReplyStatus.NONE,
      providerMessageId,
      metadata: resend ? undefined : { mock: true },
    },
  });
}
