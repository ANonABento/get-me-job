import db from "./schema";
import { generateId } from "@/lib/utils";
import type { ABOutcome, ABTrackingEntry } from "@/lib/resume/compare";

// Log which resume version was sent to which job
export function trackResumeSent(
  resumeId: string,
  jobId: string,
  userId: string = "default",
  notes?: string
): ABTrackingEntry {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO resume_ab_tracking (id, resume_id, job_id, user_id, outcome, sent_at, updated_at, notes)
    VALUES (?, ?, ?, ?, 'applied', ?, ?, ?)
  `);

  stmt.run(id, resumeId, jobId, userId, now, now, notes || null);

  return {
    id,
    resumeId,
    jobId,
    outcome: "applied",
    sentAt: now,
    updatedAt: now,
    notes,
  };
}

// Update the outcome for a tracking entry
export function updateTrackingOutcome(
  id: string,
  outcome: ABOutcome,
  userId: string = "default"
): boolean {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE resume_ab_tracking
    SET outcome = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(outcome, now, id, userId);
  return result.changes > 0;
}

// Get all tracking entries for a user
export function getTrackingEntries(userId: string = "default"): ABTrackingEntry[] {
  const stmt = db.prepare(`
    SELECT id, resume_id, job_id, outcome, sent_at, updated_at, notes
    FROM resume_ab_tracking
    WHERE user_id = ?
    ORDER BY sent_at DESC
  `);

  const rows = stmt.all(userId) as Array<{
    id: string;
    resume_id: string;
    job_id: string;
    outcome: ABOutcome;
    sent_at: string;
    updated_at: string;
    notes: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    resumeId: row.resume_id,
    jobId: row.job_id,
    outcome: row.outcome,
    sentAt: row.sent_at,
    updatedAt: row.updated_at,
    notes: row.notes || undefined,
  }));
}

// Get tracking entries for a specific resume
export function getTrackingEntriesByResume(
  resumeId: string,
  userId: string = "default"
): ABTrackingEntry[] {
  const stmt = db.prepare(`
    SELECT id, resume_id, job_id, outcome, sent_at, updated_at, notes
    FROM resume_ab_tracking
    WHERE resume_id = ? AND user_id = ?
    ORDER BY sent_at DESC
  `);

  const rows = stmt.all(resumeId, userId) as Array<{
    id: string;
    resume_id: string;
    job_id: string;
    outcome: ABOutcome;
    sent_at: string;
    updated_at: string;
    notes: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    resumeId: row.resume_id,
    jobId: row.job_id,
    outcome: row.outcome,
    sentAt: row.sent_at,
    updatedAt: row.updated_at,
    notes: row.notes || undefined,
  }));
}

// Get distinct resume IDs that have been tracked
export function getTrackedResumeIds(userId: string = "default"): string[] {
  const stmt = db.prepare(`
    SELECT DISTINCT resume_id
    FROM resume_ab_tracking
    WHERE user_id = ?
  `);

  const rows = stmt.all(userId) as Array<{ resume_id: string }>;
  return rows.map((row) => row.resume_id);
}

// Delete a tracking entry
export function deleteTrackingEntry(
  id: string,
  userId: string = "default"
): boolean {
  const stmt = db.prepare(
    "DELETE FROM resume_ab_tracking WHERE id = ? AND user_id = ?"
  );
  const result = stmt.run(id, userId);
  return result.changes > 0;
}
