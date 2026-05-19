import {
  getJob,
  getJobs,
  listJobsPaginated,
  updateJob,
  updateJobStatus,
  type CreatedAtCursor,
} from "@/lib/db/jobs";
import { buildPaginationResult } from "@/lib/pagination";
import { OPPORTUNITY_STATUSES } from "@slothing/shared/schemas";
import type { JobDescription, Opportunity, OpportunityStatus } from "@/types";

export interface OpportunityLinkInput {
  resumeId?: string;
  coverLetterId?: string;
}

// F2.1 consolidation: previously this file maintained an
// `OPPORTUNITY_STATUS ↔ JOB_STATUS` translation table because the legacy
// `JobDescription.status` union used `offered` / `withdrawn`. The shared
// `JobStatus` type now aliases `OpportunityStatus`, so storage and UI agree on
// the same vocabulary and no translation is required at the application layer.
// Legacy DB rows are rewritten by the `0013_jobs_status_canonical.sql`
// migration (`offered → offer`, `withdrawn → dismissed`).

const OPPORTUNITY_STATUS_VALUES = new Set<OpportunityStatus>(
  OPPORTUNITY_STATUSES,
);

function normalizeStatus(status: JobDescription["status"]): OpportunityStatus {
  return status && OPPORTUNITY_STATUS_VALUES.has(status) ? status : "saved";
}

function normalizeStatusFilter(status: string): OpportunityStatus | null {
  // Accept the legacy values one last time so any in-flight URL/query params
  // from cached clients still resolve to a valid canonical status.
  const trimmedStatus = status.trim();
  const normalized =
    trimmedStatus === "offered"
      ? "offer"
      : trimmedStatus === "withdrawn"
        ? "dismissed"
        : trimmedStatus;
  return OPPORTUNITY_STATUS_VALUES.has(normalized as OpportunityStatus)
    ? (normalized as OpportunityStatus)
    : null;
}

export function jobToOpportunity(job: JobDescription): Opportunity {
  const [city, province, ...countryParts] = (job.location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const salaryRange = parseSalaryRange(job.salary);

  return {
    id: job.id,
    type: "job",
    title: job.title,
    company: job.company,
    // `source` is the OpportunitySource enum ("waterloo_works", "manual",
    // …). Jobs imported by the extension store the scraper key in
    // `job.source`; fall back to manual for legacy rows.
    source: opportunitySourceFor(job.source),
    sourceUrl: job.url,
    sourceId: job.sourceJobId,
    city,
    province,
    country: countryParts.join(", ") || undefined,
    remoteType: job.remote ? "remote" : undefined,
    jobType: job.type === "internship" ? "internship" : job.type,
    level: opportunityLevelFor(job.level),
    openings: job.openings,
    applicants: job.applicants,
    workTerm: job.workTerm,
    summary: job.description.trim(),
    responsibilities: job.responsibilities,
    requiredSkills: job.requirements,
    salaryMin: salaryRange.salaryMin,
    salaryMax: salaryRange.salaryMax,
    inferredPayUnit: job.inferredPayUnit,
    inferredPayMin: job.inferredPayMin,
    inferredPayMax: job.inferredPayMax,
    inferredPayCurrency: job.inferredPayCurrency,
    status: normalizeStatus(job.status),
    appliedAt: job.appliedAt,
    deadline: job.deadline,
    tags: job.keywords,
    notes: job.notes,
    linkedResumeId: job.linkedResumeId,
    linkedCoverLetterId: job.linkedCoverLetterId,
    createdAt: job.createdAt,
    updatedAt: job.createdAt,
  };
}

// Mirror of OPPORTUNITY_SOURCES in @slothing/shared/schemas. Kept inline
// because zod's enum throws on unknown values, and we want a graceful
// fallback to "manual" for legacy / unknown scraper keys.
const KNOWN_SOURCES = new Set([
  "waterlooworks",
  "linkedin",
  "indeed",
  "greenhouse",
  "lever",
  "devpost",
  "manual",
  "url",
]);

function opportunitySourceFor(
  source: string | undefined,
): Opportunity["source"] {
  if (source && KNOWN_SOURCES.has(source)) {
    return source as Opportunity["source"];
  }
  return "manual";
}

// Highest-tier first so a "Junior, Intermediate, Senior" WW field becomes
// "senior" (max applicable level). OPPORTUNITY_LEVELS doesn't have
// "intern" or "mid" — co-op interns map to "junior", mid maps to
// "intermediate".
const LEVEL_PATTERNS: Array<[RegExp, Opportunity["level"]]> = [
  [/\bprincipal\b/i, "principal"],
  [/\bstaff\b/i, "staff"],
  [/\bsenior\b/i, "senior"],
  [/\blead\b/i, "lead"],
  [/\bintermediate\b|\bmid\b/i, "intermediate"],
  [/\bjunior\b|\bentry\b|\bintern\b/i, "junior"],
];

function opportunityLevelFor(
  raw: string | undefined,
): Opportunity["level"] | undefined {
  if (!raw) return undefined;
  // WaterlooWorks reports level as a free-text list like "Junior,
  // Intermediate" — find the highest-tier match present.
  for (const [pattern, level] of LEVEL_PATTERNS) {
    if (pattern.test(raw)) return level;
  }
  return undefined;
}

function parseSalaryRange(salary?: string): {
  salaryMin?: number;
  salaryMax?: number;
} {
  if (!salary) return {};

  const values = salary
    .match(/\d[\d,]*(?:\.\d+)?/g)
    ?.map((value) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));

  if (!values?.length) return {};

  return {
    salaryMin: values[0],
    salaryMax: values[1],
  };
}

export interface ListOpportunitiesParams {
  userId: string;
  statuses?: string[];
  cursor?: CreatedAtCursor | null;
  limit: number;
}

export function listOpportunities({
  userId,
  statuses,
  cursor,
  limit,
}: ListOpportunitiesParams) {
  const requestedStatuses = statuses?.filter(Boolean) ?? [];
  const allowedStatuses = requestedStatuses
    .map(normalizeStatusFilter)
    .filter((status): status is OpportunityStatus => status !== null);

  if (requestedStatuses.length > 0 && allowedStatuses.length === 0) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const jobs = listJobsPaginated({
    userId,
    statuses: requestedStatuses.length > 0 ? allowedStatuses : undefined,
    cursor,
    limit,
  });

  return buildPaginationResult(
    jobs.map(jobToOpportunity),
    limit,
    (opportunity) => ({
      lastId: opportunity.id,
      lastCreatedAt: opportunity.createdAt,
    }),
  );
}

export function listAllOpportunities(
  userId: string,
  statuses?: string[],
): Opportunity[] {
  const requestedStatuses = statuses?.filter(Boolean) ?? [];
  const allowedStatuses = new Set(
    requestedStatuses
      .map(normalizeStatusFilter)
      .filter((status) => status !== null),
  );
  const shouldFilter = requestedStatuses.length > 0;

  return getJobs(userId)
    .map(jobToOpportunity)
    .filter(
      (opportunity) => !shouldFilter || allowedStatuses.has(opportunity.status),
    );
}

export function getOpportunity(id: string, userId: string): Opportunity | null {
  const job = getJob(id, userId);
  return job ? jobToOpportunity(job) : null;
}

export function linkOpportunityDocument(
  id: string,
  input: OpportunityLinkInput,
  userId: string,
): Opportunity | null {
  const existing = getJob(id, userId);
  if (!existing) return null;

  const resumeId = input.resumeId?.trim();
  const coverLetterId = input.coverLetterId?.trim();

  updateJob(
    id,
    {
      linkedResumeId: resumeId || existing.linkedResumeId,
      linkedCoverLetterId: coverLetterId || existing.linkedCoverLetterId,
    },
    userId,
  );

  return getOpportunity(id, userId);
}

export function changeOpportunityStatus(
  id: string,
  status: string,
  userId: string,
): Opportunity | null {
  const existing = getJob(id, userId);
  if (!existing) return null;

  const opportunityStatus = normalizeStatusFilter(status);
  if (!opportunityStatus) return null;

  updateJobStatus(id, opportunityStatus, undefined, userId);
  return getOpportunity(id, userId);
}

/**
 * Identity passthrough kept for backwards compatibility — the storage layer
 * and the canonical UI vocabulary now share the same `OpportunityStatus`
 * union, so callers don't need a translation step. Prefer using the status
 * value directly; this helper exists only to avoid churning a few call-sites.
 */
export function getJobStatusForOpportunityStatus(
  status: OpportunityStatus,
): NonNullable<JobDescription["status"]> {
  return status;
}
