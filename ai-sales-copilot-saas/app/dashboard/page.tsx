import { getDashboardSummary } from "@/lib/dashboard";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const dashboard = await getDashboardSummary(session.user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total leads" value={dashboard.metrics.totalLeads} note={`Plan limit: ${dashboard.metrics.leadLimit}`} />
        <MetricCard label="Active deals" value={dashboard.metrics.activeDeals} note="Open revenue opportunities tracked in pipeline." />
        <MetricCard label="Forecast" value={formatCurrency(dashboard.metrics.revenueForecast)} note="Weighted forecast based on deal probability." />
        <MetricCard label="Conversion rate" value={`${dashboard.metrics.conversionRate}%`} note="Won deals divided by all closed deals." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[32px] p-6">
          <CardTitle>Pipeline stages</CardTitle>
          <CardDescription className="mt-2">Use these counts to see where pipeline momentum is building or stalling.</CardDescription>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(dashboard.pipeline).map(([stage, count]) => (
              <div key={stage} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{stage}</p>
                <p className="mt-3 font-heading text-3xl text-slate-950">{count}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[32px] p-6">
          <CardTitle>AI suggested actions</CardTitle>
          <CardDescription className="mt-2">The system highlights where reps should spend attention next.</CardDescription>
          <div className="mt-6 space-y-4">
            {dashboard.suggestedActions.length === 0 ? (
              <p className="text-sm text-slate-500">Create leads to generate AI suggestions.</p>
            ) : (
              dashboard.suggestedActions.map((action) => (
                <div key={action.leadId} className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-slate-950">
                    {action.leadName} • {action.company}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.action}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[32px] p-6">
        <CardTitle>Recent leads</CardTitle>
        <CardDescription className="mt-2">Most recently updated opportunities and their latest signal strength.</CardDescription>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Lead</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Deal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="py-4 font-medium text-slate-950">{lead.name}</td>
                  <td className="py-4 text-slate-600">{lead.company}</td>
                  <td className="py-4 text-slate-600">{lead.status}</td>
                  <td className="py-4 text-slate-600">{lead.score}/100</td>
                  <td className="py-4 text-slate-600">
                    {lead.deal ? `${formatCurrency(lead.deal.value)} • ${lead.deal.probability}%` : "No deal"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
