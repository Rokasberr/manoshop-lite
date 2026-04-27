import { DealStage, LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildDashboardInsight, calculateDealProbability } from "@/lib/ai";

export async function getDashboardSummary(userId: string) {
  const [leadCount, leads, deals, activeSubscription] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.findMany({
      where: { userId },
      include: {
        deal: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
    }),
    prisma.deal.findMany({
      where: { userId },
      include: {
        lead: true,
      },
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["TRIALING", "ACTIVE", "PAST_DUE"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const stageCounts = Object.values(DealStage).reduce<Record<string, number>>((acc, stage) => {
    acc[stage] = deals.filter((deal) => deal.stage === stage).length;
    return acc;
  }, {});

  const revenueForecast = deals.reduce((sum, deal) => sum + Math.round((deal.value * deal.probability) / 100), 0);
  const wonDeals = deals.filter((deal) => deal.stage === DealStage.WON).length;
  const closedDeals = deals.filter((deal) => deal.stage === DealStage.WON || deal.stage === DealStage.LOST).length;
  const conversionRate = closedDeals === 0 ? 0 : Math.round((wonDeals / closedDeals) * 100);

  const suggestedActions = leads.slice(0, 3).map((lead) => {
    const daysSinceContact = lead.lastContactedAt
      ? Math.floor((Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      action: buildDashboardInsight({
        leadName: lead.name,
        company: lead.company,
        score: lead.score,
        probability: lead.deal?.probability ?? calculateDealProbability(lead.score, DealStage.QUALIFIED),
        daysSinceContact,
      }),
    };
  });

  return {
    metrics: {
      totalLeads: leadCount,
      activeDeals: deals.filter((deal) => deal.stage !== DealStage.WON && deal.stage !== DealStage.LOST).length,
      revenueForecast,
      conversionRate,
      leadLimit: activeSubscription?.leadLimit ?? 25,
    },
    pipeline: stageCounts,
    suggestedActions,
    leads,
    deals,
    statusBreakdown: Object.values(LeadStatus).reduce<Record<string, number>>((acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status).length;
      return acc;
    }, {}),
  };
}
