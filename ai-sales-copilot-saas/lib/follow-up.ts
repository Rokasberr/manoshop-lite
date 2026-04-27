import { MessageType, ReplyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendLeadEmail } from "@/lib/email";

export function getFollowUpTone(step: number) {
  if (step <= 0) {
    return "soft";
  }

  if (step === 1) {
    return "urgency";
  }

  return "final reminder";
}

export function getNextFollowUpDate(step: number) {
  const offsets = [1, 3, 7];
  const index = Math.min(step, offsets.length - 1);
  return new Date(Date.now() + offsets[index] * 24 * 60 * 60 * 1000);
}

export function buildFollowUpEmail(name: string, company: string, tone: string) {
  if (tone === "urgency") {
    return {
      subject: `${company}: should we close the loop?`,
      body: `Hi ${name},\n\nWanted to circle back because teams usually lose momentum when good-fit leads sit untouched for a few days. Based on what I know about ${company}, there is likely still a straightforward path to improve follow-up speed and qualification.\n\nIf this is still relevant, send me a quick reply and I will map out the best next step.\n`,
    };
  }

  if (tone === "final reminder") {
    return {
      subject: `${company}: final follow-up`,
      body: `Hi ${name},\n\nThis is my final note for now. I still believe there is a meaningful opportunity to improve how ${company} prioritizes and closes warm leads.\n\nIf it makes sense to revisit later, just reply with a time window and I will come prepared with a practical plan.\n`,
    };
  }

  return {
    subject: `${company}: quick follow-up`,
    body: `Hi ${name},\n\nWanted to follow up in case my last note got buried. I pulled together a few ideas on how ${company} could tighten lead response time and prioritize the deals most likely to close.\n\nWould it be useful if I sent over a short outline?\n`,
  };
}

export async function queueFollowUp(leadId: string) {
  return prisma.lead.update({
    where: { id: leadId },
    data: {
      followUpStep: 0,
      nextFollowUpAt: getNextFollowUpDate(0),
    },
  });
}

export async function runDueFollowUps() {
  const dueLeads = await prisma.lead.findMany({
    where: {
      nextFollowUpAt: {
        lte: new Date(),
      },
      repliedAt: null,
    },
    include: {
      user: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const processed: string[] = [];

  for (const lead of dueLeads) {
    const latestMessage = lead.messages[0];

    if (latestMessage?.replyStatus === ReplyStatus.REPLIED) {
      continue;
    }

    const tone = getFollowUpTone(lead.followUpStep);
    const copy = buildFollowUpEmail(lead.name, lead.company, tone);

    await sendLeadEmail({
      userId: lead.userId,
      leadId: lead.id,
      to: lead.email,
      subject: copy.subject,
      content: copy.body,
      tone,
      isAutomated: true,
      messageType: MessageType.FOLLOW_UP,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        followUpStep: lead.followUpStep + 1,
        lastContactedAt: new Date(),
        nextFollowUpAt: lead.followUpStep >= 2 ? null : getNextFollowUpDate(lead.followUpStep + 1),
        activities: {
          create: {
            type: "FOLLOW_UP_SENT",
            message: `Automated ${tone} follow-up sent.`,
          },
        },
      },
    });

    processed.push(lead.id);
  }

  return processed;
}
