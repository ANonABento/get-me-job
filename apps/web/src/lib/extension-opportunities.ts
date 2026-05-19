import { z } from "zod";
import { jobTypeSchema } from "@/lib/constants";
import { nowIso } from "@/lib/format/time";
import { parsePayString } from "@/lib/opportunities/pay";
import type { JobDescription } from "@/types";

// Limits sized for real WaterlooWorks postings, which routinely carry
// multi-thousand-char descriptions and 100+ requirements. Previous values
// (500/1000/100) silently dropped ~200/881 rows in a single bulk scrape
// because validation was batch-level — see #56 RCA.
const optionalString = z.string().trim().max(2000).optional();
const optionalStringArray = z
  .array(z.string().trim().max(4000))
  .max(500)
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
  title: z.string().trim().min(1, "Title is required").max(500),
  company: z.string().trim().min(1, "Company is required").max(500),
  location: optionalString,
  description: z.string().trim().max(200000).optional().default(""),
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
  notes: z.string().trim().max(20000).optional(),
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

/**
 * Per-row parse result. Unlike the batch helper above, this one never
 * fails the whole payload — each row is validated independently so one
 * bloated description doesn't drop its four chunk-mates. The caller
 * imports `valid` and surfaces `invalid` to the user (popup result card,
 * notification, etc.).
 *
 * `invalid[].index` is the position within the input batch, useful for
 * pointing the user at which row failed when neither title nor
 * sourceJobId could be extracted.
 */
export interface PerRowParseFailure {
  index: number;
  sourceJobId?: string;
  title?: string;
  company?: string;
  errors: Array<{ field: string; message: string }>;
}

export interface PerRowParseResult {
  valid: ExtensionOpportunityInput[];
  invalid: PerRowParseFailure[];
}

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

/**
 * Per-row variant of {@link parseExtensionOpportunityPayload}. Validates
 * each row independently; never fails the whole batch. Use this for the
 * bulk-scrape import endpoint where partial success is the norm.
 *
 * For single-opportunity payloads (no `jobs` / `opportunities` wrapper),
 * returns either `{ valid: [parsed], invalid: [] }` on success or
 * `{ valid: [], invalid: [{ index: 0, errors }] }` on failure.
 */
export function parseExtensionOpportunitiesPerRow(
  rawData: unknown,
): PerRowParseResult {
  const rows = extractRowsFromPayload(rawData);
  const valid: ExtensionOpportunityInput[] = [];
  const invalid: PerRowParseFailure[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    const parsed = extensionOpportunitySchema.safeParse(raw);
    if (parsed.success) {
      valid.push(parsed.data);
      continue;
    }
    // Pull identity fields from the raw input so the popup can label
    // each failure with something the user recognises, even when the
    // failing field is title / company itself.
    const identity = extractRowIdentity(raw);
    invalid.push({
      index,
      sourceJobId: identity.sourceJobId,
      title: identity.title,
      company: identity.company,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return { valid, invalid };
}

function extractRowsFromPayload(rawData: unknown): unknown[] {
  if (!rawData || typeof rawData !== "object") return [rawData];
  if ("jobs" in rawData) {
    const value = (rawData as { jobs?: unknown }).jobs;
    return Array.isArray(value) ? value : [];
  }
  if ("opportunities" in rawData) {
    const value = (rawData as { opportunities?: unknown }).opportunities;
    return Array.isArray(value) ? value : [];
  }
  return [rawData];
}

function extractRowIdentity(raw: unknown): {
  title?: string;
  company?: string;
  sourceJobId?: string;
} {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  return {
    title: typeof r.title === "string" ? r.title.slice(0, 200) : undefined,
    company:
      typeof r.company === "string" ? r.company.slice(0, 200) : undefined,
    sourceJobId:
      typeof r.sourceJobId === "string"
        ? r.sourceJobId.slice(0, 100)
        : undefined,
  };
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
  // Bucket G — parse the raw salary string into structured fields once at
  // import time. Stored alongside `salary` so the renderer can show a
  // normalized number while keeping the original visible for context.
  const parsedPay = parsePayString(opportunity.salary);

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
    inferredPayUnit: parsedPay?.unit,
    inferredPayMin: parsedPay?.amountMin,
    inferredPayMax: parsedPay?.amountMax,
    inferredPayCurrency: parsedPay?.currency,
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
