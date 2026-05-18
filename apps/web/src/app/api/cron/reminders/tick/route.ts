import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowEpoch, nowIso } from "@/lib/format/time";
import { fireDueReminders } from "@/lib/reminders/fire-due";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowEpoch();
  const startedIso = nowIso();

  try {
    const result = await fireDueReminders();
    const durationMs = nowEpoch() - startedAt;
    recordCronRun({
      cron: "reminders.tick",
      status: result.errors === 0 ? "success" : "failure",
      startedAt: startedIso,
      durationMs,
      summary: { ...result },
    });

    return NextResponse.json({
      ok: true,
      cron: "reminders.tick",
      fired: result.fired,
      errors: result.errors,
      durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron tick failed";
    recordCronRun({
      cron: "reminders.tick",
      status: "failure",
      startedAt: startedIso,
      durationMs: nowEpoch() - startedAt,
      error: message,
    });
    console.error("Reminder cron tick failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
