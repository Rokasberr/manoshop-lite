import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionActions } from "@/components/site/session-actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-bold text-slate-950">
            AI
          </span>
          <div>
            <p className="font-heading text-lg text-white">AI Sales Copilot</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lead Intelligence SaaS</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
          <Link href="/#features">Features</Link>
          <Link href="/#workflow">Workflow</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <SessionActions authenticated />
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white">
                <Link href="/sign-in">
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/pricing">Start trial</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
