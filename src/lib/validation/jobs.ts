import { z } from "zod";

// Job status enum
export const jobStatusSchema = z.enum([
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
]);

// Job type enum
export const jobTypeSchema = z.enum([
  "full-time",
  "part-time",
  "contract",
  "internship",
  "freelance",
]);

// Create job schema
export const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200, "Title is too long"),
  company: z.string().min(1, "Company name is required").max(200, "Company name is too long"),
  location: z.string().max(200, "Location is too long").optional().or(z.literal("")),
  type: jobTypeSchema.optional(),
  remote: z.boolean().default(false),
  salary: z.string().max(100, "Salary is too long").optional().or(z.literal("")),
  description: z.string().min(1, "Job description is required"),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  url: z.string().url("Invalid job URL").optional().or(z.literal("")),
  status: jobStatusSchema.default("saved"),
  appliedAt: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().max(5000, "Notes are too long").optional(),
});

// Update job schema (all fields optional)
export const updateJobSchema = createJobSchema.partial();

// Job status update schema
export const jobStatusUpdateSchema = z.object({
  status: jobStatusSchema,
  appliedAt: z.string().optional(),
});

// Type exports
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type JobType = z.infer<typeof jobTypeSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobStatusUpdateInput = z.infer<typeof jobStatusUpdateSchema>;

// Validation helpers
export function validateCreateJob(data: unknown): { success: true; data: CreateJobInput } | { success: false; errors: z.ZodError } {
  const result = createJobSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateUpdateJob(data: unknown): { success: true; data: UpdateJobInput } | { success: false; errors: z.ZodError } {
  const result = updateJobSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateJobStatusUpdate(data: unknown): { success: true; data: JobStatusUpdateInput } | { success: false; errors: z.ZodError } {
  const result = jobStatusUpdateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
