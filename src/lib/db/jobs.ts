import db from "./schema";
import { generateId } from "@/lib/utils";
import type { JobDescription } from "@/types";

// Get all jobs
export function getJobs(): JobDescription[] {
  const rows = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all() as any[];
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
    createdAt: row.created_at,
  };
}

// Create job
export function createJob(job: Omit<JobDescription, "id" | "createdAt">): JobDescription {
  const id = generateId();
  db.prepare(`
    INSERT INTO jobs (id, title, company, location, type, remote, salary, description, requirements_json, responsibilities_json, keywords_json, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    job.url || null
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
      url = ?
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
    id
  );
}

// Delete job
export function deleteJob(id: string): void {
  db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
}
