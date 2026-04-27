import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard";
import { requireUser, unauthorizedResponse } from "@/lib/session";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const data = await getDashboardSummary(user.id);
  return NextResponse.json(data);
}
