import { describe, expect, it } from "vitest";
import { summarizeCronHealth } from "./monitoring";
import type { CronRun } from "@/lib/db/cron-runs";

function cronRun(overrides: Partial<CronRun>): CronRun {
  return {
    id: 1,
    cron: "cleanup",
    status: "success",
    startedAt: "2026-05-18T03:00:00.000Z",
    finishedAt: "2026-05-18T03:00:01.000Z",
    durationMs: 1000,
    summary: null,
    error: null,
    ...overrides,
  };
}

describe("summarizeCronHealth", () => {
  it("marks targets healthy when recent successful runs exist", () => {
    const now = Date.parse("2026-05-18T03:10:00.000Z");
    const summary = summarizeCronHealth(
      [
        cronRun({ cron: "cleanup" }),
        cronRun({
          cron: "reminders.tick",
          finishedAt: "2026-05-18T03:09:00.000Z",
        }),
        cronRun({
          cron: "email.retry",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
        cronRun({
          cron: "google.calendar-sync",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
        cronRun({
          cron: "follow-ups",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
        cronRun({
          cron: "gmail.status-detect",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
        cronRun({
          cron: "digest.daily",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
        cronRun({
          cron: "currency-rates",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
      ],
      now,
    );

    expect(summary.ok).toBe(true);
    expect(summary.targets.every((target) => target.status === "ok")).toBe(
      true,
    );
  });

  it("surfaces missing, stale, and failing cron targets", () => {
    const now = Date.parse("2026-05-18T05:00:00.000Z");
    const summary = summarizeCronHealth(
      [
        cronRun({
          cron: "reminders.tick",
          status: "failure",
          error: "boom",
          finishedAt: "2026-05-18T04:59:00.000Z",
        }),
        cronRun({
          cron: "email.retry",
          finishedAt: "2026-05-18T03:00:00.000Z",
        }),
      ],
      now,
    );

    expect(summary.ok).toBe(false);
    expect(
      summary.targets.find((target) => target.cron === "reminders.tick"),
    ).toMatchObject({ status: "failing", error: "boom" });
    expect(
      summary.targets.find((target) => target.cron === "email.retry"),
    ).toMatchObject({ status: "stale" });
    expect(
      summary.targets.find((target) => target.cron === "cleanup"),
    ).toMatchObject({ status: "missing" });
  });
});
