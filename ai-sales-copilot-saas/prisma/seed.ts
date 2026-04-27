import bcrypt from "bcryptjs";
import { PrismaClient, DealStage, LeadStatus, MessageType, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo12345!", 10);

  const user = await prisma.user.upsert({
    where: { email: "founder@aisalescopilot.dev" },
    update: {},
    create: {
      email: "founder@aisalescopilot.dev",
      name: "Demo Founder",
      passwordHash,
      currentPlan: SubscriptionPlan.STARTER,
      subscriptions: {
        create: {
          plan: SubscriptionPlan.STARTER,
          status: SubscriptionStatus.ACTIVE,
          leadLimit: 300,
        },
      },
    },
  });

  const lead = await prisma.lead.create({
    data: {
      userId: user.id,
      name: "Laura Bennett",
      email: "laura@northpeak.io",
      company: "NorthPeak",
      companySize: 75,
      industry: "SaaS",
      source: "Website demo request",
      status: LeadStatus.HOT,
      score: 84,
      engagementScore: 76,
      nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      messages: {
        create: {
          userId: user.id,
          type: MessageType.NOTE,
          content: "Requested pricing details for 12-seat outbound team.",
          replyStatus: "NONE",
        },
      },
    },
  });

  await prisma.deal.upsert({
    where: { leadId: lead.id },
    update: {},
    create: {
      leadId: lead.id,
      userId: user.id,
      value: 18000,
      stage: DealStage.NEGOTIATION,
      probability: 72,
      aiInsight: "Decision-maker engaged. Send ROI recap and booking CTA within 24 hours.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
