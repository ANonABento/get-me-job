import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./legacy", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

import db from "./legacy";
import { listRecentCronRuns, recordCronRun } from "./cron-runs";

describe("cron run db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records cron run metadata", () => {
    const run = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run });

    recordCronRun({
      cron: "cleanup",
      status: "success",
      startedAt: "2026-05-18T03:00:00.000Z",
      durationMs: 12,
      summary: { deleted: 2 },
    });

    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO cron_runs"),
    );
    expect(run).toHaveBeenLastCalledWith(
      "cleanup",
      "success",
      "2026-05-18T03:00:00.000Z",
      expect.any(String),
      12,
      JSON.stringify({ deleted: 2 }),
      null,
    );
  });

  it("lists recent cron runs with parsed summaries", () => {
    const all = vi.fn().mockReturnValue([
      {
        id: 1,
        cron: "cleanup",
        status: "success",
        started_at: "2026-05-18T03:00:00.000Z",
        finished_at: "2026-05-18T03:00:01.000Z",
        duration_ms: 1000,
        summary_json: '{"deleted":2}',
        error: null,
      },
    ]);
    (db.prepare as Mock).mockReturnValue({ run: vi.fn(), all });

    expect(listRecentCronRuns()).toEqual([
      {
        id: 1,
        cron: "cleanup",
        status: "success",
        startedAt: "2026-05-18T03:00:00.000Z",
        finishedAt: "2026-05-18T03:00:01.000Z",
        durationMs: 1000,
        summary: { deleted: 2 },
        error: null,
      },
    ]);
  });
});
