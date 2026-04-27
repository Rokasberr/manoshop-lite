import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <main className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl rounded-[36px] bg-white px-6 py-16 text-center shadow-sm lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Payment successful</p>
        <h1 className="mt-4 font-heading text-5xl text-slate-950">Your subscription is active.</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Stripe checkout completed successfully. The webhook will activate your plan and sync usage limits.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg" variant="dark">
            <Link href="/dashboard">
              Open dashboard
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard/settings">
              View billing
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
