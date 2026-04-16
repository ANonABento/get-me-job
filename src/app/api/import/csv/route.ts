/**
 * @route POST /api/import/csv
 * @description Parse CSV file and return preview of parsed job rows
 * @auth Required
 * @request { csv: string }
 * @response ImportCSVPreviewResponse from @/types/api
 *
 * @route PUT /api/import/csv
 * @description Import validated jobs from CSV preview data
 * @auth Required
 * @request { jobs: CSVJobRow[] }
 * @response ImportCSVResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/db/jobs";
import { requireAuth, isAuthError } from "@/lib/auth";

interface CSVJobRow {
  title: string;
  company: string;
  location?: string;
  type?: string;
  remote?: string;
  salary?: string;
  description?: string;
  url?: string;
}

interface ParsedCSVJob {
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | undefined;
  remote: boolean;
  salary: string;
  description: string;
  url: string;
  isValid: boolean;
  errors: string[];
}

// Parse CSV string to array of objects
function parseCSV(csvContent: string): CSVJobRow[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) =>
    h.toLowerCase().trim().replace(/[^a-z]/g, "")
  );

  // Validate required columns
  const titleIndex = headers.findIndex((h) => h.includes("title") || h.includes("position") || h.includes("jobtitle"));
  const companyIndex = headers.findIndex((h) => h.includes("company") || h.includes("employer") || h.includes("organization"));

  if (titleIndex === -1) {
    throw new Error("CSV must have a 'title' or 'position' column");
  }
  if (companyIndex === -1) {
    throw new Error("CSV must have a 'company' or 'employer' column");
  }

  // Map column indices
  const columnMap = {
    title: titleIndex,
    company: companyIndex,
    location: headers.findIndex((h) => h.includes("location") || h.includes("city")),
    type: headers.findIndex((h) => h.includes("type") || h.includes("employment")),
    remote: headers.findIndex((h) => h.includes("remote") || h.includes("workfrom")),
    salary: headers.findIndex((h) => h.includes("salary") || h.includes("compensation") || h.includes("pay")),
    description: headers.findIndex((h) => h.includes("description") || h.includes("jobdesc")),
    url: headers.findIndex((h) => h.includes("url") || h.includes("link") || h.includes("posting")),
  };

  // Parse data rows
  const jobs: CSVJobRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    const job: CSVJobRow = {
      title: getValue(values, columnMap.title),
      company: getValue(values, columnMap.company),
      location: getValue(values, columnMap.location),
      type: getValue(values, columnMap.type),
      remote: getValue(values, columnMap.remote),
      salary: getValue(values, columnMap.salary),
      description: getValue(values, columnMap.description),
      url: getValue(values, columnMap.url),
    };

    jobs.push(job);
  }

  return jobs;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function getValue(values: string[], index: number): string {
  if (index === -1 || index >= values.length) return "";
  return values[index] || "";
}

function validateAndTransform(row: CSVJobRow, index: number): ParsedCSVJob {
  const errors: string[] = [];

  if (!row.title.trim()) {
    errors.push(`Row ${index + 2}: Missing title`);
  }
  if (!row.company.trim()) {
    errors.push(`Row ${index + 2}: Missing company`);
  }

  // Determine remote status
  const remoteText = (row.remote || "").toLowerCase();
  const isRemote =
    remoteText === "yes" ||
    remoteText === "true" ||
    remoteText === "1" ||
    remoteText === "remote" ||
    (row.location?.toLowerCase().includes("remote") ?? false);

  // Normalize job type
  const typeText = (row.type || "").toLowerCase();
  let jobType: "full-time" | "part-time" | "contract" | "internship" | undefined;
  if (typeText.includes("full")) jobType = "full-time";
  else if (typeText.includes("part")) jobType = "part-time";
  else if (typeText.includes("contract")) jobType = "contract";
  else if (typeText.includes("intern")) jobType = "internship";
  else jobType = undefined;

  return {
    title: row.title.trim(),
    company: row.company.trim(),
    location: row.location?.trim() || "",
    type: jobType,
    remote: isRemote,
    salary: row.salary?.trim() || "",
    description: row.description?.trim() || `${row.title} position at ${row.company}`,
    url: row.url?.trim() || "",
    isValid: errors.length === 0,
    errors,
  };
}

// POST - Parse CSV and return preview
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { csv } = body;

    if (!csv) {
      return NextResponse.json(
        { error: "CSV content is required" },
        { status: 400 }
      );
    }

    const rows = parseCSV(csv);
    const jobs = rows.map((row, index) => validateAndTransform(row, index));
    const validJobs = jobs.filter((j) => j.isValid);
    const invalidJobs = jobs.filter((j) => !j.isValid);

    return NextResponse.json({
      success: true,
      preview: {
        total: jobs.length,
        valid: validJobs.length,
        invalid: invalidJobs.length,
        jobs: validJobs,
        errors: invalidJobs.flatMap((j) => j.errors),
      },
    });
  } catch (error) {
    console.error("CSV parse error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse CSV" },
      { status: 400 }
    );
  }
}

// PUT - Save validated jobs
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { jobs } = body as { jobs: ParsedCSVJob[] };

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs to import" },
        { status: 400 }
      );
    }

    const imported: string[] = [];
    const failed: string[] = [];

    for (const job of jobs) {
      try {
        createJob({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          remote: job.remote,
          salary: job.salary,
          description: job.description,
          requirements: [],
          responsibilities: [],
          keywords: [],
          url: job.url,
        }, authResult.userId);
        imported.push(`${job.title} at ${job.company}`);
      } catch {
        failed.push(`${job.title} at ${job.company}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
      failedJobs: failed,
    });
  } catch (error) {
    console.error("CSV save error:", error);
    return NextResponse.json(
      { error: "Failed to save jobs" },
      { status: 500 }
    );
  }
}
