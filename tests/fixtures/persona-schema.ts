import { z } from "zod";

const isoYearMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, {
  message: "Expected YYYY-MM date",
});

export const expectedExperienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  startDate: isoYearMonthSchema,
  endDate: z.union([isoYearMonthSchema, z.literal("Present")]).nullable(),
  location: z.string().min(1).optional(),
  summary: z.string().min(1),
  category: z.literal("experience"),
});

export const expectedEducationSchema = z.object({
  degree: z.string().min(1),
  school: z.string().min(1),
  startDate: isoYearMonthSchema.optional(),
  endDate: isoYearMonthSchema.optional(),
  gpa: z.string().optional(),
});

export const expectedProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string().min(1)).min(1),
  url: z.string().url().optional(),
});

export const expectedPersonaSchema = z.object({
  personaSlug: z.string().min(1),
  expectedExperiences: z.array(expectedExperienceSchema),
  expectedEducation: z.array(expectedEducationSchema),
  expectedSkills: z.array(z.string().min(1)).min(1),
  expectedProjects: z.array(expectedProjectSchema),
  expectedTotalEntryCount: z.number().int().positive(),
  knownLimitations: z.array(z.string().min(1)),
});

export const targetJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  remoteType: z.enum(["remote", "hybrid", "onsite"]),
  level: z.enum([
    "intern",
    "junior",
    "mid",
    "senior",
    "staff",
    "principal",
    "manager",
  ]),
  salaryMin: z.number().int().positive(),
  salaryMax: z.number().int().positive(),
  currency: z.string().length(3),
  techStack: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  url: z.string().url(),
}).refine((job) => job.salaryMax >= job.salaryMin, {
  message: "salaryMax must be greater than or equal to salaryMin",
  path: ["salaryMax"],
});

export type ExpectedPersona = z.infer<typeof expectedPersonaSchema>;
export type TargetJob = z.infer<typeof targetJobSchema>;

export function validateExpectedPersona(input: unknown): ExpectedPersona {
  return expectedPersonaSchema.parse(input);
}

export function validateTargetJob(input: unknown): TargetJob {
  return targetJobSchema.parse(input);
}
