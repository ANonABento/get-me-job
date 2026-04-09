import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import type {
  AddJobDraft,
  CSVJob,
  CSVPreview,
  ParsedJobPreview,
  Template,
} from "@/features/jobs/client-types";
import type { JobDescription, JobMatch } from "@/types";

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export async function fetchJobs(): Promise<JobDescription[]> {
  const data = await readJson<{ jobs?: JobDescription[] }>(
    await fetch("/api/jobs"),
    "Failed to fetch jobs"
  );
  return data.jobs || [];
}

export async function fetchJobTemplates(): Promise<Template[]> {
  const data = await readJson<{ templates?: Template[] }>(
    await fetch("/api/jobs/templates"),
    "Failed to fetch templates"
  );
  return data.templates || [];
}

export async function createJob(input: AddJobDraft): Promise<JobDescription> {
  const data = await readJson<{ job: JobDescription }>(
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
    "Failed to create job"
  );
  return data.job;
}

export async function removeJob(jobId: string): Promise<void> {
  await readJson(
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" }),
    "Failed to delete job"
  );
}

export async function patchJobStatus(jobId: string, status: string): Promise<void> {
  await readJson(
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
    "Failed to update job status"
  );
}

export async function requestJobAnalysis(jobId: string): Promise<JobMatch | undefined> {
  const data = await readJson<{ analysis?: JobMatch }>(
    await fetch(`/api/jobs/${jobId}/analyze`, { method: "POST" }),
    "Failed to analyze job"
  );
  return data.analysis;
}

export async function requestResumeGeneration(
  jobId: string,
  templateId: string
): Promise<string | undefined> {
  const data = await readJson<{ pdfUrl?: string }>(
    await fetch(`/api/jobs/${jobId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    }),
    "Failed to generate resume"
  );
  return data.pdfUrl;
}

export async function requestAtsAnalysis(jobId: string): Promise<ATSAnalysisResult> {
  return readJson<ATSAnalysisResult>(
    await fetch("/api/ats/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    }),
    "Failed to run ATS check"
  );
}

export async function fetchImportedJobFromUrl(jobUrl: string): Promise<ParsedJobPreview> {
  const data = await readJson<{ preview: ParsedJobPreview }>(
    await fetch("/api/import/job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: jobUrl }),
    }),
    "Failed to fetch job from URL"
  );
  return data.preview;
}

export async function parseImportedJob(jobText: string, jobUrl?: string): Promise<ParsedJobPreview> {
  const data = await readJson<{ preview: ParsedJobPreview }>(
    await fetch("/api/import/job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: jobText,
        url: jobUrl || undefined,
      }),
    }),
    "Failed to parse job"
  );
  return data.preview;
}

export async function saveImportedJob(
  preview: ParsedJobPreview,
  jobUrl: string
): Promise<void> {
  await readJson(
    await fetch("/api/import/job", {
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
        url: preview.url || jobUrl,
      }),
    }),
    "Failed to save job"
  );
}

export async function parseImportedCsv(csv: string): Promise<CSVPreview> {
  const data = await readJson<{ preview: CSVPreview }>(
    await fetch("/api/import/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    }),
    "Failed to parse CSV"
  );
  return data.preview;
}

export async function saveImportedCsvJobs(jobs: CSVJob[]): Promise<void> {
  await readJson(
    await fetch("/api/import/csv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs }),
    }),
    "Failed to import jobs"
  );
}
