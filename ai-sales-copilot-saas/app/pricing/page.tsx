import { getVisiblePlans } from "@/lib/subscription-plans";
import { PlanGrid } from "@/components/pricing/plan-grid";

export default function PricingPage() {
  const plans = getVisiblePlans();

  return (
    <main className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Pricing</p>
          <h1 className="mt-4 font-heading text-5xl text-slate-950">Choose the revenue operating system your team needs.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Stripe handles recurring billing, upgrades, downgrades, and failed-payment states automatically.
          </p>
        </div>

        <div className="mt-14">
          <PlanGrid plans={plans} />
        </div>
      </div>
    </main>
  );
}
