/**
 * User-scoped customization knobs for the opportunities surface.
 * Spec: docs/opportunity-customization-spec.md §3.1 + §4 buckets C+D.
 *
 * One row per user. Reads upsert a default row on first access so the
 * UI never has to handle "preferences not loaded yet" beyond the
 * initial fetch state.
 */
import db from "./legacy";
import type { OpportunitySortId } from "@slothing/shared/schemas";

export type DisplayDensity = "comfortable" | "compact";

/** Available badge keys shown on the review queue card meta row. */
export const VISIBLE_BADGE_KEYS = [
  "applicants",
  "openings",
  "workTerm",
  "level",
  "remote",
  "source",
  "deadline",
  "salary",
] as const;
export type VisibleBadgeKey = (typeof VISIBLE_BADGE_KEYS)[number];

export interface OpportunityViewPreferences {
  // Display
  displayDensity: DisplayDensity;
  defaultSortId: OpportunitySortId;
  visibleBadges: VisibleBadgeKey[];
  // Scrape
  scrapeThrottleMs: number;
  scrapeChunkSize: number;
  scrapeMaxJobs: number;
  scrapeMaxPages: number;
  scrapeDedupeEnabled: boolean;
}

export const DEFAULT_VIEW_PREFERENCES: OpportunityViewPreferences = {
  displayDensity: "comfortable",
  defaultSortId: "most-recent",
  visibleBadges: ["applicants", "openings", "workTerm", "level", "remote"],
  scrapeThrottleMs: 500,
  scrapeChunkSize: 5,
  scrapeMaxJobs: 200,
  scrapeMaxPages: 50,
  scrapeDedupeEnabled: true,
};

interface OpportunityViewPreferencesRow {
  user_id: string;
  display_density?: string;
  default_sort_id?: string;
  visible_badges_json?: string;
  scrape_throttle_ms?: number;
  scrape_chunk_size?: number;
  scrape_max_jobs?: number;
  scrape_max_pages?: number;
  scrape_dedupe_enabled?: number | boolean;
}

let preferencesSchemaEnsured = false;

function ensurePreferencesSchema(): void {
  if (preferencesSchemaEnsured) return;
  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec !== "function") {
    preferencesSchemaEnsured = true;
    return;
  }
  const statements = [
    `CREATE TABLE IF NOT EXISTS opportunity_view_preferences (
      user_id TEXT PRIMARY KEY,
      display_density TEXT,
      default_sort_id TEXT,
      visible_badges_json TEXT,
      scrape_throttle_ms INTEGER,
      scrape_chunk_size INTEGER,
      scrape_max_jobs INTEGER,
      scrape_max_pages INTEGER,
      scrape_dedupe_enabled INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ];
  for (const statement of statements) {
    try {
      exec.call(db, statement);
    } catch (error) {
      const message = (error as Error).message.toLowerCase();
      if (!message.includes("already exists")) throw error;
    }
  }
  preferencesSchemaEnsured = true;
}

function mergeWithDefaults(
  row: OpportunityViewPreferencesRow | undefined,
): OpportunityViewPreferences {
  if (!row) return { ...DEFAULT_VIEW_PREFERENCES };
  return {
    displayDensity:
      (row.display_density as DisplayDensity | undefined) ??
      DEFAULT_VIEW_PREFERENCES.displayDensity,
    defaultSortId:
      (row.default_sort_id as OpportunitySortId | undefined) ??
      DEFAULT_VIEW_PREFERENCES.defaultSortId,
    visibleBadges: parseBadges(row.visible_badges_json),
    scrapeThrottleMs:
      row.scrape_throttle_ms ?? DEFAULT_VIEW_PREFERENCES.scrapeThrottleMs,
    scrapeChunkSize:
      row.scrape_chunk_size ?? DEFAULT_VIEW_PREFERENCES.scrapeChunkSize,
    scrapeMaxJobs:
      row.scrape_max_jobs ?? DEFAULT_VIEW_PREFERENCES.scrapeMaxJobs,
    scrapeMaxPages:
      row.scrape_max_pages ?? DEFAULT_VIEW_PREFERENCES.scrapeMaxPages,
    scrapeDedupeEnabled:
      row.scrape_dedupe_enabled === undefined
        ? DEFAULT_VIEW_PREFERENCES.scrapeDedupeEnabled
        : Boolean(row.scrape_dedupe_enabled),
  };
}

function parseBadges(raw?: string): VisibleBadgeKey[] {
  if (!raw) return [...DEFAULT_VIEW_PREFERENCES.visibleBadges];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed))
      return [...DEFAULT_VIEW_PREFERENCES.visibleBadges];
    const known = new Set(VISIBLE_BADGE_KEYS);
    return parsed.filter(
      (item): item is VisibleBadgeKey =>
        typeof item === "string" && known.has(item as VisibleBadgeKey),
    );
  } catch {
    return [...DEFAULT_VIEW_PREFERENCES.visibleBadges];
  }
}

export function getViewPreferences(userId: string): OpportunityViewPreferences {
  ensurePreferencesSchema();
  const row = db
    .prepare("SELECT * FROM opportunity_view_preferences WHERE user_id = ?")
    .get(userId) as OpportunityViewPreferencesRow | undefined;
  return mergeWithDefaults(row);
}

export function setViewPreferences(
  userId: string,
  updates: Partial<OpportunityViewPreferences>,
): OpportunityViewPreferences {
  ensurePreferencesSchema();
  const current = getViewPreferences(userId);
  const merged: OpportunityViewPreferences = { ...current, ...updates };
  // Clamp scrape numerics to spec bounds (§4 bucket D acceptance).
  merged.scrapeThrottleMs = clamp(merged.scrapeThrottleMs, 100, 5000);
  merged.scrapeChunkSize = clamp(merged.scrapeChunkSize, 1, 50);
  merged.scrapeMaxJobs = clamp(merged.scrapeMaxJobs, 1, 1000);
  merged.scrapeMaxPages = clamp(merged.scrapeMaxPages, 1, 200);

  db.prepare(
    `INSERT INTO opportunity_view_preferences (
      user_id, display_density, default_sort_id, visible_badges_json,
      scrape_throttle_ms, scrape_chunk_size, scrape_max_jobs,
      scrape_max_pages, scrape_dedupe_enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      display_density = excluded.display_density,
      default_sort_id = excluded.default_sort_id,
      visible_badges_json = excluded.visible_badges_json,
      scrape_throttle_ms = excluded.scrape_throttle_ms,
      scrape_chunk_size = excluded.scrape_chunk_size,
      scrape_max_jobs = excluded.scrape_max_jobs,
      scrape_max_pages = excluded.scrape_max_pages,
      scrape_dedupe_enabled = excluded.scrape_dedupe_enabled,
      updated_at = CURRENT_TIMESTAMP`,
  ).run(
    userId,
    merged.displayDensity,
    merged.defaultSortId,
    JSON.stringify(merged.visibleBadges),
    merged.scrapeThrottleMs,
    merged.scrapeChunkSize,
    merged.scrapeMaxJobs,
    merged.scrapeMaxPages,
    merged.scrapeDedupeEnabled ? 1 : 0,
  );
  return merged;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}
