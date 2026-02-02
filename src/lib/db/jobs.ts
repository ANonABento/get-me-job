import db from "./schema";
import { generateId } from "@/lib/utils";
import type { JobDescription } from "@/types";

// Get all jobs
export function getJobs(userId: string = "default"): JobDescription[] {
  const rows = db.prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    remote: Boolean(row.remote),
    salary: row.salary,
    description: row.description,
    requirements: row.requirements_json ? JSON.parse(row.requirements_json) : [],
    responsibilities: row.responsibilities_json ? JSON.parse(row.responsibilities_json) : [],
    keywords: row.keywords_json ? JSON.parse(row.keywords_json) : [],
    url: row.url,
    status: row.status || "saved",
    appliedAt: row.applied_at,
    deadline: row.deadline,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

// Get single job
export function getJob(id: string): JobDescription | null {
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    remote: Boolean(row.remote),
    salary: row.salary,
    description: row.description,
    requirements: row.requirements_json ? JSON.parse(row.requirements_json) : [],
    responsibilities: row.responsibilities_json ? JSON.parse(row.responsibilities_json) : [],
    keywords: row.keywords_json ? JSON.parse(row.keywords_json) : [],
    url: row.url,
    status: row.status || "saved",
    appliedAt: row.applied_at,
    deadline: row.deadline,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// Create job
export function createJob(job: Omit<JobDescription, "id" | "createdAt">, userId: string = "default"): JobDescription {
  const id = generateId();
  db.prepare(`
    INSERT INTO jobs (id, title, company, location, type, remote, salary, description, requirements_json, responsibilities_json, keywords_json, url, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    userId
  );
  return getJob(id)!;
}

// Update job
export function updateJob(id: string, updates: Partial<JobDescription>): void {
  const existing = getJob(id);
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
    WHERE id = ?
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
    id
  );
}

// Update job status
export function updateJobStatus(
  id: string,
  status: string,
  appliedAt?: string
): JobDescription | null {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE jobs SET
      status = ?,
      applied_at = COALESCE(?, applied_at)
    WHERE id = ?
  `).run(
    status,
    status === "applied" && !appliedAt ? now : appliedAt || null,
    id
  );

  return getJob(id);
}

// Delete job
export function deleteJob(id: string): void {
  db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
}
