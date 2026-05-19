/**
 * @route GET /api/cron/currency-rates
 * @description Daily FX-rate refresh for pay normalization (bucket G.1).
 * @auth Cron secret via Authorization: Bearer or X-Cron-Token
 *
 * Pulls USD-base rates from frankfurter.app, upserts every supported
 * pair into the `currency_rates` table. Best-effort — a transient
 * fetch failure logs to `cron_runs` but doesn't 5xx; the renderer keeps
 * using the previous cache + the FALLBACK_RATES safety net.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { refreshCurrencyRates } from "@/lib/cron/currency-rates";
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
    const result = await refreshCurrencyRates();
    const durationMs = nowEpoch() - startedMs;
    const ok = result.errors.length === 0 && result.pairsUpdated > 0;

    recordCronRun({
      cron: "currency-rates",
      status: ok ? "success" : "failure",
      startedAt,
      durationMs,
      summary: {
        pairsUpdated: result.pairsUpdated,
        fetchedAt: result.fetchedAt,
      },
      error: ok ? undefined : result.errors.join("; ") || "No pairs updated",
    });

    return NextResponse.json({
      ok,
      cron: "currency-rates",
      pairsUpdated: result.pairsUpdated,
      fetchedAt: result.fetchedAt,
      errors: result.errors,
      durationMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Currency-rates cron failed";
    recordCronRun({
      cron: "currency-rates",
      status: "failure",
      startedAt,
      durationMs: nowEpoch() - startedMs,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
