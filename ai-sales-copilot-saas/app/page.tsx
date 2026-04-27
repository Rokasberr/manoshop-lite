import Link from "next/link";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero";
import { WorkflowSection } from "@/components/marketing/workflow";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />

      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-slate-950 px-6 py-14 text-white lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Launch-ready MVP</p>
              <h2 className="mt-4 font-heading text-4xl">Built to be sold, not just demoed.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Use it as your own SaaS product, internal sales tool, or commercial pilot for B2B clients.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/pricing">Choose plan</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/15 bg-transparent text-white">
                <Link href="/dashboard">
                  Explore dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
