import { getJob, getJobs, updateJob } from "@/lib/db/jobs";
import type { JobDescription, Opportunity, OpportunityStatus } from "@/types";

export interface OpportunityLinkInput {
  resumeId?: string;
  coverLetterId?: string;
}

function normalizeStatus(status?: string): OpportunityStatus {
  if (status === "offered") return "offer";
  return (status || "saved") as OpportunityStatus;
}

export function jobToOpportunity(job: JobDescription): Opportunity {
  return {
    id: job.id,
    type: "job",
    title: job.title,
    company: job.company,
    source: "manual",
    sourceUrl: job.url,
    summary: job.description,
    status: normalizeStatus(job.status),
    deadline: job.deadline,
    tags: job.keywords,
    notes: job.notes,
    linkedResumeId: job.linkedResumeId,
    linkedCoverLetterId: job.linkedCoverLetterId,
    createdAt: job.createdAt,
    updatedAt: job.createdAt,
  };
}

export function getOpportunityDescription(opportunity: Opportunity): string {
  return opportunity.summary.trim();
}

export function listOpportunities(
  userId = "default",
  statuses?: string[],
): Opportunity[] {
  const allowedStatuses = new Set(statuses?.filter(Boolean));
  return getJobs(userId)
    .map(jobToOpportunity)
    .filter(
      (opportunity) =>
        allowedStatuses.size === 0 || allowedStatuses.has(opportunity.status),
    );
}

export function getOpportunity(
  id: string,
  userId = "default",
): Opportunity | null {
  const job = getJob(id, userId);
  return job ? jobToOpportunity(job) : null;
}

export function linkOpportunityDocument(
  id: string,
  input: OpportunityLinkInput,
  userId = "default",
): Opportunity | null {
  const existing = getJob(id, userId);
  if (!existing) return null;

  const resumeId = input.resumeId?.trim();
  const coverLetterId = input.coverLetterId?.trim();

  updateJob(
    id,
    {
      linkedResumeId: resumeId || existing.linkedResumeId,
      linkedCoverLetterId:
        coverLetterId || existing.linkedCoverLetterId,
    },
    userId,
  );

  return getOpportunity(id, userId);
}
