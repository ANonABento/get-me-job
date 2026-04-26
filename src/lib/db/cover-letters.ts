import { nanoid } from "nanoid";
import db from "./schema";

export interface CoverLetter {
  id: string;
  jobId: string;
  profileId: string;
  content: string;
  highlights: string[];
  version: number;
  createdAt: string;
}

interface CoverLetterRow {
  id: string;
  job_id: string;
  profile_id: string;
  content: string;
  highlights_json: string | null;
  version: number;
  created_at: string;
}

function rowToCoverLetter(row: CoverLetterRow): CoverLetter {
  return {
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    content: row.content,
    highlights: row.highlights_json ? JSON.parse(row.highlights_json) : [],
    version: row.version,
    createdAt: row.created_at,
  };
}

export function saveCoverLetter(
  jobId: string,
  content: string,
  highlights: string[] = [],
  userId: string = "default"
): CoverLetter {
  const id = nanoid();

  // Get next version number for this job
  const existing = db
    .prepare(
      "SELECT MAX(version) as max_version FROM cover_letters WHERE job_id = ? AND user_id = ?"
    )
    .get(jobId, userId) as { max_version: number | null } | undefined;

  const version = (existing?.max_version || 0) + 1;

  const result = db.prepare(
    `INSERT INTO cover_letters (id, user_id, job_id, profile_id, content, highlights_json, version)
     SELECT ?, ?, ?, ?, ?, ?, ?
     WHERE EXISTS (SELECT 1 FROM jobs WHERE id = ? AND user_id = ?)`
  ).run(id, userId, jobId, userId, content, JSON.stringify(highlights), version, jobId, userId) as
    | { changes?: number }
    | undefined;

  if (result?.changes === 0) {
    throw new Error("Job not found");
  }

  return {
    id,
    jobId,
    profileId: userId,
    content,
    highlights,
    version,
    createdAt: new Date().toISOString(),
  };
}

export function getCoverLettersByJob(
  jobId: string,
  userId: string = "default"
): CoverLetter[] {
  const rows = db
    .prepare(
      "SELECT * FROM cover_letters WHERE job_id = ? AND user_id = ? ORDER BY version DESC"
    )
    .all(jobId, userId) as CoverLetterRow[];

  return rows.map(rowToCoverLetter);
}

export function getLatestCoverLetter(
  jobId: string,
  userId: string = "default"
): CoverLetter | null {
  const row = db
    .prepare(
      "SELECT * FROM cover_letters WHERE job_id = ? AND user_id = ? ORDER BY version DESC LIMIT 1"
    )
    .get(jobId, userId) as CoverLetterRow | undefined;

  return row ? rowToCoverLetter(row) : null;
}

export function getCoverLetter(
  id: string,
  userId: string = "default"
): CoverLetter | null {
  const row = db
    .prepare("SELECT * FROM cover_letters WHERE id = ? AND user_id = ?")
    .get(id, userId) as CoverLetterRow | undefined;

  return row ? rowToCoverLetter(row) : null;
}

export function deleteCoverLetter(
  id: string,
  userId: string = "default"
): boolean {
  const result = db
    .prepare("DELETE FROM cover_letters WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}

export function getCoverLetterCount(
  jobId: string,
  userId: string = "default"
): number {
  const result = db
    .prepare("SELECT COUNT(*) as count FROM cover_letters WHERE job_id = ? AND user_id = ?")
    .get(jobId, userId) as { count: number };
  return result.count;
}

export function getAllCoverLetters(
  userId: string = "default"
): CoverLetter[] {
  const rows = db
    .prepare(
      "SELECT * FROM cover_letters WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as CoverLetterRow[];

  return rows.map(rowToCoverLetter);
}
