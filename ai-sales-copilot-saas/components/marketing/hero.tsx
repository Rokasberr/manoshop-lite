import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
        <div className="space-y-8">
          <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
            High-ticket B2B revenue workflow
          </Badge>
          <div className="space-y-5">
            <h1 className="font-heading text-5xl leading-tight text-white md:text-6xl">
              AI sales follow-up that keeps every real opportunity moving.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              AI Sales Copilot helps B2B teams score leads, draft personalized emails, track deals, and automate
              follow-ups so reps spend more time closing and less time chasing.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">Choose plan</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 bg-transparent text-white">
              <Link href="/dashboard">
                View product
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 text-sm text-slate-400 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-semibold text-white">3x</p>
              <p>faster lead response time</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">72%</p>
              <p>deals prioritized by probability</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">1,000+</p>
              <p>follow-ups automated per team</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-500/10">
          <div className="rounded-[28px] border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Deal intelligence</p>
                <h2 className="mt-2 font-heading text-2xl text-white">NorthPeak expansion</h2>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                78% close probability
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI suggested next action</p>
                <p className="mt-3 text-sm leading-6 text-white">
                  Send ROI recap today and ask for a 15-minute decision call with both stakeholders.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Automation status</p>
                <p className="mt-3 text-sm leading-6 text-white">
                  Follow-up #2 queued. Automation will pause if the lead replies.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 to-violet-400/15 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Generated email preview</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                Hi Laura, based on NorthPeak&apos;s recent pipeline growth, I think there is a fast win in tightening
                how warm leads are scored and followed up. We can likely reduce rep lag and surface the best-fit deals
                faster. If useful, I can map that workflow in 15 minutes this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
