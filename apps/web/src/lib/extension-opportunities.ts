import { z } from "zod";
import { jobTypeSchema } from "@/lib/constants";
import { nowIso } from "@/lib/format/time";
import type { JobDescription } from "@/types";

const optionalString = z.string().trim().max(500).optional();
const optionalStringArray = z
  .array(z.string().trim().max(1000))
  .max(100)
  .optional()
  .default([])
  .transform((items) => items.filter(Boolean));
const optionalUrl = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().url("Invalid URL").optional().or(z.literal("")),
  )
  .transform((value) => value || undefined);

export const extensionOpportunitySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  location: optionalString,
  description: z.string().trim().max(50000).optional().default(""),
  requirements: optionalStringArray,
  responsibilities: optionalStringArray,
  keywords: optionalStringArray,
  type: jobTypeSchema.optional(),
  remote: z.boolean().optional(),
  salary: optionalString,
  url: optionalUrl,
  deadline: optionalString,
  source: optionalString,
  sourceJobId: optionalString,
  postedAt: optionalString,
  status: z.enum(["pending", "applied"]).optional().default("pending"),
  appliedAt: z.string().datetime().optional(),
  notes: z.string().trim().max(5000).optional(),
  // Posting-level metadata surfaced by the WaterlooWorks scraper. All
  // optional — other sources won't populate these.
  openings: z.number().int().positive().optional(),
  applicants: z.number().int().nonnegative().optional(),
  level: optionalString,
  workTerm: optionalString,
});

export type ExtensionOpportunityInput = z.infer<
  typeof extensionOpportunitySchema
>;
type BuildableExtensionOpportunity = Omit<
  ExtensionOpportunityInput,
  "status" | "url"
> & {
  status?: ExtensionOpportunityInput["status"];
  url?: ExtensionOpportunityInput["url"];
};

export type ExtensionOpportunityParseResult =
  | { success: true; opportunities: ExtensionOpportunityInput[] }
  | { success: false; errors: Array<{ field: string; message: string }> };

const extensionJobsPayloadSchema = z.object({
  jobs: z
    .array(extensionOpportunitySchema)
    .min(1, "At least one job is required"),
});

const extensionOpportunitiesPayloadSchema = z.object({
  opportunities: z
    .array(extensionOpportunitySchema)
    .min(1, "At least one opportunity is required"),
});

export function parseExtensionOpportunityPayload(
  rawData: unknown,
): ExtensionOpportunityParseResult {
  const schema = getPayloadSchema(rawData);
  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  if ("jobs" in parsed.data) {
    return { success: true, opportunities: parsed.data.jobs };
  }

  if ("opportunities" in parsed.data) {
    return { success: true, opportunities: parsed.data.opportunities };
  }

  return { success: true, opportunities: [parsed.data] };
}

function getPayloadSchema(rawData: unknown) {
  if (rawData && typeof rawData === "object" && "jobs" in rawData) {
    return extensionJobsPayloadSchema;
  }

  if (rawData && typeof rawData === "object" && "opportunities" in rawData) {
    return extensionOpportunitiesPayloadSchema;
  }

  return extensionOpportunitySchema;
}

export function buildJobFromExtension(
  opportunity: BuildableExtensionOpportunity,
): Omit<JobDescription, "id" | "createdAt"> {
  const status = opportunity.status || "pending";

  return {
    title: opportunity.title,
    company: opportunity.company,
    location: opportunity.location,
    description:
      opportunity.description || "No description provided by the extension.",
    requirements: opportunity.requirements,
    responsibilities: opportunity.responsibilities,
    keywords: opportunity.keywords,
    type: opportunity.type,
    remote: opportunity.remote,
    salary: opportunity.salary,
    url: opportunity.url || undefined,
    status,
    appliedAt:
      status === "applied" ? opportunity.appliedAt || nowIso() : undefined,
    deadline: opportunity.deadline,
    notes: buildExtensionNotes(opportunity),
    // Pass extension-imported metadata into structured columns instead of
    // dumping it into `notes`. Old rows still have it in notes for legacy
    // reasons; new rows go straight into the typed columns.
    source: opportunity.source,
    sourceJobId: opportunity.sourceJobId,
    openings:
      typeof opportunity.openings === "number"
        ? opportunity.openings
        : undefined,
    applicants:
      typeof opportunity.applicants === "number"
        ? opportunity.applicants
        : undefined,
    level: opportunity.level,
    workTerm: opportunity.workTerm,
  };
}

export const buildPendingJobFromExtension = buildJobFromExtension;

function buildExtensionNotes(
  opportunity: BuildableExtensionOpportunity,
): string | undefined {
  const notes = [
    opportunity.source ? `Source: ${opportunity.source}` : undefined,
    opportunity.sourceJobId
      ? `Source job ID: ${opportunity.sourceJobId}`
      : undefined,
    opportunity.postedAt ? `Posted at: ${opportunity.postedAt}` : undefined,
    opportunity.notes,
  ].filter(Boolean);

  return notes.length > 0 ? notes.join("\n") : undefined;
}
