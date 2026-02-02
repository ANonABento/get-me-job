import db from "./schema";
import { generateId } from "@/lib/utils";

export interface AnalyticsSnapshot {
  id: string;
  userId: string;
  snapshotDate: string;
  totalJobs: number;
  jobsSaved: number;
  jobsApplied: number;
  jobsInterviewing: number;
  jobsOffered: number;
  jobsRejected: number;
  totalInterviews: number;
  interviewsCompleted: number;
  totalDocuments: number;
  totalResumes: number;
  profileCompleteness: number;
  createdAt: string;
}

export interface JobStatusChange {
  id: string;
  jobId: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
  notes?: string;
}

// Save today's analytics snapshot
export function saveAnalyticsSnapshot(
  data: Omit<AnalyticsSnapshot, "id" | "createdAt">,
  userId: string = "default"
): AnalyticsSnapshot {
  const id = generateId();
  const now = new Date().toISOString();

  // Use INSERT OR REPLACE to update if snapshot for today exists
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO analytics_snapshots (
      id, user_id, snapshot_date, total_jobs, jobs_saved, jobs_applied,
      jobs_interviewing, jobs_offered, jobs_rejected, total_interviews,
      interviews_completed, total_documents, total_resumes, profile_completeness, created_at
    )
    VALUES (
      COALESCE(
        (SELECT id FROM analytics_snapshots WHERE user_id = ? AND snapshot_date = ?),
        ?
      ),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    userId,
    data.snapshotDate,
    id,
    userId,
    data.snapshotDate,
    data.totalJobs,
    data.jobsSaved,
    data.jobsApplied,
    data.jobsInterviewing,
    data.jobsOffered,
    data.jobsRejected,
    data.totalInterviews,
    data.interviewsCompleted,
    data.totalDocuments,
    data.totalResumes,
    data.profileCompleteness,
    now
  );

  return {
    id,
    userId,
    snapshotDate: data.snapshotDate,
    totalJobs: data.totalJobs,
    jobsSaved: data.jobsSaved,
    jobsApplied: data.jobsApplied,
    jobsInterviewing: data.jobsInterviewing,
    jobsOffered: data.jobsOffered,
    jobsRejected: data.jobsRejected,
    totalInterviews: data.totalInterviews,
    interviewsCompleted: data.interviewsCompleted,
    totalDocuments: data.totalDocuments,
    totalResumes: data.totalResumes,
    profileCompleteness: data.profileCompleteness,
    createdAt: now,
  };
}

// Get analytics snapshots for a date range
export function getAnalyticsSnapshots(
  startDate: string,
  endDate: string,
  userId: string = "default"
): AnalyticsSnapshot[] {
  const stmt = db.prepare(`
    SELECT id, user_id, snapshot_date, total_jobs, jobs_saved, jobs_applied,
           jobs_interviewing, jobs_offered, jobs_rejected, total_interviews,
           interviews_completed, total_documents, total_resumes, profile_completeness, created_at
    FROM analytics_snapshots
    WHERE user_id = ? AND snapshot_date >= ? AND snapshot_date <= ?
    ORDER BY snapshot_date ASC
  `);

  const rows = stmt.all(userId, startDate, endDate) as Array<{
    id: string;
    user_id: string;
    snapshot_date: string;
    total_jobs: number;
    jobs_saved: number;
    jobs_applied: number;
    jobs_interviewing: number;
    jobs_offered: number;
    jobs_rejected: number;
    total_interviews: number;
    interviews_completed: number;
    total_documents: number;
    total_resumes: number;
    profile_completeness: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    snapshotDate: row.snapshot_date,
    totalJobs: row.total_jobs,
    jobsSaved: row.jobs_saved,
    jobsApplied: row.jobs_applied,
    jobsInterviewing: row.jobs_interviewing,
    jobsOffered: row.jobs_offered,
    jobsRejected: row.jobs_rejected,
    totalInterviews: row.total_interviews,
    interviewsCompleted: row.interviews_completed,
    totalDocuments: row.total_documents,
    totalResumes: row.total_resumes,
    profileCompleteness: row.profile_completeness,
    createdAt: row.created_at,
  }));
}

// Get the most recent snapshot
export function getLatestSnapshot(userId: string = "default"): AnalyticsSnapshot | null {
  const stmt = db.prepare(`
    SELECT id, user_id, snapshot_date, total_jobs, jobs_saved, jobs_applied,
           jobs_interviewing, jobs_offered, jobs_rejected, total_interviews,
           interviews_completed, total_documents, total_resumes, profile_completeness, created_at
    FROM analytics_snapshots
    WHERE user_id = ?
    ORDER BY snapshot_date DESC
    LIMIT 1
  `);

  const row = stmt.get(userId) as {
    id: string;
    user_id: string;
    snapshot_date: string;
    total_jobs: number;
    jobs_saved: number;
    jobs_applied: number;
    jobs_interviewing: number;
    jobs_offered: number;
    jobs_rejected: number;
    total_interviews: number;
    interviews_completed: number;
    total_documents: number;
    total_resumes: number;
    profile_completeness: number;
    created_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    snapshotDate: row.snapshot_date,
    totalJobs: row.total_jobs,
    jobsSaved: row.jobs_saved,
    jobsApplied: row.jobs_applied,
    jobsInterviewing: row.jobs_interviewing,
    jobsOffered: row.jobs_offered,
    jobsRejected: row.jobs_rejected,
    totalInterviews: row.total_interviews,
    interviewsCompleted: row.interviews_completed,
    totalDocuments: row.total_documents,
    totalResumes: row.total_resumes,
    profileCompleteness: row.profile_completeness,
    createdAt: row.created_at,
  };
}

// Record a job status change
export function recordJobStatusChange(
  jobId: string,
  fromStatus: string | null,
  toStatus: string,
  notes?: string
): JobStatusChange {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO job_status_history (id, job_id, from_status, to_status, changed_at, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, jobId, fromStatus, toStatus, now, notes || null);

  return {
    id,
    jobId,
    fromStatus,
    toStatus,
    changedAt: now,
    notes,
  };
}

// Get status history for a job
export function getJobStatusHistory(jobId: string): JobStatusChange[] {
  const stmt = db.prepare(`
    SELECT id, job_id, from_status, to_status, changed_at, notes
    FROM job_status_history
    WHERE job_id = ?
    ORDER BY changed_at ASC
  `);

  const rows = stmt.all(jobId) as Array<{
    id: string;
    job_id: string;
    from_status: string | null;
    to_status: string;
    changed_at: string;
    notes: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedAt: row.changed_at,
    notes: row.notes || undefined,
  }));
}

// Calculate week-over-week changes
export function getWeekOverWeekChange(userId: string = "default"): {
  jobsChange: number;
  appliedChange: number;
  interviewsChange: number;
} | null {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const todayStr = today.toISOString().split("T")[0];
  const lastWeekStr = lastWeek.toISOString().split("T")[0];

  const stmt = db.prepare(`
    SELECT snapshot_date, total_jobs, jobs_applied, total_interviews
    FROM analytics_snapshots
    WHERE user_id = ? AND snapshot_date IN (?, ?)
    ORDER BY snapshot_date DESC
  `);

  const rows = stmt.all(userId, todayStr, lastWeekStr) as Array<{
    snapshot_date: string;
    total_jobs: number;
    jobs_applied: number;
    total_interviews: number;
  }>;

  if (rows.length < 2) return null;

  const current = rows.find((r) => r.snapshot_date === todayStr) || rows[0];
  const previous = rows.find((r) => r.snapshot_date === lastWeekStr) || rows[1];

  return {
    jobsChange: current.total_jobs - previous.total_jobs,
    appliedChange: current.jobs_applied - previous.jobs_applied,
    interviewsChange: current.total_interviews - previous.total_interviews,
  };
}

// Get time spent in each status for jobs (average)
export function getAverageTimeInStatus(userId: string = "default"): Record<string, number> {
  // Get all status changes
  const stmt = db.prepare(`
    SELECT jsh.job_id, jsh.from_status, jsh.to_status, jsh.changed_at
    FROM job_status_history jsh
    INNER JOIN jobs j ON j.id = jsh.job_id
    WHERE j.user_id = ?
    ORDER BY jsh.job_id, jsh.changed_at ASC
  `);

  const rows = stmt.all(userId) as Array<{
    job_id: string;
    from_status: string | null;
    to_status: string;
    changed_at: string;
  }>;

  // Group by job and calculate time in each status
  const statusDurations: Record<string, number[]> = {};
  let currentJobId = "";
  let lastChange: { status: string; time: Date } | null = null;

  for (const row of rows) {
    if (row.job_id !== currentJobId) {
      currentJobId = row.job_id;
      lastChange = null;
    }

    if (lastChange) {
      const duration = new Date(row.changed_at).getTime() - lastChange.time.getTime();
      const daysInStatus = duration / (1000 * 60 * 60 * 24);

      if (!statusDurations[lastChange.status]) {
        statusDurations[lastChange.status] = [];
      }
      statusDurations[lastChange.status].push(daysInStatus);
    }

    lastChange = {
      status: row.to_status,
      time: new Date(row.changed_at),
    };
  }

  // Calculate averages
  const averages: Record<string, number> = {};
  for (const [status, durations] of Object.entries(statusDurations)) {
    if (durations.length > 0) {
      averages[status] = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    }
  }

  return averages;
}
