export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-heading text-lg text-slate-950">AI Sales Copilot</p>
          <p>Lead follow-up, AI replies, pipeline intelligence, and subscription billing in one SaaS MVP.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Next.js App Router</span>
          <span>Prisma + PostgreSQL</span>
          <span>OpenAI</span>
          <span>Stripe + Resend</span>
        </div>
      </div>
    </footer>
  );
}
