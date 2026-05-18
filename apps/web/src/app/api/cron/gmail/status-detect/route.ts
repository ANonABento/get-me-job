import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { recordCronRun } from "@/lib/db/cron-runs";
import { runGmailStatusDetectionForEnabledUsers } from "@/lib/email/gmail-status-detect";
import { nowEpoch, nowIso } from "@/lib/format/time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowEpoch();
  const startedIso = nowIso();
  const result = await runGmailStatusDetectionForEnabledUsers();
  const durationMs = nowEpoch() - startedAt;
  recordCronRun({
    cron: "gmail.status-detect",
    status: result.errors === 0 ? "success" : "failure",
    startedAt: startedIso,
    durationMs,
    summary: { ...result },
  });

  return NextResponse.json({
    ok: result.errors === 0,
    cron: "gmail.status-detect",
    processed: result.processed,
    scanned: result.scanned,
    matched: result.matched,
    updated: result.updated,
    suggested: result.suggested,
    skipped: result.skipped,
    errors: result.errors,
    durationMs,
  });
}
