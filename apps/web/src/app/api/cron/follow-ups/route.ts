import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import db from "@/lib/db/legacy";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowEpoch, nowIso } from "@/lib/format/time";
import { ensureWelcomeSeriesSchema } from "@/lib/welcome-series/state";
import { processWelcomeSeriesForUser } from "@/lib/welcome-series/process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface UserIdRow {
  id: string;
}

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowEpoch();
  const startedIso = nowIso();

  try {
    ensureWelcomeSeriesSchema();

    const users = db
      .prepare("SELECT id FROM `user` WHERE email IS NOT NULL LIMIT 200")
      .all() as UserIdRow[];

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      const result = await processWelcomeSeriesForUser(user.id);
      for (const step of result.results) {
        if (step.action === "sent") sent += 1;
        if (step.action === "skipped" || step.action === "already-complete") {
          skipped += 1;
        }
        if (step.action === "error") errors += 1;
      }
    }

    const durationMs = nowEpoch() - startedAt;
    const response = {
      ok: true,
      cron: "follow-ups",
      processed: users.length,
      sent,
      skipped,
      errors,
      durationMs,
    };
    recordCronRun({
      cron: "follow-ups",
      status: errors === 0 ? "success" : "failure",
      startedAt: startedIso,
      durationMs,
      summary: response,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Welcome series cron failed";
    recordCronRun({
      cron: "follow-ups",
      status: "failure",
      startedAt: startedIso,
      durationMs: nowEpoch() - startedAt,
      error: message,
    });
    console.error("Welcome series cron failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
