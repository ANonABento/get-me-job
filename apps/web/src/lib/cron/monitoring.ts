import type { CronRun } from "@/lib/db/cron-runs";

export type CronHealthStatus = "ok" | "failing" | "stale" | "missing";

export interface CronMonitorTarget {
  cron: string;
  schedule: string;
  staleAfterMs: number;
}

export interface CronHealthTarget extends CronMonitorTarget {
  status: CronHealthStatus;
  lastStatus: CronRun["status"] | null;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastDurationMs: number | null;
  minutesSinceLastFinish: number | null;
  error: string | null;
}

export interface CronHealthSummary {
  ok: boolean;
  checkedAt: string;
  targets: CronHealthTarget[];
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const CRON_MONITOR_TARGETS: CronMonitorTarget[] = [
  {
    cron: "reminders.tick",
    schedule: "*/5 * * * *",
    staleAfterMs: 15 * MINUTE,
  },
  {
    cron: "google.calendar-sync",
    schedule: "*/30 * * * *",
    staleAfterMs: 75 * MINUTE,
  },
  { cron: "email.retry", schedule: "*/10 * * * *", staleAfterMs: 30 * MINUTE },
  { cron: "follow-ups", schedule: "0 9 * * *", staleAfterMs: 36 * HOUR },
  {
    cron: "gmail.status-detect",
    schedule: "0 9 * * *",
    staleAfterMs: 36 * HOUR,
  },
  { cron: "digest.daily", schedule: "0 8 * * *", staleAfterMs: 36 * HOUR },
  { cron: "cleanup", schedule: "0 3 * * *", staleAfterMs: 36 * HOUR },
];

export function summarizeCronHealth(
  runs: CronRun[],
  nowMs: number = Date.now(),
): CronHealthSummary {
  const latestByCron = new Map<string, CronRun>();

  for (const run of runs) {
    const existing = latestByCron.get(run.cron);
    if (
      !existing ||
      Date.parse(run.startedAt) > Date.parse(existing.startedAt)
    ) {
      latestByCron.set(run.cron, run);
    }
  }

  const targets = CRON_MONITOR_TARGETS.map((target) => {
    const latest = latestByCron.get(target.cron) ?? null;
    if (!latest) {
      return {
        ...target,
        status: "missing" as const,
        lastStatus: null,
        lastStartedAt: null,
        lastFinishedAt: null,
        lastDurationMs: null,
        minutesSinceLastFinish: null,
        error: null,
      };
    }

    const finishedMs = Date.parse(latest.finishedAt);
    const ageMs = Number.isFinite(finishedMs)
      ? Math.max(0, nowMs - finishedMs)
      : Number.POSITIVE_INFINITY;
    const status: CronHealthStatus =
      latest.status === "failure"
        ? "failing"
        : ageMs > target.staleAfterMs
          ? "stale"
          : "ok";

    return {
      ...target,
      status,
      lastStatus: latest.status,
      lastStartedAt: latest.startedAt,
      lastFinishedAt: latest.finishedAt,
      lastDurationMs: latest.durationMs,
      minutesSinceLastFinish: Number.isFinite(ageMs)
        ? Math.floor(ageMs / MINUTE)
        : null,
      error: latest.error,
    };
  });

  return {
    ok: targets.every((target) => target.status === "ok"),
    checkedAt: new Date(nowMs).toISOString(),
    targets,
  };
}
