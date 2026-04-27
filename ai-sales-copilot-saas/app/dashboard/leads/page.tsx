import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { LeadWorkspace } from "@/components/dashboard/lead-workspace";

export default async function LeadsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    include: {
      deal: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <LeadWorkspace
      initialLeads={leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: lead.status,
        score: lead.score,
        source: lead.source,
        updatedAt: lead.updatedAt.toISOString(),
        deal: lead.deal
          ? {
              value: lead.deal.value,
              stage: lead.deal.stage,
              probability: lead.deal.probability,
            }
          : null,
      }))}
    />
  );
}
