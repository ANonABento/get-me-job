import { z } from "zod";
import { jobTypeSchema } from "@/lib/constants";
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
    z.string().url("Invalid URL").optional().or(z.literal(""))
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
});

export type ExtensionOpportunityInput = z.infer<typeof extensionOpportunitySchema>;

export type ExtensionOpportunityParseResult =
  | { success: true; opportunities: ExtensionOpportunityInput[] }
  | { success: false; errors: Array<{ field: string; message: string }> };

const extensionJobsPayloadSchema = z.object({
  jobs: z.array(extensionOpportunitySchema).min(1, "At least one job is required"),
});

const extensionOpportunitiesPayloadSchema = z.object({
  opportunities: z.array(extensionOpportunitySchema).min(1, "At least one opportunity is required"),
});

export function parseExtensionOpportunityPayload(rawData: unknown): ExtensionOpportunityParseResult {
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

export function buildPendingJobFromExtension(
  opportunity: ExtensionOpportunityInput
): Omit<JobDescription, "id" | "createdAt"> {
  return {
    title: opportunity.title,
    company: opportunity.company,
    location: opportunity.location,
    description: opportunity.description || "No description provided by the extension.",
    requirements: opportunity.requirements,
    responsibilities: opportunity.responsibilities,
    keywords: opportunity.keywords,
    type: opportunity.type,
    remote: opportunity.remote,
    salary: opportunity.salary,
    url: opportunity.url || undefined,
    status: "pending",
    deadline: opportunity.deadline,
    notes: buildExtensionNotes(opportunity),
  };
}

function buildExtensionNotes(opportunity: ExtensionOpportunityInput): string | undefined {
  const notes = [
    opportunity.source ? `Source: ${opportunity.source}` : undefined,
    opportunity.sourceJobId ? `Source job ID: ${opportunity.sourceJobId}` : undefined,
    opportunity.postedAt ? `Posted at: ${opportunity.postedAt}` : undefined,
  ].filter(Boolean);

  return notes.length > 0 ? notes.join("\n") : undefined;
}
