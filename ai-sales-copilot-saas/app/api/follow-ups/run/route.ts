import { NextResponse } from "next/server";
import { runDueFollowUps } from "@/lib/follow-up";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-vercel-cron");
  const expected = process.env.CRON_SECRET;

  if (expected && authHeader !== `Bearer ${expected}` && !cronHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await runDueFollowUps();
  return NextResponse.json({ processed });
}
