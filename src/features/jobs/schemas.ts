import { z } from "zod";

export const JOB_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const jobStatusSchema = z.enum(JOB_STATUSES);

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const jobTypeSchema = z.enum(JOB_TYPES);

const createJobFields = {
  title: z.string().min(1, "Title is required").max(200),
  company: z.string().min(1, "Company is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(50000),
  location: z.string().max(200).optional(),
  type: jobTypeSchema.optional(),
  remote: z.boolean().optional(),
  salary: z.string().max(100).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  status: jobStatusSchema.optional().default("saved"),
  deadline: z.string().optional(),
  notes: z.string().max(5000).optional(),
};

export const createJobSchema = z.object(createJobFields);

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial().extend({
  appliedAt: z.string().optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const importJobSchema = z.object({
  ...createJobFields,
  status: jobStatusSchema.optional(),
});

export type ImportJobInput = z.infer<typeof importJobSchema>;

export const importJobsArraySchema = z.array(importJobSchema);

export const TECH_KEYWORDS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "go",
  "rust",
  "react",
  "vue",
  "angular",
  "node",
  "express",
  "django",
  "flask",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "terraform",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "git",
  "ci/cd",
  "jenkins",
  "github actions",
  "agile",
  "scrum",
  "jira",
  "confluence",
  "rest",
  "graphql",
  "api",
  "microservices",
  "machine learning",
  "ai",
  "data science",
  "analytics",
] as const;
