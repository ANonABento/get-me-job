import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { runEmailRetryCron } from "@/lib/cron/email-retry";
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
    const result = await runEmailRetryCron();
    const durationMs = nowEpoch() - startedMs;
    recordCronRun({
      cron: "email.retry",
      status: result.ok ? "success" : "failure",
      startedAt,
      durationMs,
      summary: {
        scanned: result.scanned,
        retried: result.retried,
        sent: result.sent,
        failed: result.failed,
      },
      error: result.ok
        ? undefined
        : result.outcomes
            .map((outcome) => outcome.error)
            .filter(Boolean)
            .join("; "),
    });

    return NextResponse.json({
      ok: result.ok,
      cron: "email.retry",
      scanned: result.scanned,
      retried: result.retried,
      sent: result.sent,
      failed: result.failed,
      durationMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email retry cron failed";
    recordCronRun({
      cron: "email.retry",
      status: "failure",
      startedAt,
      durationMs: nowEpoch() - startedMs,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
