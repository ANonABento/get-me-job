/**
 * @route POST /api/import/jobs
 * @description Bulk import jobs from JSON or CSV payload
 * @auth Required
 * @request { jobs: ImportJobInput[] }
 * @response ImportJobsBulkResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { createJob, getJobs } from "@/lib/db/jobs";
import type { JobDescription } from "@/types";
import { importJobSchema, type ImportJobInput } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const contentType = request.headers.get("content-type") || "";
    let rawJobs: unknown[] = [];

    if (contentType.includes("application/json")) {
      const data = await request.json();

      // Handle Slothing export format or direct array
      if (data.jobs && Array.isArray(data.jobs)) {
        rawJobs = data.jobs;
      } else if (Array.isArray(data)) {
        rawJobs = data;
      } else {
        return NextResponse.json(
          {
            error:
              "Invalid JSON format. Expected array of jobs or {jobs: [...]}.",
          },
          { status: 400 },
        );
      }
    } else if (
      contentType.includes("text/csv") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 },
        );
      }

      const text = await file.text();
      rawJobs = parseCsv(text);
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported content type. Use application/json or multipart/form-data.",
        },
        { status: 400 },
      );
    }

    // Validate and import jobs
    const existingJobs = getJobs(authResult.userId);
    const existingTitles = new Set(
      existingJobs.map(
        (j) => `${j.title.toLowerCase()}-${j.company.toLowerCase()}`,
      ),
    );

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const rawJob of rawJobs) {
      // Validate with Zod
      const parseResult = importJobSchema.safeParse(rawJob);
      if (!parseResult.success) {
        const jobTitle = (rawJob as { title?: string })?.title || "unknown";
        results.errors.push(
          `Skipped job "${jobTitle}": ${parseResult.error.issues[0]?.message || "Invalid data"}`,
        );
        results.skipped++;
        continue;
      }

      const job = parseResult.data;

      // Check for duplicates
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (existingTitles.has(key)) {
        results.skipped++;
        continue;
      }

      // Create job
      createJob(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type as JobDescription["type"],
          remote: Boolean(job.remote),
          salary: job.salary,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          keywords: job.keywords || [],
          url: job.url,
          status: (job.status as JobDescription["status"]) || "pending",
          deadline: job.deadline,
          notes: job.notes,
        },
        authResult.userId,
      );

      existingTitles.add(key);
      results.imported++;
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Imported ${results.imported} jobs, skipped ${results.skipped} (duplicates or errors)`,
    });
  } catch (error) {
    console.error("Import jobs error:", error);
    return NextResponse.json(
      { error: "Failed to import jobs" },
      { status: 500 },
    );
  }
}

function parseCsv(text: string): unknown[] {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const jobs: unknown[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const job: Record<string, string | boolean | string[]> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";
      const mappedKey = mapCsvHeader(header);
      if (mappedKey) {
        if (mappedKey === "remote") {
          job[mappedKey] =
            value.toLowerCase() === "yes" || value === "true" || value === "1";
        } else if (mappedKey === "keywords") {
          job[mappedKey] = value
            .split(";")
            .map((k) => k.trim())
            .filter(Boolean);
        } else {
          job[mappedKey] = value;
        }
      }
    });

    if (job.title && job.company) {
      jobs.push(job);
    }
  }

  return jobs;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function mapCsvHeader(header: string): string | null {
  const mapping: Record<string, string> = {
    title: "title",
    "job title": "title",
    company: "company",
    location: "location",
    type: "type",
    "job type": "type",
    remote: "remote",
    salary: "salary",
    description: "description",
    "job description": "description",
    requirements: "requirements",
    responsibilities: "responsibilities",
    keywords: "keywords",
    skills: "keywords",
    url: "url",
    link: "url",
    status: "status",
    deadline: "deadline",
    notes: "notes",
  };

  return mapping[header] || null;
}
