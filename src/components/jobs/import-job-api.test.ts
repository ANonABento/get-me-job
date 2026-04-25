import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchJobFromUrl,
  parseCsvContent,
  parseJobText,
  saveCsvJobs,
  saveParsedJob,
} from "./import-job-api";
import type { CSVJob, ParsedJobPreview } from "./import-job-dialog.types";

const preview: ParsedJobPreview = {
  title: "Engineer",
  company: "Acme",
  location: "Remote",
  type: "full-time",
  remote: true,
  salary: "$100k",
  description: "Short description",
  fullDescription: "Full description",
  requirements: ["TypeScript"],
  keywords: ["React"],
  url: "",
  source: "text",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("import job api helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a job preview from a URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ preview }));

    await expect(fetchJobFromUrl("https://example.com/job")).resolves.toEqual(preview);

    expect(fetch).toHaveBeenCalledWith("/api/import/job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/job" }),
    });
  });

  it("parses pasted job text and omits an empty URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ preview }));

    await parseJobText("job text", "");

    expect(fetch).toHaveBeenCalledWith("/api/import/job", expect.objectContaining({
      body: JSON.stringify({ text: "job text", url: undefined }),
    }));
  });

  it("saves a parsed job using the full description and fallback URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await saveParsedJob(preview, "https://example.com/fallback");

    expect(fetch).toHaveBeenCalledWith("/api/import/job", expect.objectContaining({
      method: "PUT",
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
        url: "https://example.com/fallback",
      }),
    }));
  });

  it("parses CSV content", async () => {
    const csvPreview = { total: 1, valid: 1, invalid: 0, jobs: [], errors: [] };
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ preview: csvPreview }));

    await expect(parseCsvContent("title,company\nEngineer,Acme")).resolves.toEqual(csvPreview);

    expect(fetch).toHaveBeenCalledWith("/api/import/csv", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ csv: "title,company\nEngineer,Acme" }),
    }));
  });

  it("saves CSV jobs and surfaces API errors", async () => {
    const jobs: CSVJob[] = [{
      title: "Engineer",
      company: "Acme",
      location: "",
      type: "",
      remote: false,
      salary: "",
      description: "",
      url: "",
      isValid: true,
      errors: [],
    }];
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: "No jobs imported" }, 400));

    await expect(saveCsvJobs(jobs)).rejects.toThrow("No jobs imported");

    expect(fetch).toHaveBeenCalledWith("/api/import/csv", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ jobs }),
    }));
  });
});
