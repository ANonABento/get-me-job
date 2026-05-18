import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowIso } from "@/lib/format/time";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const message =
    "Weekly digest is disabled until a distinct weekly product email ships.";

  recordCronRun({
    cron: "digest.weekly",
    status: "disabled",
    startedAt: nowIso(),
    durationMs: 0,
    summary: { configured: false },
    error: message,
  });

  return NextResponse.json(
    {
      ok: false,
      cron: "digest.weekly",
      disabled: true,
      error: message,
    },
    { status: 410 },
  );
}
