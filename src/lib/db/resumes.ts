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
  matchScore?: number,
  userId: string = "default"
): GeneratedResume {
  const id = generateId();
  const now = new Date().toISOString();
  const contentJson = JSON.stringify(content);

  const stmt = db.prepare(`
    INSERT INTO generated_resumes (id, user_id, job_id, profile_id, content_json, pdf_path, match_score, created_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM jobs WHERE id = ? AND user_id = ?)
  `);

  const result = stmt.run(
    id,
    userId,
    jobId,
    userId,
    contentJson,
    htmlPath,
    matchScore || null,
    now,
    jobId,
    userId
  ) as { changes?: number } | undefined;

  if (result?.changes === 0) {
    throw new Error("Job not found");
  }

  return {
    id,
    jobId,
    profileId: userId,
    templateId,
    contentJson,
    htmlPath,
    matchScore,
    createdAt: now,
  };
}

// Get all generated resumes for a job
export function getGeneratedResumes(jobId: string, userId: string = "default"): GeneratedResume[] {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    WHERE job_id = ? AND user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(jobId, userId) as Array<{
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
export function getGeneratedResume(id: string, userId: string = "default"): GeneratedResume | null {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    WHERE id = ? AND user_id = ?
  `);

  const row = stmt.get(id, userId) as {
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
export function deleteGeneratedResume(id: string, userId: string = "default"): void {
  const stmt = db.prepare("DELETE FROM generated_resumes WHERE id = ? AND user_id = ?");
  stmt.run(id, userId);
}

// Get all generated resumes (for dashboard stats)
export function getAllGeneratedResumes(userId: string = "default"): GeneratedResume[] {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, content_json, pdf_path, match_score, created_at
    FROM generated_resumes
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(userId) as Array<{
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
export function getGeneratedResumeCount(userId: string = "default"): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM generated_resumes WHERE user_id = ?");
  const row = stmt.get(userId) as { count: number };
  return row.count;
}
