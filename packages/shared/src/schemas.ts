import { z } from "zod";

// Legacy `jobStatusSchema` + `createJobSchema` + `updateJobSchema` +
// `jobStatusUpdateSchema` (plus their `validate*` helpers) used to live here
// with a *different* value set (`offered` instead of `offer`, no `expired` /
// `dismissed` / `pending`). They were deleted as part of F2.1 consolidation —
// nothing outside the shared package consumed them, and the web app already
// validates opportunity inputs through `opportunityStatusSchema` below. Use
// `opportunityStatusSchema`, `createOpportunitySchema`, `updateOpportunitySchema`,
// and `opportunityStatusChangeSchema` instead.

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

export const KANBAN_LANE_IDS = [
  "pending",
  "saved",
  "applied",
  "interviewing",
  "offer",
  "closed",
] as const;

export const CLOSED_SUB_STATUSES = [
  "rejected",
  "expired",
  "dismissed",
] as const;

// Built-in sort orders for the review queue + opportunities list. All
// `Opportunity[]` callers route through `sortOpportunities()` in
// apps/web/src/lib/opportunities/sort.ts; the helper looks up the
// comparator for a given ID. `ai-recommended` and `closest-to-location`
// are placeholders for follow-up specs — they render in the dropdown but
// fall back to `most-recent` if their preconditions aren't met (no
// profile-fit score; no user location).
export const OPPORTUNITY_SORT_IDS = [
  "most-recent",
  "soonest-deadline",
  "highest-pay",
  "lowest-pay",
  "lowest-applicants",
  "highest-applicants",
  "best-applicant-ratio",
  "ai-recommended",
  "closest-to-location",
] as const;
export type OpportunitySortId = (typeof OPPORTUNITY_SORT_IDS)[number];

export const OPPORTUNITY_PRESET_SCOPES = ["review", "list"] as const;
export type OpportunityPresetScope = (typeof OPPORTUNITY_PRESET_SCOPES)[number];

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type OpportunitySource = (typeof OPPORTUNITY_SOURCES)[number];
export type OpportunityRemoteType = (typeof OPPORTUNITY_REMOTE_TYPES)[number];
export type OpportunityJobType = (typeof OPPORTUNITY_JOB_TYPES)[number];
export type OpportunityLevel = (typeof OPPORTUNITY_LEVELS)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type KanbanLaneId = (typeof KANBAN_LANE_IDS)[number];
export type ClosedSubStatus = (typeof CLOSED_SUB_STATUSES)[number];

export const KANBAN_LANE_GROUPS: Record<
  KanbanLaneId,
  readonly OpportunityStatus[]
> = {
  pending: ["pending"],
  saved: ["saved"],
  applied: ["applied"],
  interviewing: ["interviewing"],
  offer: ["offer"],
  closed: CLOSED_SUB_STATUSES,
};

export const DEFAULT_KANBAN_VISIBLE_LANES: readonly KanbanLaneId[] =
  KANBAN_LANE_IDS;

const STATUS_TO_KANBAN_LANE = Object.fromEntries(
  KANBAN_LANE_IDS.flatMap((lane) =>
    KANBAN_LANE_GROUPS[lane].map((status) => [status, lane] as const),
  ),
) as Record<OpportunityStatus, KanbanLaneId>;

export function inferLaneFromStatus(status: OpportunityStatus): KanbanLaneId {
  return STATUS_TO_KANBAN_LANE[status];
}

export function isClosedSubStatus(
  status: OpportunityStatus,
): status is ClosedSubStatus {
  return (CLOSED_SUB_STATUSES as readonly OpportunityStatus[]).includes(status);
}

export function normalizeKanbanVisibleLanes(input: unknown): KanbanLaneId[] {
  const parsedInput =
    typeof input === "string" ? parseJsonSafely(input) : input;
  if (!Array.isArray(parsedInput)) {
    return [...DEFAULT_KANBAN_VISIBLE_LANES];
  }

  const selected = KANBAN_LANE_IDS.filter((lane) => parsedInput.includes(lane));

  return selected.length > 0 ? selected : [...DEFAULT_KANBAN_VISIBLE_LANES];
}

function parseJsonSafely(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

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
  // Competitiveness signal — number of applicants reported by the source
  // (WaterlooWorks exposes this on the list view but not in the modal).
  applicants?: number;
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

const optionalStringList = z
  .array(z.string().trim().min(1).max(200))
  .optional();

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
export const kanbanLaneIdSchema = z.enum(KANBAN_LANE_IDS);
export const kanbanVisibleLanesSchema = z
  .array(kanbanLaneIdSchema)
  .min(1, "At least one kanban lane must remain visible");

const opportunityTeamSizeSchema = z
  .object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  })
  .refine((value) => value.min <= value.max, {
    message:
      "Minimum team size must be less than or equal to maximum team size",
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
  applicants: z.number().int().nonnegative().optional(),
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
  ]),
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

// Saved filter+sort combination the user can apply to the review queue or
// opportunities list in one click. `position` controls pinned ordering;
// negative or null positions are treated as "unpinned tail".
export const opportunitySortIdSchema = z.enum(OPPORTUNITY_SORT_IDS);
export const opportunityPresetScopeSchema = z.enum(OPPORTUNITY_PRESET_SCOPES);

export const opportunityPresetSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Name is required").max(80),
  scope: opportunityPresetScopeSchema.default("review"),
  filters: opportunityFiltersSchema,
  sortId: opportunitySortIdSchema.default("most-recent"),
  pinned: z.boolean().default(false),
  position: z.number().int().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type OpportunityPreset = z.infer<typeof opportunityPresetSchema>;

// Used by POST /api/opportunity-presets — server assigns id + timestamps.
export const createOpportunityPresetSchema = opportunityPresetSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  // `pinned` defaults to false but callers may omit it
  .extend({
    pinned: z.boolean().optional().default(false),
  });
export type CreateOpportunityPresetInput = z.input<
  typeof createOpportunityPresetSchema
>;

// Used by PATCH /api/opportunity-presets/[id] — every field is optional.
export const updateOpportunityPresetSchema = opportunityPresetSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
export type UpdateOpportunityPresetInput = z.input<
  typeof updateOpportunityPresetSchema
>;

// LLM provider configuration. The runtime validation source lives here so the
// `LLMConfig` type in `./types` can be derived from this schema via `z.infer`
// (kept in sync automatically — see F6.2 in `docs/legacy-duplication-audit.md`).
// `apps/web/src/lib/constants/llm.ts` re-exports this schema so existing
// callers that import from `@/lib/constants` keep working.
export const LLM_PROVIDERS = [
  "openai",
  "anthropic",
  "ollama",
  "openrouter",
] as const;
export const llmProviderSchema = z.enum(LLM_PROVIDERS);
export type LLMProvider = (typeof LLM_PROVIDERS)[number];

export const llmConfigSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  model: z.string().min(1, "Model is required"),
});

export type LLMConfigInput = z.infer<typeof llmConfigSchema>;
