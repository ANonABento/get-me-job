import { z } from "zod";

export const OPPORTUNITY_TYPES = ["job", "hackathon"] as const;
export const OPPORTUNITY_SOURCES = [
  "waterlooworks",
  "linkedin",
  "indeed",
  "greenhouse",
  "lever",
  "devpost",
  "manual",
  "url",
] as const;
export const OPPORTUNITY_REMOTE_TYPES = ["remote", "hybrid", "onsite"] as const;
export const OPPORTUNITY_JOB_TYPES = [
  "co-op",
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;
export const OPPORTUNITY_LEVELS = [
  "junior",
  "intermediate",
  "senior",
  "lead",
  "principal",
  "other",
  "staff",
] as const;
export const OPPORTUNITY_STATUSES = [
  "pending",
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "expired",
  "dismissed",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type OpportunitySource = (typeof OPPORTUNITY_SOURCES)[number];
export type OpportunityRemoteType = (typeof OPPORTUNITY_REMOTE_TYPES)[number];
export type OpportunityJobType = (typeof OPPORTUNITY_JOB_TYPES)[number];
export type OpportunityLevel = (typeof OPPORTUNITY_LEVELS)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  company: string;
  division?: string;
  source: OpportunitySource;
  sourceUrl?: string;
  sourceId?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  region?: string;
  remoteType?: OpportunityRemoteType;
  additionalLocationInfo?: string;
  jobType?: OpportunityJobType;
  level?: OpportunityLevel;
  openings?: number;
  workTerm?: string;
  applicationMethod?: string;
  requiredDocuments?: string[];
  targetedDegrees?: string[];
  targetedClusters?: string[];
  prizes?: string[];
  teamSize?: { min: number; max: number };
  tracks?: string[];
  submissionUrl?: string;
  summary: string;
  responsibilities?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  techStack?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  benefits?: string[];
  deadline?: string;
  additionalInfo?: string;
  status: OpportunityStatus;
  scrapedAt?: string;
  savedAt?: string;
  appliedAt?: string;
  tags: string[];
  notes?: string;
  linkedResumeId?: string;
  linkedCoverLetterId?: string;
  createdAt: string;
  updatedAt: string;
}

const requiredText = (max: number, field: string) =>
  z.string().trim().min(1, `${field} is required`).max(max);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

const optionalStringList = z.array(z.string().trim().min(1).max(200)).optional();

const optionalUrl = z
  .union([z.string().trim().url(), z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const opportunityTypeSchema = z.enum(OPPORTUNITY_TYPES);
export const opportunitySourceSchema = z.enum(OPPORTUNITY_SOURCES);
export const opportunityRemoteTypeSchema = z.enum(OPPORTUNITY_REMOTE_TYPES);
export const opportunityJobTypeSchema = z.enum(OPPORTUNITY_JOB_TYPES);
export const opportunityLevelSchema = z.enum(OPPORTUNITY_LEVELS);
export const opportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);

const opportunityTeamSizeSchema = z
  .object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  })
  .refine((value) => value.min <= value.max, {
    message: "Minimum team size must be less than or equal to maximum team size",
    path: ["min"],
  });

const salaryRangeRefinement = {
  message: "Minimum salary must be less than or equal to maximum salary",
  path: ["salaryMin"],
};

const hasValidSalaryRange = (value: {
  salaryMin?: number;
  salaryMax?: number;
}) =>
  value.salaryMin === undefined ||
  value.salaryMax === undefined ||
  value.salaryMin <= value.salaryMax;

const opportunityInputFields = {
  type: opportunityTypeSchema,
  title: requiredText(200, "Title"),
  company: requiredText(200, "Company"),
  division: optionalText(200),
  source: opportunitySourceSchema,
  sourceUrl: optionalUrl,
  sourceId: optionalText(200),
  city: optionalText(120),
  province: optionalText(120),
  country: optionalText(120),
  postalCode: optionalText(40),
  region: optionalText(120),
  remoteType: opportunityRemoteTypeSchema.optional(),
  additionalLocationInfo: optionalText(500),
  jobType: opportunityJobTypeSchema.optional(),
  level: opportunityLevelSchema.optional(),
  openings: z.number().int().positive().optional(),
  workTerm: optionalText(120),
  applicationMethod: optionalText(120),
  requiredDocuments: optionalStringList,
  targetedDegrees: optionalStringList,
  targetedClusters: optionalStringList,
  prizes: optionalStringList,
  teamSize: opportunityTeamSizeSchema.optional(),
  tracks: optionalStringList,
  submissionUrl: optionalUrl,
  summary: requiredText(50000, "Summary"),
  responsibilities: optionalStringList,
  requiredSkills: optionalStringList,
  preferredSkills: optionalStringList,
  techStack: optionalStringList,
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  salaryCurrency: optionalText(12),
  benefits: optionalStringList,
  deadline: optionalText(80),
  additionalInfo: optionalText(5000),
  scrapedAt: optionalText(80),
  savedAt: optionalText(80),
  appliedAt: optionalText(80),
  notes: optionalText(5000),
  linkedResumeId: optionalText(200),
  linkedCoverLetterId: optionalText(200),
} as const;

const updateOpportunityInputFields = Object.fromEntries(
  Object.entries(opportunityInputFields).map(([key, schema]) => [
    key,
    schema.optional(),
  ])
) as {
  [Key in keyof typeof opportunityInputFields]: z.ZodOptional<
    (typeof opportunityInputFields)[Key]
  >;
};

export const createOpportunitySchema = z
  .object({
    ...opportunityInputFields,
    status: opportunityStatusSchema.default("pending"),
    tags: z.array(z.string().trim().min(1).max(80)).default([]),
  })
  .refine(hasValidSalaryRange, salaryRangeRefinement);

export const updateOpportunitySchema = z
  .object({
    ...updateOpportunityInputFields,
    status: opportunityStatusSchema.optional(),
    tags: z.array(z.string().trim().min(1).max(80)).optional(),
  })
  .refine(hasValidSalaryRange, salaryRangeRefinement);

export const opportunitySchema = z
  .object({
    ...opportunityInputFields,
    id: requiredText(200, "ID"),
    status: opportunityStatusSchema,
    tags: z.array(z.string().trim().min(1).max(80)),
    createdAt: requiredText(80, "Created at"),
    updatedAt: requiredText(80, "Updated at"),
  })
  .refine(hasValidSalaryRange, salaryRangeRefinement);

export const opportunityStatusChangeSchema = z.object({
  status: opportunityStatusSchema,
});

export const opportunityFiltersSchema = z.object({
  type: opportunityTypeSchema.optional(),
  status: opportunityStatusSchema.optional(),
  source: opportunitySourceSchema.optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  search: z.string().trim().optional(),
});

export type CreateOpportunityInput = z.input<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.input<typeof updateOpportunitySchema>;
export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;
export type OpportunityStatusChangeInput = z.input<
  typeof opportunityStatusChangeSchema
>;
