import db from "./legacy";
import { generateId } from "@/lib/utils";
import type { JobDescription, JobStatus } from "@/types";

import { nowIso } from "@/lib/format/time";
interface JobRow {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: JobDescription["type"];
  remote?: number | boolean;
  salary?: string;
  description: string;
  requirements_json?: string;
  responsibilities_json?: string;
  keywords_json?: string;
  url?: string;
  status?: JobStatus;
  applied_at?: string;
  deadline?: string;
  notes?: string;
  created_at?: string;
  source?: string;
  source_job_id?: string;
  openings?: number;
  applicants?: number;
  level?: string;
  work_term?: string;
}

// Additive migration for the extension-import metadata. Each ALTER is
// wrapped so a re-run on a DB that already has the column is a no-op.
let jobsExtensionFieldsEnsured = false;
function ensureJobsExtensionFields(): void {
  if (jobsExtensionFieldsEnsured) return;
  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec !== "function") {
    jobsExtensionFieldsEnsured = true;
    return;
  }
  const statements = [
    "ALTER TABLE jobs ADD COLUMN source TEXT",
    "ALTER TABLE jobs ADD COLUMN source_job_id TEXT",
    "ALTER TABLE jobs ADD COLUMN openings INTEGER",
    "ALTER TABLE jobs ADD COLUMN applicants INTEGER",
    "ALTER TABLE jobs ADD COLUMN level TEXT",
    "ALTER TABLE jobs ADD COLUMN work_term TEXT",
    "CREATE INDEX IF NOT EXISTS idx_jobs_user_source_job ON jobs(user_id, source, source_job_id)",
  ];
  for (const statement of statements) {
    try {
      exec.call(db, statement);
    } catch (error) {
      const message = (error as Error).message.toLowerCase();
      if (!message.includes("duplicate column")) throw error;
    }
  }
  jobsExtensionFieldsEnsured = true;
}

export interface CreatedAtCursor {
  lastId: string;
  lastCreatedAt: string;
}

export interface ListJobsParams {
  userId: string;
  statuses?: JobStatus[];
  cursor?: CreatedAtCursor | null;
  limit: number;
}

function parseJsonArray(value?: string): string[] {
  if (!value) {
    return [];
  }

  const parsed: unknown = JSON.parse(value);
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string")
    : [];
}

function mapRowToJob(row: JobRow): JobDescription {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    remote: Boolean(row.remote),
    salary: row.salary,
    description: row.description,
    requirements: parseJsonArray(row.requirements_json),
    responsibilities: parseJsonArray(row.responsibilities_json),
    keywords: parseJsonArray(row.keywords_json),
    url: row.url,
    status: row.status || "saved",
    appliedAt: row.applied_at,
    deadline: row.deadline,
    notes: row.notes,
    createdAt: row.created_at || nowIso(),
    source: row.source,
    sourceJobId: row.source_job_id,
    openings: typeof row.openings === "number" ? row.openings : undefined,
    applicants: typeof row.applicants === "number" ? row.applicants : undefined,
    level: row.level,
    workTerm: row.work_term,
  };
}

// Get all jobs
export function getJobs(userId: string): JobDescription[] {
  const rows = db
    .prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as JobRow[];
  return rows.map(mapRowToJob);
}

export function listJobsPaginated({
  userId,
  statuses,
  cursor,
  limit,
}: ListJobsParams): JobDescription[] {
  const whereClauses = ["user_id = ?"];
  const params: Array<string | number> = [userId];

  if (statuses?.length) {
    whereClauses.push(`status IN (${statuses.map(() => "?").join(", ")})`);
    params.push(...statuses);
  }

  if (cursor) {
    whereClauses.push("(created_at < ? OR (created_at = ? AND id < ?))");
    params.push(cursor.lastCreatedAt, cursor.lastCreatedAt, cursor.lastId);
  }

  params.push(limit + 1);

  const rows = db
    .prepare(
      `SELECT * FROM jobs
       WHERE ${whereClauses.join(" AND ")}
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .all(...params) as JobRow[];
  return rows.map(mapRowToJob);
}

// Get single job
export function getJob(id: string, userId: string): JobDescription | null {
  const row = db
    .prepare("SELECT * FROM jobs WHERE id = ? AND user_id = ?")
    .get(id, userId) as JobRow | undefined;
  if (!row) return null;
  return mapRowToJob(row);
}

/**
 * Looks up an opportunity without a user predicate for share-card generation.
 * Only use this from OG image routes: opportunity IDs are random share tokens,
 * but titles and companies become visible to anyone with the exact URL.
 */
export function getJobByIdAnyUser(id: string): JobDescription | null {
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as
    | JobRow
    | undefined;
  if (!row) return null;
  return mapRowToJob(row);
}

export function getJobByUrl(
  url: string,
  userId: string,
): JobDescription | null {
  const row = db
    .prepare("SELECT * FROM jobs WHERE url = ? AND user_id = ?")
    .get(url, userId) as JobRow | undefined;
  if (!row) return null;
  return mapRowToJob(row);
}

/**
 * Lookup by (source, sourceJobId) — the natural key for extension imports.
 * Used by the dedupe pre-scrape filter so we can skip rows whose posting
 * has already been imported.
 */
export function getJobBySource(
  source: string,
  sourceJobId: string,
  userId: string,
): JobDescription | null {
  ensureJobsExtensionFields();
  const row = db
    .prepare(
      "SELECT * FROM jobs WHERE source = ? AND source_job_id = ? AND user_id = ?",
    )
    .get(source, sourceJobId, userId) as JobRow | undefined;
  if (!row) return null;
  return mapRowToJob(row);
}

/**
 * Return every (source, sourceJobId) the user has already imported for the
 * given source. Drives the orchestrator's pre-row dupe filter so we never
 * click into a posting we've seen.
 */
export function listSourceJobIds(source: string, userId: string): string[] {
  ensureJobsExtensionFields();
  const rows = db
    .prepare(
      "SELECT source_job_id AS id FROM jobs WHERE source = ? AND user_id = ? AND source_job_id IS NOT NULL",
    )
    .all(source, userId) as { id: string | null }[];
  return rows
    .map((r) => r.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

// Create job
export function createJob(
  job: Omit<JobDescription, "id" | "createdAt">,
  userId: string,
): JobDescription {
  ensureJobsExtensionFields();
  const id = generateId();
  db.prepare(
    `
    INSERT INTO jobs (id, title, company, location, type, remote, salary, description, requirements_json, responsibilities_json, keywords_json, url, status, applied_at, deadline, notes, source, source_job_id, openings, applicants, level, work_term, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    job.title,
    job.company,
    job.location || null,
    job.type || null,
    job.remote ? 1 : 0,
    job.salary || null,
    job.description,
    JSON.stringify(job.requirements || []),
    JSON.stringify(job.responsibilities || []),
    JSON.stringify(job.keywords || []),
    job.url || null,
    job.status || "saved",
    job.appliedAt || null,
    job.deadline || null,
    job.notes || null,
    job.source || null,
    job.sourceJobId || null,
    typeof job.openings === "number" ? job.openings : null,
    typeof job.applicants === "number" ? job.applicants : null,
    job.level || null,
    job.workTerm || null,
    userId,
  );
  return getJob(id, userId)!;
}

// Update job
export function updateJob(
  id: string,
  updates: Partial<JobDescription>,
  userId: string,
): void {
  const existing = getJob(id, userId);
  if (!existing) return;

  const merged = { ...existing, ...updates };
  db.prepare(
    `
    UPDATE jobs SET
      title = ?,
      company = ?,
      location = ?,
      type = ?,
      remote = ?,
      salary = ?,
      description = ?,
      requirements_json = ?,
      responsibilities_json = ?,
      keywords_json = ?,
      url = ?,
      status = ?,
      applied_at = ?,
      deadline = ?,
      notes = ?
    WHERE id = ? AND user_id = ?
  `,
  ).run(
    merged.title,
    merged.company,
    merged.location || null,
    merged.type || null,
    merged.remote ? 1 : 0,
    merged.salary || null,
    merged.description,
    JSON.stringify(merged.requirements || []),
    JSON.stringify(merged.responsibilities || []),
    JSON.stringify(merged.keywords || []),
    merged.url || null,
    merged.status || "saved",
    merged.appliedAt || null,
    merged.deadline || null,
    merged.notes || null,
    id,
    userId,
  );
}

// Update job status
export function updateJobStatus(
  id: string,
  status: JobStatus,
  appliedAt: string | undefined,
  userId: string,
): JobDescription | null {
  const now = nowIso();

  db.prepare(
    `
    UPDATE jobs SET
      status = ?,
      applied_at = COALESCE(?, applied_at)
    WHERE id = ? AND user_id = ?
  `,
  ).run(
    status,
    status === "applied" && !appliedAt ? now : appliedAt || null,
    id,
    userId,
  );

  return getJob(id, userId);
}

// Delete job
export function deleteJob(id: string, userId: string): void {
  db.prepare("DELETE FROM jobs WHERE id = ? AND user_id = ?").run(id, userId);
}

export function countJobsByStatus(status: string, userId: string): number {
  const result = db
    .prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE status = ? AND user_id = ?",
    )
    .get(status, userId) as { count: number } | undefined;
  return result?.count ?? 0;
}
