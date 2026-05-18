import { NextRequest, NextResponse } from "next/server";
import { isAuthError, requireUserAuth } from "@/lib/auth";
import { listRecentCronRuns } from "@/lib/db/cron-runs";
import { summarizeCronHealth } from "@/lib/cron/monitoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = await requireUserAuth(request);
  if (isAuthError(authResult)) return authResult;

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
  const runs = listRecentCronRuns(Number.isFinite(limit) ? limit : 50);

  return NextResponse.json({
    ok: true,
    health: summarizeCronHealth(runs),
    runs,
  });
}
