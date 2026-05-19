/**
 * Data access for `opportunity_presets` — saved filter+sort combinations
 * users apply to the review queue with one click. Spec:
 * docs/opportunity-customization-spec.md §3.2 + §4 bucket A.
 *
 * Migration is idempotent so a re-run on a DB that already has the table
 * is a no-op (mirrors the pattern in jobs.ts / profile-bank.ts).
 */
import db from "./legacy";
import { generateId } from "@/lib/utils";
import {
  type OpportunityPreset,
  type OpportunityPresetScope,
  type OpportunitySortId,
  type OpportunityFilters,
  opportunityPresetSchema,
} from "@slothing/shared/schemas";

interface OpportunityPresetRow {
  id: string;
  user_id: string;
  name: string;
  scope: string;
  filters_json: string;
  sort_id: string;
  pinned: number | boolean;
  position: number | null;
  created_at?: string;
  updated_at?: string;
}

let opportunityPresetsSchemaEnsured = false;

/**
 * Lazily create the `opportunity_presets` table on first access. Safe to
 * call from every read/write path — the create-if-not-exists makes it a
 * one-shot per process; the boolean flag prevents repeated PRAGMA hits.
 */
function ensureOpportunityPresetsSchema(): void {
  if (opportunityPresetsSchemaEnsured) return;
  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec !== "function") {
    opportunityPresetsSchemaEnsured = true;
    return;
  }
  const statements = [
    `CREATE TABLE IF NOT EXISTS opportunity_presets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'review',
      filters_json TEXT NOT NULL,
      sort_id TEXT NOT NULL DEFAULT 'most-recent',
      pinned INTEGER NOT NULL DEFAULT 0,
      position INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    "CREATE INDEX IF NOT EXISTS idx_opportunity_presets_user_pinned ON opportunity_presets(user_id, pinned)",
    "CREATE INDEX IF NOT EXISTS idx_opportunity_presets_user_scope ON opportunity_presets(user_id, scope)",
  ];
  for (const statement of statements) {
    try {
      exec.call(db, statement);
    } catch (error) {
      // CREATE IF NOT EXISTS is idempotent; ignore "already exists"
      // messages from drivers that surface them as errors.
      const message = (error as Error).message.toLowerCase();
      if (!message.includes("already exists")) throw error;
    }
  }
  opportunityPresetsSchemaEnsured = true;
}

function mapRow(row: OpportunityPresetRow): OpportunityPreset {
  return {
    id: row.id,
    name: row.name,
    scope: row.scope as OpportunityPresetScope,
    filters: safeParseFilters(row.filters_json),
    sortId: row.sort_id as OpportunitySortId,
    pinned: Boolean(row.pinned),
    position: row.position ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeParseFilters(raw: string): OpportunityFilters {
  // Filters are user-authored JSON; if we ever land an invalid blob we
  // don't want to break the entire preset list. Treat the parse failure
  // as "empty filters" so the preset still shows + can be re-saved.
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as OpportunityFilters)
      : {};
  } catch {
    return {};
  }
}

export function listOpportunityPresets(
  userId: string,
  scope?: OpportunityPresetScope,
): OpportunityPreset[] {
  ensureOpportunityPresetsSchema();
  ensureSeedPresets(userId);
  const rows = (
    scope
      ? db
          .prepare(
            "SELECT * FROM opportunity_presets WHERE user_id = ? AND scope = ? ORDER BY pinned DESC, position ASC, created_at ASC",
          )
          .all(userId, scope)
      : db
          .prepare(
            "SELECT * FROM opportunity_presets WHERE user_id = ? ORDER BY pinned DESC, position ASC, created_at ASC",
          )
          .all(userId)
  ) as OpportunityPresetRow[];
  return rows.map(mapRow);
}

export function getOpportunityPreset(
  id: string,
  userId: string,
): OpportunityPreset | null {
  ensureOpportunityPresetsSchema();
  const row = db
    .prepare("SELECT * FROM opportunity_presets WHERE id = ? AND user_id = ?")
    .get(id, userId) as OpportunityPresetRow | undefined;
  return row ? mapRow(row) : null;
}

export interface CreatePresetInput {
  name: string;
  scope?: OpportunityPresetScope;
  filters: OpportunityFilters;
  sortId?: OpportunitySortId;
  pinned?: boolean;
  position?: number | null;
}

export function createOpportunityPreset(
  input: CreatePresetInput,
  userId: string,
): OpportunityPreset {
  ensureOpportunityPresetsSchema();
  const id = generateId();
  db.prepare(
    `INSERT INTO opportunity_presets
      (id, user_id, name, scope, filters_json, sort_id, pinned, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    input.name,
    input.scope ?? "review",
    JSON.stringify(input.filters ?? {}),
    input.sortId ?? "most-recent",
    input.pinned ? 1 : 0,
    input.position ?? null,
  );
  return getOpportunityPreset(id, userId)!;
}

export interface UpdatePresetInput {
  name?: string;
  scope?: OpportunityPresetScope;
  filters?: OpportunityFilters;
  sortId?: OpportunitySortId;
  pinned?: boolean;
  position?: number | null;
}

export function updateOpportunityPreset(
  id: string,
  updates: UpdatePresetInput,
  userId: string,
): OpportunityPreset | null {
  ensureOpportunityPresetsSchema();
  const existing = getOpportunityPreset(id, userId);
  if (!existing) return null;

  const merged: OpportunityPreset = {
    ...existing,
    ...updates,
    filters: updates.filters ?? existing.filters,
  };
  db.prepare(
    `UPDATE opportunity_presets SET
      name = ?,
      scope = ?,
      filters_json = ?,
      sort_id = ?,
      pinned = ?,
      position = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
  ).run(
    merged.name,
    merged.scope,
    JSON.stringify(merged.filters ?? {}),
    merged.sortId,
    merged.pinned ? 1 : 0,
    merged.position ?? null,
    id,
    userId,
  );
  return getOpportunityPreset(id, userId);
}

export function deleteOpportunityPreset(id: string, userId: string): boolean {
  ensureOpportunityPresetsSchema();
  const result = db
    .prepare("DELETE FROM opportunity_presets WHERE id = ? AND user_id = ?")
    .run(id, userId);
  // better-sqlite3 returns { changes } — > 0 = deleted.
  const changes = (result as { changes?: number }).changes ?? 0;
  return changes > 0;
}

let seedAttempted = new Set<string>();

/**
 * Seeds three starter presets the first time a user opens their review
 * queue (spec §4 bucket A defaults). Idempotent — the in-memory set
 * gates each user to one attempt per process, and the count check
 * inside guarantees we never insert duplicates even if the seed flag
 * is wiped (e.g. after a `pnpm dev` restart).
 */
function ensureSeedPresets(userId: string): void {
  if (seedAttempted.has(userId)) return;
  seedAttempted.add(userId);
  const row = db
    .prepare("SELECT COUNT(*) AS n FROM opportunity_presets WHERE user_id = ?")
    .get(userId) as { n: number } | undefined;
  if (row && row.n > 0) return;

  const defaults: CreatePresetInput[] = [
    {
      name: "All open",
      scope: "review",
      filters: {},
      sortId: "most-recent",
      pinned: true,
      position: 0,
    },
    {
      name: "Closing this week",
      scope: "review",
      filters: {},
      sortId: "soonest-deadline",
      pinned: true,
      position: 1,
    },
    {
      name: "<25 applicants",
      scope: "review",
      // No `applicants` filter exists in OpportunityFilters yet; sort by
      // lowest-applicants is the closest approximation. Bucket C in the
      // spec adds a per-field filter UI that can extend this preset.
      filters: {},
      sortId: "lowest-applicants",
      pinned: true,
      position: 2,
    },
  ];
  for (const preset of defaults) {
    createOpportunityPreset(preset, userId);
  }
}

// Test-only: lets the integration test reset seeding between runs.
export function _resetSeedCache() {
  seedAttempted = new Set();
}

// Re-export the validation schema for the API layer.
export { opportunityPresetSchema };
