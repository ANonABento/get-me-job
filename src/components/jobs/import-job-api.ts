import type { CSVJob, CSVPreview, ParsedJobPreview } from "./import-job-dialog.types";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isParsedJobPreview(value: unknown): value is ParsedJobPreview {
  if (!isObject(value)) return false;

  return (
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.location === "string" &&
    typeof value.type === "string" &&
    typeof value.remote === "boolean" &&
    typeof value.salary === "string" &&
    typeof value.description === "string" &&
    typeof value.fullDescription === "string" &&
    isStringArray(value.requirements) &&
    isStringArray(value.keywords) &&
    (value.url === undefined || typeof value.url === "string") &&
    (value.source === undefined || typeof value.source === "string")
  );
}

function isCSVJob(value: unknown): value is CSVJob {
  if (!isObject(value)) return false;

  return (
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.location === "string" &&
    (value.type === undefined || typeof value.type === "string") &&
    typeof value.remote === "boolean" &&
    typeof value.salary === "string" &&
    typeof value.description === "string" &&
    typeof value.url === "string" &&
    typeof value.isValid === "boolean" &&
    isStringArray(value.errors)
  );
}

function isCSVPreview(value: unknown): value is CSVPreview {
  if (!isObject(value)) return false;

  return (
    typeof value.total === "number" &&
    typeof value.valid === "number" &&
    typeof value.invalid === "number" &&
    Array.isArray(value.jobs) &&
    value.jobs.every(isCSVJob) &&
    isStringArray(value.errors)
  );
}

function getResponseError(data: unknown, fallbackMessage: string): string {
  if (isObject(data) && typeof data.error === "string") {
    return data.error;
  }
  return fallbackMessage;
}

function normalizeOptionalString(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

async function parseJsonResponse(response: Response, fallbackMessage: string): Promise<unknown> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
    throw new Error("Failed to parse server response");
  }

  if (!response.ok) {
    throw new Error(getResponseError(data, fallbackMessage));
  }
  return data;
}

async function parsePreviewResponse(
  response: Response,
  fallbackMessage: string
): Promise<ParsedJobPreview> {
  const data = await parseJsonResponse(response, fallbackMessage);
  if (isObject(data) && isParsedJobPreview(data.preview)) {
    return data.preview;
  }
  throw new Error("Unexpected job preview response");
}

async function parseCSVPreviewResponse(
  response: Response,
  fallbackMessage: string
): Promise<CSVPreview> {
  const data = await parseJsonResponse(response, fallbackMessage);
  if (isObject(data) && isCSVPreview(data.preview)) {
    return data.preview;
  }
  throw new Error("Unexpected CSV preview response");
}

export async function fetchJobFromUrl(url: string): Promise<ParsedJobPreview> {
  const response = await fetch("/api/import/job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return parsePreviewResponse(response, "Failed to fetch job from URL");
}

export async function parseJobText(text: string, url?: string): Promise<ParsedJobPreview> {
  const response = await fetch("/api/import/job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      url: normalizeOptionalString(url),
    }),
  });
  return parsePreviewResponse(response, "Failed to parse job");
}

export async function saveParsedJob(
  preview: ParsedJobPreview,
  fallbackUrl: string
): Promise<void> {
  const response = await fetch("/api/import/job", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: preview.title,
      company: preview.company,
      location: preview.location,
      type: preview.type,
      remote: preview.remote,
      salary: preview.salary,
      description: preview.fullDescription,
      requirements: preview.requirements,
      keywords: preview.keywords,
      url: normalizeOptionalString(preview.url) || normalizeOptionalString(fallbackUrl),
    }),
  });
  await parseJsonResponse(response, "Failed to save job");
}

export async function parseCsvContent(csv: string): Promise<CSVPreview> {
  const response = await fetch("/api/import/csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv }),
  });
  return parseCSVPreviewResponse(response, "Failed to parse CSV");
}

export async function saveCsvJobs(jobs: CSVJob[]): Promise<void> {
  const response = await fetch("/api/import/csv", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobs }),
  });
  await parseJsonResponse(response, "Failed to import jobs");
}
