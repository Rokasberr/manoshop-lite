import Link from "next/link";
import { LayoutDashboard, Settings, Sparkles } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Sparkles },
  { href: "/dashboard/settings", label: "Billing", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen border-r border-slate-200 bg-white px-5 py-8 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          AI
        </span>
        <div>
          <p className="font-heading text-lg text-slate-950">Sales Copilot</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue OS</p>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[28px] bg-slate-950 p-5 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Automation</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Follow-up automation runs on a secure cron endpoint and pauses instantly when replies land.
        </p>
      </div>
    </aside>
  );
}
