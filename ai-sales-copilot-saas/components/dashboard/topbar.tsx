"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  plan: string;
};

export function DashboardTopbar({ name, plan }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <h1 className="font-heading text-2xl text-slate-950">{name || "Sales operator"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{plan}</div>
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
