import type { JobDescription, JobStatus } from "@/types";

export type OpportunitySectionId =
  | "core"
  | "location"
  | "details"
  | "compensation"
  | "application"
  | "meta";

export type OpportunityEditableField =
  | "title"
  | "company"
  | "status"
  | "location"
  | "remote"
  | "type"
  | "description"
  | "requirements"
  | "responsibilities"
  | "keywords"
  | "salary"
  | "url"
  | "deadline"
  | "appliedAt";

export type OpportunityReadonlyField = "id" | "createdAt";

export type OpportunityField = OpportunityEditableField | OpportunityReadonlyField;

export type OpportunityFieldType =
  | "text"
  | "url"
  | "date"
  | "textarea"
  | "list"
  | "checkbox"
  | "select"
  | "readonly";

export interface OpportunityFieldOption {
  label: string;
  value: string;
}

export interface OpportunityFieldConfig {
  key: OpportunityField;
  label: string;
  type: OpportunityFieldType;
  section: OpportunitySectionId;
  placeholder?: string;
  options?: OpportunityFieldOption[];
}

export interface OpportunityFieldSection {
  id: OpportunitySectionId;
  title: string;
  fields: OpportunityFieldConfig[];
}

export const OPPORTUNITY_STATUS_OPTIONS: OpportunityFieldOption[] = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offered", value: "offered" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export const OPPORTUNITY_TYPE_OPTIONS: OpportunityFieldOption[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

export const OPPORTUNITY_FIELD_SECTIONS: OpportunityFieldSection[] = [
  {
    id: "core",
    title: "Core",
    fields: [
      { key: "title", label: "Title", type: "text", section: "core" },
      { key: "company", label: "Company", type: "text", section: "core" },
      {
        key: "status",
        label: "Status",
        type: "select",
        section: "core",
        options: OPPORTUNITY_STATUS_OPTIONS,
      },
    ],
  },
  {
    id: "location",
    title: "Location",
    fields: [
      { key: "location", label: "Location", type: "text", section: "location" },
      { key: "remote", label: "Remote", type: "checkbox", section: "location" },
    ],
  },
  {
    id: "details",
    title: "Details",
    fields: [
      {
        key: "type",
        label: "Type",
        type: "select",
        section: "details",
        options: OPPORTUNITY_TYPE_OPTIONS,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        section: "details",
      },
      {
        key: "requirements",
        label: "Requirements",
        type: "list",
        section: "details",
        placeholder: "One requirement per line",
      },
      {
        key: "responsibilities",
        label: "Responsibilities",
        type: "list",
        section: "details",
        placeholder: "One responsibility per line",
      },
      {
        key: "keywords",
        label: "Keywords",
        type: "list",
        section: "details",
        placeholder: "One keyword per line",
      },
    ],
  },
  {
    id: "compensation",
    title: "Compensation",
    fields: [
      { key: "salary", label: "Salary", type: "text", section: "compensation" },
    ],
  },
  {
    id: "application",
    title: "Application",
    fields: [
      { key: "url", label: "Source URL", type: "url", section: "application" },
      { key: "deadline", label: "Deadline", type: "date", section: "application" },
      {
        key: "appliedAt",
        label: "Applied at",
        type: "date",
        section: "application",
      },
    ],
  },
  {
    id: "meta",
    title: "Meta",
    fields: [
      { key: "id", label: "ID", type: "readonly", section: "meta" },
      { key: "createdAt", label: "Created", type: "readonly", section: "meta" },
    ],
  },
];

export function getOpportunityFieldConfig(
  key: OpportunityField
): OpportunityFieldConfig {
  const field = OPPORTUNITY_FIELD_SECTIONS.flatMap((section) => section.fields).find(
    (candidate) => candidate.key === key
  );

  if (!field) {
    throw new Error(`Unknown opportunity field: ${key}`);
  }

  return field;
}

export function formatOpportunityFieldValue(
  opportunity: JobDescription,
  field: OpportunityFieldConfig
): string {
  const value = opportunity[field.key as keyof JobDescription];

  if (field.type === "checkbox") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join("\n") : "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return "";
}

export function formatOpportunityFieldPreview(
  opportunity: JobDescription,
  field: OpportunityFieldConfig
): string {
  const formatted = formatOpportunityFieldValue(opportunity, field);

  if (!formatted) {
    return "Not set";
  }

  const selectedOption = field.options?.find((option) => option.value === formatted);
  return selectedOption?.label ?? formatted;
}

export function parseOpportunityListValue(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildOpportunityPatch(
  field: OpportunityFieldConfig,
  value: string | boolean
): Partial<JobDescription> {
  if (field.type === "readonly") {
    return {};
  }

  if (field.type === "checkbox") {
    return { [field.key]: Boolean(value) } as Partial<JobDescription>;
  }

  if (field.type === "list") {
    return {
      [field.key]: parseOpportunityListValue(String(value)),
    } as Partial<JobDescription>;
  }

  const stringValue = String(value).trim();

  if (field.key === "status") {
    return { status: (stringValue || "saved") as JobStatus };
  }

  if (field.key === "remote") {
    return { remote: Boolean(value) };
  }

  return {
    [field.key]: stringValue || undefined,
  } as Partial<JobDescription>;
}

export function buildAppliedOpportunityPatch(): Partial<JobDescription> {
  return {
    status: "applied",
    appliedAt: new Date().toISOString(),
  };
}
