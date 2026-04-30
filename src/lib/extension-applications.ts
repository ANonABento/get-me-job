import type { JobDescription } from "@/types";
import { extensionOpportunitySchema } from "./extension-opportunities";
import { z } from "zod";

const extensionApplicationSchema = extensionOpportunitySchema.extend({
  submittedAt: z.string().trim().datetime({ offset: true }).optional(),
  submissionUrl: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().url("Invalid submission URL").optional().or(z.literal(""))
    )
    .transform((value) => value || undefined),
  detectionMethod: z.string().trim().max(120).optional(),
});

export type ExtensionApplicationInput = z.infer<typeof extensionApplicationSchema>;

export type ExtensionApplicationParseResult =
  | { success: true; application: ExtensionApplicationInput }
  | { success: false; errors: Array<{ field: string; message: string }> };

export function parseExtensionApplicationPayload(
  rawData: unknown
): ExtensionApplicationParseResult {
  const parsed = extensionApplicationSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return { success: true, application: parsed.data };
}

export function buildAppliedJobFromExtension(
  application: ExtensionApplicationInput,
  fallbackAppliedAt = new Date().toISOString()
): Omit<JobDescription, "id" | "createdAt"> {
  return {
    title: application.title,
    company: application.company,
    location: application.location,
    description: application.description || "Application submitted via the extension.",
    requirements: application.requirements,
    responsibilities: application.responsibilities,
    keywords: application.keywords,
    type: application.type,
    remote: application.remote,
    salary: application.salary,
    url: application.url || application.submissionUrl || undefined,
    status: "applied",
    appliedAt: application.submittedAt || fallbackAppliedAt,
    deadline: application.deadline,
    notes: buildApplicationNotes(application),
  };
}

function buildApplicationNotes(application: ExtensionApplicationInput): string {
  const notes = [
    "Application submitted via extension.",
    application.source ? `Source: ${application.source}` : undefined,
    application.sourceJobId ? `Source job ID: ${application.sourceJobId}` : undefined,
    application.submissionUrl ? `Submission URL: ${application.submissionUrl}` : undefined,
    application.detectionMethod ? `Detected by: ${application.detectionMethod}` : undefined,
  ].filter((note): note is string => Boolean(note));

  return notes.join("\n");
}
