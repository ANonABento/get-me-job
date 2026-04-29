import { db, jobs, eq, and, desc } from '../index';
import { generateId } from '@/lib/utils';
import { JOB_STATUSES, JOB_TYPES } from '@/lib/constants/jobs';
import type { JobDescription, JobStatus, JobType } from '@/types';

function isJobType(value: string | null): value is JobType {
  return JOB_TYPES.includes(value as JobType);
}

function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus);
}

// Map database row to JobDescription type
function mapRowToJob(row: typeof jobs.$inferSelect): JobDescription {
  const jobStatus = row.status ?? 'saved';

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location ?? undefined,
    type: isJobType(row.type) ? row.type : undefined,
    remote: row.remote ?? false,
    salary: row.salary ?? undefined,
    description: row.description,
    requirements: row.requirementsJson ? JSON.parse(row.requirementsJson) : [],
    responsibilities: row.responsibilitiesJson ? JSON.parse(row.responsibilitiesJson) : [],
    keywords: row.keywordsJson ? JSON.parse(row.keywordsJson) : [],
    url: row.url ?? undefined,
    status: isJobStatus(jobStatus) ? jobStatus : 'saved',
    appliedAt: row.appliedAt ?? undefined,
    deadline: row.deadline ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// Get all jobs for a user
export async function getJobs(userId: string): Promise<JobDescription[]> {
  const rows = await db.select().from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt));

  return rows.map(mapRowToJob);
}

// Get single job for a user
export async function getJob(userId: string, jobId: string): Promise<JobDescription | null> {
  const rows = await db.select().from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (rows.length === 0) return null;
  return mapRowToJob(rows[0]);
}

// Create job for a user
export async function createJob(
  userId: string,
  job: Omit<JobDescription, 'id' | 'createdAt'>
): Promise<JobDescription> {
  const id = generateId();

  await db.insert(jobs).values({
    id,
    userId,
    title: job.title,
    company: job.company,
    location: job.location ?? null,
    type: job.type ?? null,
    remote: job.remote ?? false,
    salary: job.salary ?? null,
    description: job.description,
    requirementsJson: JSON.stringify(job.requirements ?? []),
    responsibilitiesJson: JSON.stringify(job.responsibilities ?? []),
    keywordsJson: JSON.stringify(job.keywords ?? []),
    url: job.url ?? null,
    status: job.status ?? 'saved',
    appliedAt: job.appliedAt ?? null,
    deadline: job.deadline ?? null,
    notes: job.notes ?? null,
  });

  const created = await getJob(userId, id);
  return created!;
}

// Update job for a user
export async function updateJob(
  userId: string,
  jobId: string,
  updates: Partial<JobDescription>
): Promise<JobDescription | null> {
  const existing = await getJob(userId, jobId);
  if (!existing) return null;

  const merged = { ...existing, ...updates };

  await db.update(jobs)
    .set({
      title: merged.title,
      company: merged.company,
      location: merged.location ?? null,
      type: merged.type ?? null,
      remote: merged.remote ?? false,
      salary: merged.salary ?? null,
      description: merged.description,
      requirementsJson: JSON.stringify(merged.requirements ?? []),
      responsibilitiesJson: JSON.stringify(merged.responsibilities ?? []),
      keywordsJson: JSON.stringify(merged.keywords ?? []),
      url: merged.url ?? null,
      status: merged.status ?? 'saved',
      appliedAt: merged.appliedAt ?? null,
      deadline: merged.deadline ?? null,
      notes: merged.notes ?? null,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  return getJob(userId, jobId);
}

// Update job status for a user
export async function updateJobStatus(
  userId: string,
  jobId: string,
  status: JobStatus,
  appliedAt?: string
): Promise<JobDescription | null> {
  const now = new Date().toISOString();
  const appliedValue = status === 'applied' && !appliedAt ? now : appliedAt ?? null;

  await db.update(jobs)
    .set({
      status,
      appliedAt: appliedValue,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  return getJob(userId, jobId);
}

// Delete job for a user
export async function deleteJob(userId: string, jobId: string): Promise<void> {
  await db.delete(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
}

// Get jobs by status for a user
export async function getJobsByStatus(userId: string, status: JobStatus): Promise<JobDescription[]> {
  const rows = await db.select().from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, status)))
    .orderBy(desc(jobs.createdAt));

  return rows.map(mapRowToJob);
}

// Count jobs by status for a user
export async function countJobsByStatus(userId: string): Promise<Record<string, number>> {
  const rows = await db.select().from(jobs)
    .where(eq(jobs.userId, userId));

  const counts = Object.fromEntries(
    JOB_STATUSES.map((status) => [status, 0])
  ) as Record<JobStatus, number>;

  for (const row of rows) {
    const status = row.status ?? 'saved';
    const countStatus = isJobStatus(status) ? status : 'saved';
    counts[countStatus] += 1;
  }

  return counts;
}
