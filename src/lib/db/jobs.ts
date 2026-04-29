import db from "./schema";
import { generateId } from "@/lib/utils";
import type { JobDescription, JobStatus } from "@/types";

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
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Get all jobs
export function getJobs(userId: string = "default"): JobDescription[] {
  const rows = db.prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC").all(userId) as JobRow[];
  return rows.map(mapRowToJob);
}

// Get single job
export function getJob(id: string, userId: string = "default"): JobDescription | null {
  const row = db.prepare("SELECT * FROM jobs WHERE id = ? AND user_id = ?").get(id, userId) as JobRow | undefined;
  if (!row) return null;
  return mapRowToJob(row);
}

// Create job
export function createJob(job: Omit<JobDescription, "id" | "createdAt">, userId: string = "default"): JobDescription {
  const id = generateId();
  db.prepare(`
    INSERT INTO jobs (id, title, company, location, type, remote, salary, description, requirements_json, responsibilities_json, keywords_json, url, status, deadline, notes, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    job.deadline || null,
    job.notes || null,
    userId
  );
  return getJob(id, userId)!;
}

// Update job
export function updateJob(id: string, updates: Partial<JobDescription>, userId: string = "default"): void {
  const existing = getJob(id, userId);
  if (!existing) return;

  const merged = { ...existing, ...updates };
  db.prepare(`
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
  `).run(
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
    userId
  );
}

// Update job status
export function updateJobStatus(
  id: string,
  status: JobStatus,
  appliedAt?: string,
  userId: string = "default"
): JobDescription | null {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE jobs SET
      status = ?,
      applied_at = COALESCE(?, applied_at)
    WHERE id = ? AND user_id = ?
  `).run(
    status,
    status === "applied" && !appliedAt ? now : appliedAt || null,
    id,
    userId
  );

  return getJob(id, userId);
}

// Delete job
export function deleteJob(id: string, userId: string = "default"): void {
  db.prepare("DELETE FROM jobs WHERE id = ? AND user_id = ?").run(id, userId);
}
