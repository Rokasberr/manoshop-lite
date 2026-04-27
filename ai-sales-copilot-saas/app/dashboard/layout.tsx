import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in?next=/dashboard");
  }

  return (
    <main className="bg-slate-50">
      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <div>
          <DashboardTopbar name={session.user.name ?? "Sales operator"} plan={session.user.plan.replaceAll("_", " ")} />
          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
