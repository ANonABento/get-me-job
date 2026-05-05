import db from "./legacy";
import { generateId } from "@/lib/utils";

export interface PromptVariant {
  id: string;
  name: string;
  version: number;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVariantResult {
  id: string;
  promptVariantId: string;
  jobId: string | null;
  resumeId: string | null;
  matchScore: number | null;
  createdAt: string;
}

export interface PromptVariantStats {
  variantId: string;
  variantName: string;
  version: number;
  active: boolean;
  resultCount: number;
  avgMatchScore: number | null;
}

interface PromptVariantRow {
  id: string;
  name: string;
  version: number;
  content: string;
  active: number;
  created_at: string;
  updated_at: string;
}

interface PromptVariantResultRow {
  id: string;
  prompt_variant_id: string;
  job_id: string | null;
  resume_id: string | null;
  match_score: number | null;
  created_at: string;
}

interface PromptVariantStatsRow {
  variant_id: string;
  variant_name: string;
  version: number;
  active: number;
  result_count: number;
  avg_match_score: number | null;
}

// Default prompt instructions seeded on first access
export const DEFAULT_PROMPT_CONTENT = `1. Write a professional summary (2-3 sentences) tailored to this job
2. Select the 2-3 most relevant experiences from the bank and rewrite bullet points
3. Each experience should have 2-4 bullet points maximum
4. Prioritize skills matching the job description
5. Include relevant achievements in experience bullet points
6. Keep everything concise - one page`;

/**
 * Add a `user_id` column to `prompt_variants` and `prompt_variant_results`
 * tables in dev DBs that pre-date the user-scoping migration. Idempotent.
 *
 * Why: the legacy schema had no user_id column, so a malicious authenticated
 * user could read or modify another user's prompt variants by guessing the id
 * (IDOR). This migration adds user_id with a backfill default of `default`,
 * matching the pattern used by other tables.
 */
function ensurePromptVariantsUserSchema(): void {
  const promptCols = db
    .prepare("PRAGMA table_info(prompt_variants)")
    .all() as Array<{ name: string }>;
  if (!promptCols.some((c) => c.name === "user_id")) {
    db.exec(
      "ALTER TABLE prompt_variants ADD COLUMN user_id TEXT NOT NULL DEFAULT 'default'",
    );
  }
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_prompt_variants_user ON prompt_variants(user_id)",
  );

  const resultCols = db
    .prepare("PRAGMA table_info(prompt_variant_results)")
    .all() as Array<{ name: string }>;
  if (!resultCols.some((c) => c.name === "user_id")) {
    db.exec(
      "ALTER TABLE prompt_variant_results ADD COLUMN user_id TEXT NOT NULL DEFAULT 'default'",
    );
  }
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_prompt_variant_results_user ON prompt_variant_results(user_id)",
  );
}

function rowToVariant(row: PromptVariantRow): PromptVariant {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    content: row.content,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToResult(row: PromptVariantResultRow): PromptVariantResult {
  return {
    id: row.id,
    promptVariantId: row.prompt_variant_id,
    jobId: row.job_id,
    resumeId: row.resume_id,
    matchScore: row.match_score,
    createdAt: row.created_at,
  };
}

/**
 * Ensure at least one default variant exists for this user. Seeds the DB on
 * first call. Returns the seeded variant's id if created, otherwise null.
 */
export function seedDefaultPromptVariant(userId: string): string | null {
  ensurePromptVariantsUserSchema();
  const existing = db
    .prepare("SELECT id FROM prompt_variants WHERE user_id = ? LIMIT 1")
    .get(userId) as { id: string } | undefined;

  if (existing) return null;

  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO prompt_variants (id, user_id, name, version, content, active, created_at, updated_at)
    VALUES (?, ?, ?, 1, ?, 1, ?, ?)
  `,
  ).run(id, userId, "Default", DEFAULT_PROMPT_CONTENT, now, now);

  return id;
}

export function getAllPromptVariants(userId: string): PromptVariant[] {
  ensurePromptVariantsUserSchema();
  return (
    db
      .prepare(
        "SELECT * FROM prompt_variants WHERE user_id = ? ORDER BY version ASC, created_at ASC",
      )
      .all(userId) as PromptVariantRow[]
  ).map(rowToVariant);
}

export function getActivePromptVariant(userId: string): PromptVariant | null {
  ensurePromptVariantsUserSchema();
  seedDefaultPromptVariant(userId);
  const row = db
    .prepare(
      "SELECT * FROM prompt_variants WHERE user_id = ? AND active = 1 LIMIT 1",
    )
    .get(userId) as PromptVariantRow | undefined;
  return row ? rowToVariant(row) : null;
}

export function getPromptVariantById(
  id: string,
  userId: string,
): PromptVariant | null {
  ensurePromptVariantsUserSchema();
  const row = db
    .prepare("SELECT * FROM prompt_variants WHERE id = ? AND user_id = ?")
    .get(id, userId) as PromptVariantRow | undefined;
  return row ? rowToVariant(row) : null;
}

export function createPromptVariant(
  userId: string,
  name: string,
  content: string,
  version?: number,
): PromptVariant {
  ensurePromptVariantsUserSchema();
  let resolvedVersion = version;
  if (resolvedVersion === undefined) {
    const max = db
      .prepare(
        "SELECT MAX(version) as max_v FROM prompt_variants WHERE user_id = ?",
      )
      .get(userId) as { max_v: number | null };
    resolvedVersion = (max.max_v ?? 0) + 1;
  }

  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO prompt_variants (id, user_id, name, version, content, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?)
  `,
  ).run(id, userId, name, resolvedVersion, content, now, now);

  return rowToVariant(
    db
      .prepare("SELECT * FROM prompt_variants WHERE id = ? AND user_id = ?")
      .get(id, userId) as PromptVariantRow,
  );
}

export function setActivePromptVariant(id: string, userId: string): boolean {
  ensurePromptVariantsUserSchema();
  const variant = getPromptVariantById(id, userId);
  if (!variant) return false;

  const now = new Date().toISOString();
  const activate = db.transaction(() => {
    db.prepare(
      "UPDATE prompt_variants SET active = 0, updated_at = ? WHERE user_id = ?",
    ).run(now, userId);
    return db
      .prepare(
        "UPDATE prompt_variants SET active = 1, updated_at = ? WHERE id = ? AND user_id = ?",
      )
      .run(now, id, userId);
  });
  const result = activate();
  return result.changes > 0;
}

export function updatePromptVariant(
  id: string,
  userId: string,
  fields: Partial<Pick<PromptVariant, "name" | "content">>,
): PromptVariant | null {
  ensurePromptVariantsUserSchema();
  const existing = getPromptVariantById(id, userId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = fields.name ?? existing.name;
  const content = fields.content ?? existing.content;

  db.prepare(
    `
    UPDATE prompt_variants SET name = ?, content = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `,
  ).run(name, content, now, id, userId);

  return rowToVariant(
    db
      .prepare("SELECT * FROM prompt_variants WHERE id = ? AND user_id = ?")
      .get(id, userId) as PromptVariantRow,
  );
}

export function deletePromptVariant(id: string, userId: string): boolean {
  ensurePromptVariantsUserSchema();
  const variant = getPromptVariantById(id, userId);
  if (!variant) return false;
  if (variant.active) return false; // refuse to delete the active variant

  const result = db
    .prepare("DELETE FROM prompt_variants WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}

export function logPromptVariantResult(
  userId: string,
  promptVariantId: string,
  jobId?: string,
  resumeId?: string,
  matchScore?: number,
): PromptVariantResult {
  ensurePromptVariantsUserSchema();
  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO prompt_variant_results (id, user_id, prompt_variant_id, job_id, resume_id, match_score, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    userId,
    promptVariantId,
    jobId ?? null,
    resumeId ?? null,
    matchScore ?? null,
    now,
  );

  return rowToResult(
    db
      .prepare("SELECT * FROM prompt_variant_results WHERE id = ? AND user_id = ?")
      .get(id, userId) as PromptVariantResultRow,
  );
}

export function getPromptVariantResults(
  promptVariantId: string,
  userId: string,
): PromptVariantResult[] {
  ensurePromptVariantsUserSchema();
  return (
    db
      .prepare(
        "SELECT * FROM prompt_variant_results WHERE prompt_variant_id = ? AND user_id = ? ORDER BY created_at DESC",
      )
      .all(promptVariantId, userId) as PromptVariantResultRow[]
  ).map(rowToResult);
}

export function getPromptVariantStats(userId: string): PromptVariantStats[] {
  ensurePromptVariantsUserSchema();
  return (
    db
      .prepare(
        `
        SELECT
          pv.id AS variant_id,
          pv.name AS variant_name,
          pv.version,
          pv.active,
          COUNT(pvr.id) AS result_count,
          AVG(pvr.match_score) AS avg_match_score
        FROM prompt_variants pv
        LEFT JOIN prompt_variant_results pvr
          ON pvr.prompt_variant_id = pv.id AND pvr.user_id = pv.user_id
        WHERE pv.user_id = ?
        GROUP BY pv.id
        ORDER BY pv.version ASC
      `,
      )
      .all(userId) as PromptVariantStatsRow[]
  ).map((row) => ({
    variantId: row.variant_id,
    variantName: row.variant_name,
    version: row.version,
    active: row.active === 1,
    resultCount: row.result_count,
    avgMatchScore: row.avg_match_score,
  }));
}
