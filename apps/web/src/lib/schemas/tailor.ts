import { z } from "zod";

const contactSchema = z.object({ name: z.string() }).passthrough();

const resumeExperienceSchema = z
  .object({
    company: z.string(),
    title: z.string(),
    dates: z.string(),
    highlights: z.array(z.string()),
  })
  .passthrough();

const resumeEducationSchema = z
  .object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    date: z.string(),
  })
  .passthrough();

const resumeProjectSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
  })
  .passthrough();

export const tailoredResumeSchema = z
  .object({
    contact: contactSchema,
    summary: z.string(),
    experiences: z.array(resumeExperienceSchema),
    skills: z.array(z.string()),
    education: z.array(resumeEducationSchema),
    projects: z.array(resumeProjectSchema).optional(),
    certifications: z.array(z.string()).optional(),
    awards: z.array(z.string()).optional(),
  })
  .passthrough();

const templateFieldsSchema = z.object({
  templateId: z.string().min(1).optional().default("classic"),
});

const jobFieldsSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(20, "Job description is too short. Please paste the full JD."),
  jobTitle: z.string().trim().min(1).optional().default("Unknown Position"),
  company: z.string().trim().min(1).optional().default("Unknown Company"),
  opportunityId: z.string().trim().optional().default(""),
  /**
   * Optional id of a previously-generated tailored resume to use as the seed
   * for this run. Wired up by the extension popup's multi-resume picker (#34).
   * When omitted, the tailor route falls back to seeding from the user's
   * master profile + knowledge bank as before.
   */
  baseResumeId: z.string().trim().optional().default(""),
  /**
   * Optional per-user tailor knobs forwarded from the browser
   * (localStorage `taida:tailor:settings`). The server passes whatever
   * shape arrives through `normalizeTailorSettings` so unrecognized /
   * malformed values fall back to defaults — keeping the schema loose
   * here (z.unknown) lets us evolve the shape without breaking the
   * wire contract.
   */
  settings: z.unknown().optional(),
});

const tailorRequestUnionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("analyze"),
    })
    .merge(templateFieldsSchema)
    .merge(jobFieldsSchema),
  z
    .object({
      action: z.literal("generate"),
    })
    .merge(templateFieldsSchema)
    .merge(jobFieldsSchema),
  z
    .object({
      action: z.literal("render"),
      resume: tailoredResumeSchema,
    })
    .merge(templateFieldsSchema),
]);

export const tailorRequestSchema = z.preprocess((value) => {
  if (typeof value !== "object" || value === null || "action" in value) {
    return value;
  }

  return { ...value, action: "analyze" };
}, tailorRequestUnionSchema);

export type TailorRequestInput = z.infer<typeof tailorRequestSchema>;
