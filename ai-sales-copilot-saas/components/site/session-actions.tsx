"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = {
  authenticated: boolean;
};

export function SessionActions({ authenticated }: Props) {
  if (!authenticated) {
    return null;
  }

  return (
    <>
      <Button asChild size="sm" variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white">
        <Link href="/dashboard">
          Dashboard
        </Link>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="border-white/15 bg-transparent text-white hover:bg-white/10"
      >
        Sign out
      </Button>
    </>
  );
}
