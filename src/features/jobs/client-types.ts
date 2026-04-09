export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface AddJobDraft {
  title: string;
  company: string;
  description: string;
  url: string;
}

export interface JobFilters {
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  remoteFilter: string;
  sortBy: string;
}

export interface ImportedEmailPreview {
  subject: string;
  snippet: string;
  from: string;
  parsed?: {
    role?: string;
    company?: string;
  };
}

export interface ParsedJobPreview {
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  description: string;
  fullDescription: string;
  requirements: string[];
  keywords: string[];
  url?: string;
  source?: string;
}

export interface CSVJob {
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  description: string;
  url: string;
  isValid: boolean;
  errors: string[];
}

export interface CSVPreview {
  total: number;
  valid: number;
  invalid: number;
  jobs: CSVJob[];
  errors: string[];
}

export type JobImportStep = "input" | "preview" | "edit" | "csv-preview";

export type JobImportMode = "text" | "url" | "csv";
