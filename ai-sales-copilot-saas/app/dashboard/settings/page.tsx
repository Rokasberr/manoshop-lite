import { getSession } from "@/lib/session";
import { getCurrentSubscription } from "@/lib/subscriptions";
import { getPlanById, getVisiblePlans } from "@/lib/subscription-plans";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BillingPortalButton } from "@/components/dashboard/billing-actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const subscription = await getCurrentSubscription(session.user.id);
  const plan = getPlanById(subscription.plan);

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] p-6">
        <CardTitle>Billing and subscription</CardTitle>
        <CardDescription className="mt-2">Stripe keeps your recurring billing state synced with access limits.</CardDescription>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current plan</p>
            <p className="mt-3 font-heading text-3xl text-slate-950">{plan?.name ?? subscription.plan}</p>
            <p className="mt-2 text-sm text-slate-600">{plan ? formatCurrency(plan.price) : "Trial plan"}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
            <p className="mt-3 font-heading text-3xl text-slate-950">{subscription.status}</p>
            <p className="mt-2 text-sm text-slate-600">Lead limit: {subscription.leadLimit}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current period end</p>
            <p className="mt-3 font-heading text-3xl text-slate-950">{formatDate(subscription.currentPeriodEnd)}</p>
            <p className="mt-2 text-sm text-slate-600">Cancel at period end: {subscription.cancelAtPeriodEnd ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="mt-6">
          <BillingPortalButton />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <CardTitle>Available plans</CardTitle>
        <CardDescription className="mt-2">Upgrade or downgrade through Stripe checkout and the billing portal.</CardDescription>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {getVisiblePlans().map((item) => (
            <div key={item.id} className="rounded-[28px] border border-slate-200 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">{item.name}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(item.price)}/mo</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
