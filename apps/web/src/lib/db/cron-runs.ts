import db from "./legacy";
import { nowIso } from "@/lib/format/time";

export type CronRunStatus = "success" | "failure" | "disabled";

export interface RecordCronRunInput {
  cron: string;
  status: CronRunStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  summary?: Record<string, unknown>;
  error?: string;
}

export interface CronRun {
  id: number;
  cron: string;
  status: CronRunStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: Record<string, unknown> | null;
  error: string | null;
}

interface CronRunRow {
  id: number;
  cron: string;
  status: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  summary_json: string | null;
  error: string | null;
}

let ensured = false;

export function ensureCronRunsSchema(): void {
  if (ensured) return;

  db.prepare(
    `CREATE TABLE IF NOT EXISTS cron_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cron TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      summary_json TEXT,
      error TEXT
    )`,
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_cron_runs_cron_started ON cron_runs(cron, started_at)",
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_cron_runs_started ON cron_runs(started_at)",
  ).run();

  ensured = true;
}

export function recordCronRun(input: RecordCronRunInput): void {
  ensureCronRunsSchema();

  const finishedAt = input.finishedAt ?? nowIso();
  const durationMs =
    input.durationMs ??
    Math.max(
      0,
      Date.parse(finishedAt || "") - Date.parse(input.startedAt || ""),
    );

  db.prepare(
    `INSERT INTO cron_runs (
      cron, status, started_at, finished_at, duration_ms, summary_json, error
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.cron,
    input.status,
    input.startedAt,
    finishedAt,
    durationMs,
    input.summary ? JSON.stringify(input.summary) : null,
    input.error ?? null,
  );
}

export function listRecentCronRuns(limit = 50): CronRun[] {
  ensureCronRunsSchema();
  const rows = db
    .prepare(
      `SELECT id, cron, status, started_at, finished_at, duration_ms,
              summary_json, error
         FROM cron_runs
        ORDER BY started_at DESC, id DESC
        LIMIT ?`,
    )
    .all(Math.min(Math.max(limit, 1), 200)) as CronRunRow[];

  return rows.map(mapCronRun);
}

function mapCronRun(row: CronRunRow): CronRun {
  return {
    id: row.id,
    cron: row.cron,
    status:
      row.status === "failure" || row.status === "disabled"
        ? row.status
        : "success",
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: row.duration_ms,
    summary: row.summary_json
      ? (JSON.parse(row.summary_json) as Record<string, unknown>)
      : null,
    error: row.error,
  };
}
