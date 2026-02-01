import { NextRequest, NextResponse } from "next/server";
import { createJob, getJobs } from "@/lib/db/jobs";
import type { JobDescription } from "@/types";

interface ImportedJob {
  title: string;
  company: string;
  location?: string;
  type?: string;
  remote?: boolean;
  salary?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  keywords?: string[];
  url?: string;
  status?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let jobs: ImportedJob[] = [];

    if (contentType.includes("application/json")) {
      const data = await request.json();

      // Handle Columbus export format or direct array
      if (data.jobs && Array.isArray(data.jobs)) {
        jobs = data.jobs;
      } else if (Array.isArray(data)) {
        jobs = data;
      } else {
        return NextResponse.json(
          { error: "Invalid JSON format. Expected array of jobs or {jobs: [...]}." },
          { status: 400 }
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
          { status: 400 }
        );
      }

      const text = await file.text();
      jobs = parseCsv(text);
    } else {
      return NextResponse.json(
        { error: "Unsupported content type. Use application/json or multipart/form-data." },
        { status: 400 }
      );
    }

    // Validate and import jobs
    const existingJobs = getJobs();
    const existingTitles = new Set(
      existingJobs.map((j) => `${j.title.toLowerCase()}-${j.company.toLowerCase()}`)
    );

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const job of jobs) {
      try {
        // Validate required fields
        if (!job.title || !job.company || !job.description) {
          results.errors.push(
            `Skipped job: Missing required fields (title, company, or description)`
          );
          results.skipped++;
          continue;
        }

        // Check for duplicates
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
        if (existingTitles.has(key)) {
          results.skipped++;
          continue;
        }

        // Create job
        createJob({
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
          status: (job.status as JobDescription["status"]) || "saved",
          notes: job.notes,
        });

        existingTitles.add(key);
        results.imported++;
      } catch (error) {
        results.errors.push(`Error importing job "${job.title}": ${String(error)}`);
        results.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Imported ${results.imported} jobs, skipped ${results.skipped} (duplicates or errors)`,
    });
  } catch (error) {
    console.error("Import jobs error:", error);
    return NextResponse.json(
      { error: "Failed to import jobs", details: String(error) },
      { status: 500 }
    );
  }
}

function parseCsv(text: string): ImportedJob[] {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const jobs: ImportedJob[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const job: Record<string, string | boolean | string[]> = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";
      const mappedKey = mapCsvHeader(header);
      if (mappedKey) {
        if (mappedKey === "remote") {
          job[mappedKey] = value.toLowerCase() === "yes" || value === "true" || value === "1";
        } else if (mappedKey === "keywords") {
          job[mappedKey] = value.split(";").map((k) => k.trim()).filter(Boolean);
        } else {
          job[mappedKey] = value;
        }
      }
    });

    if (job.title && job.company) {
      jobs.push(job as unknown as ImportedJob);
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
    notes: "notes",
  };

  return mapping[header] || null;
}
