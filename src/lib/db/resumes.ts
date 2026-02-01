import db from "./schema";
import { generateId } from "@/lib/utils";

export interface GeneratedResume {
  id: string;
  jobId: string;
  profileId: string;
  templateId: string;
  contentJson: string;
  htmlPath: string;
  matchScore?: number;
  createdAt: string;
}

// Create a new generated resume record
export function saveGeneratedResume(
  jobId: string,
  templateId: string,
  content: unknown,
  htmlPath: string,
  matchScore?: number
): GeneratedResume {
  const id = generateId();
  const now = new Date().toISOString();
  const contentJson = JSON.stringify(content);

  const stmt = db.prepare(`
    INSERT INTO generated_resumes (id, job_id, profile_id, content_json, pdf_path, match_score, created_at)
    VALUES (?, ?, 'default', ?, ?, ?, ?)
  `);

  stmt.run(id, jobId, contentJson, htmlPath, matchScore || null, now);

  return {
    id,
    jobId,
    profileId: "default",
    templateId,
    contentJson,
    htmlPath,
    matchScore,
    createdAt: now,
  };
}

// Get all generated resumes for a job
export function getGeneratedResumes(jobId: string): GeneratedResume[] {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    WHERE job_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(jobId) as Array<{
    id: string;
    job_id: string;
    profile_id: string;
    content_json: string;
    pdf_path: string;
    match_score: number | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    templateId: "", // Not stored in current schema
    contentJson: row.content_json,
    htmlPath: row.pdf_path,
    matchScore: row.match_score || undefined,
    createdAt: row.created_at,
  }));
}

// Get a specific generated resume
export function getGeneratedResume(id: string): GeneratedResume | null {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    WHERE id = ?
  `);

  const row = stmt.get(id) as {
    id: string;
    job_id: string;
    profile_id: string;
    content_json: string;
    pdf_path: string;
    match_score: number | null;
    created_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    templateId: "",
    contentJson: row.content_json,
    htmlPath: row.pdf_path,
    matchScore: row.match_score || undefined,
    createdAt: row.created_at,
  };
}

// Delete a generated resume
export function deleteGeneratedResume(id: string): void {
  const stmt = db.prepare("DELETE FROM generated_resumes WHERE id = ?");
  stmt.run(id);
}

// Get all generated resumes (for dashboard stats)
export function getAllGeneratedResumes(): GeneratedResume[] {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    ORDER BY created_at DESC
  `);

  const rows = stmt.all() as Array<{
    id: string;
    job_id: string;
    profile_id: string;
    content_json: string;
    pdf_path: string;
    match_score: number | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    templateId: "",
    contentJson: row.content_json,
    htmlPath: row.pdf_path,
    matchScore: row.match_score || undefined,
    createdAt: row.created_at,
  }));
}

// Get count of generated resumes
export function getGeneratedResumeCount(): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM generated_resumes");
  const row = stmt.get() as { count: number };
  return row.count;
}
