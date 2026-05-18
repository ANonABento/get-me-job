import db from "./legacy";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";

export type WebVitalName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
export type WebVitalRating = "good" | "needs-improvement" | "poor";

export interface RecordWebVitalInput {
  metricId: string;
  name: WebVitalName;
  value: number;
  delta: number;
  rating: WebVitalRating;
  navigationType?: string | null;
  pathname?: string | null;
  userAgent?: string | null;
}

export interface WebVitalRecord extends RecordWebVitalInput {
  id: string;
  createdAt: string;
}

let schemaReady = false;

export function ensureWebVitalsSchema(): void {
  if (schemaReady) return;
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS web_vitals (
      id TEXT PRIMARY KEY NOT NULL,
      metric_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      delta REAL NOT NULL,
      rating TEXT NOT NULL,
      navigation_type TEXT,
      pathname TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    )
  `,
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_web_vitals_name_created ON web_vitals(name, created_at)",
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_web_vitals_path_created ON web_vitals(pathname, created_at)",
  ).run();
  schemaReady = true;
}

export function recordWebVital(input: RecordWebVitalInput): WebVitalRecord {
  ensureWebVitalsSchema();
  const id = generateId();
  const createdAt = nowIso();

  db.prepare(
    `
    INSERT INTO web_vitals (
      id, metric_id, name, value, delta, rating, navigation_type, pathname,
      user_agent, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    input.metricId,
    input.name,
    input.value,
    input.delta,
    input.rating,
    input.navigationType ?? null,
    input.pathname ?? null,
    input.userAgent ?? null,
    createdAt,
  );

  return { ...input, id, createdAt };
}
