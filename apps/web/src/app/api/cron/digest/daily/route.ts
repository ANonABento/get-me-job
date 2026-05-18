import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { runDailyDigest } from "@/lib/digest/daily";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowIso } from "@/lib/format/time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowIso();
  const result = await runDailyDigest();
  recordCronRun({
    cron: "digest.daily",
    status: result.ok ? "success" : "failure",
    startedAt,
    durationMs: result.duration_ms,
    summary: {
      sent: result.sent,
      skipped: result.skipped,
      errors: result.errors,
    },
  });

  return NextResponse.json({
    ok: result.ok,
    cron: "digest.daily",
    sent: result.sent,
    skipped: result.skipped,
    errors: result.errors,
    duration_ms: result.duration_ms,
  });
}
