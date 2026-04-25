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

export type ImportStep = "input" | "preview" | "edit" | "csv-preview";
export type ImportMode = "text" | "url" | "csv";

export interface ImportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobImported: () => void;
}
