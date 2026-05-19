/**
 * User-scoped customization knobs for the opportunities surface.
 * Spec: docs/opportunity-customization-spec.md §3.1 + §4 buckets C+D.
 *
 * One row per user. Reads upsert a default row on first access so the
 * UI never has to handle "preferences not loaded yet" beyond the
 * initial fetch state.
 */
import db from "./legacy";
import type {
  ImportDefaultStatus,
  OpportunityAutoTagRule,
  OpportunitySortId,
  PayNormalizationCurrency,
  PayNormalizationUnit,
} from "@slothing/shared/schemas";
import {
  PAY_NORMALIZATION_CURRENCIES,
  PAY_NORMALIZATION_UNITS,
  opportunityAutoTagRuleSchema,
} from "@slothing/shared/schemas";
import type { LayoutPreference } from "@/lib/opportunities/layout-chunks";
import { layoutPreferenceSchema } from "@/lib/opportunities/layout-chunks";

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
  // Import behavior (bucket E)
  autoImportEnabled: boolean;
  defaultImportStatus: ImportDefaultStatus;
  autoTagRules: OpportunityAutoTagRule[];
  // Pay normalization (bucket G)
  payNormalizationUnit: PayNormalizationUnit;
  payNormalizationCurrency: PayNormalizationCurrency;
  // Card layout builder (F.1) — null means "use defaults". Stored as a
  // JSON blob so adding a new chunk doesn't require a schema migration.
  layoutPreference: LayoutPreference | null;
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
  autoImportEnabled: false,
  defaultImportStatus: "pending",
  autoTagRules: [],
  payNormalizationUnit: "annual",
  payNormalizationCurrency: "USD",
  layoutPreference: null,
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
  auto_import_enabled?: number | boolean;
  default_import_status?: string;
  auto_tag_rules_json?: string;
  pay_normalization_unit?: string;
  pay_normalization_currency?: string;
  layout_json?: string;
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
    // Additive ALTER for bucket E. Existing rows get NULL → defaults
    // via mergeWithDefaults below.
    "ALTER TABLE opportunity_view_preferences ADD COLUMN auto_import_enabled INTEGER",
    "ALTER TABLE opportunity_view_preferences ADD COLUMN default_import_status TEXT",
    "ALTER TABLE opportunity_view_preferences ADD COLUMN auto_tag_rules_json TEXT",
    // Bucket G — pay normalization display preferences.
    "ALTER TABLE opportunity_view_preferences ADD COLUMN pay_normalization_unit TEXT",
    "ALTER TABLE opportunity_view_preferences ADD COLUMN pay_normalization_currency TEXT",
    // F.1 — drag-and-drop card layout. JSON blob; getEffectiveLayout
    // normalizes against the current chunk catalog at read time.
    "ALTER TABLE opportunity_view_preferences ADD COLUMN layout_json TEXT",
  ];
  for (const statement of statements) {
    try {
      exec.call(db, statement);
    } catch (error) {
      const message = (error as Error).message.toLowerCase();
      if (
        !message.includes("already exists") &&
        !message.includes("duplicate column")
      ) {
        throw error;
      }
    }
  }
  preferencesSchemaEnsured = true;
}

const PAY_UNIT_SET = new Set<string>(PAY_NORMALIZATION_UNITS);
const PAY_CURRENCY_SET = new Set<string>(PAY_NORMALIZATION_CURRENCIES);

function mergeWithDefaults(
  row: OpportunityViewPreferencesRow | undefined,
): OpportunityViewPreferences {
  if (!row) return { ...DEFAULT_VIEW_PREFERENCES, autoTagRules: [] };
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
    autoImportEnabled:
      row.auto_import_enabled === undefined
        ? DEFAULT_VIEW_PREFERENCES.autoImportEnabled
        : Boolean(row.auto_import_enabled),
    defaultImportStatus:
      (row.default_import_status as ImportDefaultStatus | undefined) ??
      DEFAULT_VIEW_PREFERENCES.defaultImportStatus,
    autoTagRules: parseRules(row.auto_tag_rules_json),
    payNormalizationUnit:
      row.pay_normalization_unit && PAY_UNIT_SET.has(row.pay_normalization_unit)
        ? (row.pay_normalization_unit as PayNormalizationUnit)
        : DEFAULT_VIEW_PREFERENCES.payNormalizationUnit,
    payNormalizationCurrency:
      row.pay_normalization_currency &&
      PAY_CURRENCY_SET.has(row.pay_normalization_currency)
        ? (row.pay_normalization_currency as PayNormalizationCurrency)
        : DEFAULT_VIEW_PREFERENCES.payNormalizationCurrency,
    layoutPreference: parseLayoutPreference(row.layout_json),
  };
}

function parseLayoutPreference(raw?: string): LayoutPreference | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = layoutPreferenceSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function parseRules(raw?: string): OpportunityAutoTagRule[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each rule individually — drop the bad ones rather than
    // throwing, so a malformed migration doesn't wedge the user out of
    // their settings UI.
    const valid: OpportunityAutoTagRule[] = [];
    for (const candidate of parsed) {
      const result = opportunityAutoTagRuleSchema.safeParse(candidate);
      if (result.success) valid.push(result.data);
    }
    return valid;
  } catch {
    return [];
  }
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
  // Bucket E rule list hard-cap matches the spec risk-mitigation table.
  if (merged.autoTagRules.length > 50) {
    merged.autoTagRules = merged.autoTagRules.slice(0, 50);
  }

  db.prepare(
    `INSERT INTO opportunity_view_preferences (
      user_id, display_density, default_sort_id, visible_badges_json,
      scrape_throttle_ms, scrape_chunk_size, scrape_max_jobs,
      scrape_max_pages, scrape_dedupe_enabled,
      auto_import_enabled, default_import_status, auto_tag_rules_json,
      pay_normalization_unit, pay_normalization_currency,
      layout_json,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      display_density = excluded.display_density,
      default_sort_id = excluded.default_sort_id,
      visible_badges_json = excluded.visible_badges_json,
      scrape_throttle_ms = excluded.scrape_throttle_ms,
      scrape_chunk_size = excluded.scrape_chunk_size,
      scrape_max_jobs = excluded.scrape_max_jobs,
      scrape_max_pages = excluded.scrape_max_pages,
      scrape_dedupe_enabled = excluded.scrape_dedupe_enabled,
      auto_import_enabled = excluded.auto_import_enabled,
      default_import_status = excluded.default_import_status,
      auto_tag_rules_json = excluded.auto_tag_rules_json,
      pay_normalization_unit = excluded.pay_normalization_unit,
      pay_normalization_currency = excluded.pay_normalization_currency,
      layout_json = excluded.layout_json,
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
    merged.autoImportEnabled ? 1 : 0,
    merged.defaultImportStatus,
    JSON.stringify(merged.autoTagRules),
    merged.payNormalizationUnit,
    merged.payNormalizationCurrency,
    merged.layoutPreference ? JSON.stringify(merged.layoutPreference) : null,
  );
  return merged;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}
