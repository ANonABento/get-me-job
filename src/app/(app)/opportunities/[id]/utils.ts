import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_TYPES,
  JOB_TYPE_LABELS,
  type JobStatus,
  type JobType,
} from "@/lib/constants";
import type { JobDescription } from "@/types";

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
  value: JobStatus | JobType;
}

export interface OpportunityFieldConfig {
  key: OpportunityField;
  label: string;
  type: OpportunityFieldType;
  placeholder?: string;
  options?: OpportunityFieldOption[];
}

export interface OpportunityFieldSection {
  id: OpportunitySectionId;
  title: string;
  fields: OpportunityFieldConfig[];
}

export const OPPORTUNITY_STATUS_OPTIONS: OpportunityFieldOption[] =
  JOB_STATUSES.map((status) => ({
    label: JOB_STATUS_LABELS[status],
    value: status,
  }));

export const OPPORTUNITY_TYPE_OPTIONS: OpportunityFieldOption[] = JOB_TYPES.map(
  (type) => ({
    label: JOB_TYPE_LABELS[type],
    value: type,
  })
);

export const OPPORTUNITY_FIELD_SECTIONS: OpportunityFieldSection[] = [
  {
    id: "core",
    title: "Core",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "company", label: "Company", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: OPPORTUNITY_STATUS_OPTIONS,
      },
    ],
  },
  {
    id: "location",
    title: "Location",
    fields: [
      { key: "location", label: "Location", type: "text" },
      { key: "remote", label: "Remote", type: "checkbox" },
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
        options: OPPORTUNITY_TYPE_OPTIONS,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "requirements",
        label: "Requirements",
        type: "list",
        placeholder: "One requirement per line",
      },
      {
        key: "responsibilities",
        label: "Responsibilities",
        type: "list",
        placeholder: "One responsibility per line",
      },
      {
        key: "keywords",
        label: "Keywords",
        type: "list",
        placeholder: "One keyword per line",
      },
    ],
  },
  {
    id: "compensation",
    title: "Compensation",
    fields: [
      { key: "salary", label: "Salary", type: "text" },
    ],
  },
  {
    id: "application",
    title: "Application",
    fields: [
      { key: "url", label: "Source URL", type: "url" },
      { key: "deadline", label: "Deadline", type: "date" },
      {
        key: "appliedAt",
        label: "Applied at",
        type: "date",
      },
    ],
  },
  {
    id: "meta",
    title: "Meta",
    fields: [
      { key: "id", label: "ID", type: "readonly" },
      { key: "createdAt", label: "Created", type: "readonly" },
    ],
  },
];

const OPPORTUNITY_FIELDS = OPPORTUNITY_FIELD_SECTIONS.flatMap(
  (section) => section.fields
);

function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.some((status) => status === value);
}

function isJobType(value: string): value is JobType {
  return JOB_TYPES.some((type) => type === value);
}

export function getOpportunityFieldConfig(
  key: OpportunityField
): OpportunityFieldConfig {
  const field = OPPORTUNITY_FIELDS.find((candidate) => candidate.key === key);

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
    return { remote: Boolean(value) };
  }

  if (field.type === "list") {
    const listValue = parseOpportunityListValue(String(value));
    switch (field.key) {
      case "requirements":
        return { requirements: listValue };
      case "responsibilities":
        return { responsibilities: listValue };
      case "keywords":
        return { keywords: listValue };
      default:
        return {};
    }
  }

  const stringValue = String(value).trim();

  if (field.key === "status") {
    return { status: isJobStatus(stringValue) ? stringValue : "saved" };
  }

  switch (field.key) {
    case "type":
      return { type: isJobType(stringValue) ? stringValue : undefined };
    case "location":
      return { location: stringValue };
    case "salary":
      return { salary: stringValue };
    case "url":
      return { url: stringValue };
    case "deadline":
      return { deadline: stringValue };
    case "appliedAt":
      return { appliedAt: stringValue };
    case "title":
      return { title: stringValue || undefined };
    case "company":
      return { company: stringValue || undefined };
    case "description":
      return { description: stringValue || undefined };
    default:
      return {};
  }
}

export function buildAppliedOpportunityPatch(): Partial<JobDescription> {
  return {
    status: "applied",
    appliedAt: new Date().toISOString(),
  };
}
