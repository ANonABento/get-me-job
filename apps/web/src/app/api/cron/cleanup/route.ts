import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { runCleanupCron } from "@/lib/cron/cleanup";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowEpoch, nowIso } from "@/lib/format/time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowIso();
  const startedMs = nowEpoch();

  try {
    const result = runCleanupCron();
    const durationMs = nowEpoch() - startedMs;
    const ok = result.errors.length === 0;

    recordCronRun({
      cron: "cleanup",
      status: ok ? "success" : "failure",
      startedAt,
      durationMs,
      summary: { ...result },
      error: ok ? undefined : result.errors.join("; "),
    });

    return NextResponse.json({
      ok,
      cron: "cleanup",
      ...result,
      durationMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cleanup cron failed";
    recordCronRun({
      cron: "cleanup",
      status: "failure",
      startedAt,
      durationMs: nowEpoch() - startedMs,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
