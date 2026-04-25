import type { CSVJob, CSVPreview, ParsedJobPreview } from "./import-job-dialog.types";

interface PreviewResponse {
  preview: ParsedJobPreview;
}

interface CSVPreviewResponse {
  preview: CSVPreview;
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
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
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : fallbackMessage;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchJobFromUrl(url: string): Promise<ParsedJobPreview> {
  const response = await fetch("/api/import/job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await parseJsonResponse<PreviewResponse>(response, "Failed to fetch job from URL");
  return data.preview;
}

export async function parseJobText(text: string, url?: string): Promise<ParsedJobPreview> {
  const response = await fetch("/api/import/job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      url: url || undefined,
    }),
  });
  const data = await parseJsonResponse<PreviewResponse>(response, "Failed to parse job");
  return data.preview;
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
      url: preview.url || fallbackUrl,
    }),
  });
  await parseJsonResponse<unknown>(response, "Failed to save job");
}

export async function parseCsvContent(csv: string): Promise<CSVPreview> {
  const response = await fetch("/api/import/csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv }),
  });
  const data = await parseJsonResponse<CSVPreviewResponse>(response, "Failed to parse CSV");
  return data.preview;
}

export async function saveCsvJobs(jobs: CSVJob[]): Promise<void> {
  const response = await fetch("/api/import/csv", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobs }),
  });
  await parseJsonResponse<unknown>(response, "Failed to import jobs");
}
