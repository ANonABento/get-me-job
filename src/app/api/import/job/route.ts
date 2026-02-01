import { NextRequest, NextResponse } from "next/server";
import { parseJobText, parseJobJSON, extractKeywords, type ParsedJob } from "@/lib/import/job-parser";
import { createJob } from "@/lib/db/jobs";

interface ImportRequest {
  text?: string;
  json?: Record<string, unknown>;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequest;
    const { text, json, url } = body;

    if (!text && !json) {
      return NextResponse.json(
        { error: "Either 'text' or 'json' is required" },
        { status: 400 }
      );
    }

    let parsedJob: ParsedJob;

    if (json) {
      // Parse structured JSON
      parsedJob = parseJobJSON(json);
    } else if (text) {
      // Parse plain text
      parsedJob = parseJobText(text, url);
    } else {
      return NextResponse.json(
        { error: "No content to parse" },
        { status: 400 }
      );
    }

    // Extract keywords from description
    const keywords = extractKeywords(parsedJob.description);

    // Return preview (don't save yet)
    return NextResponse.json({
      success: true,
      preview: {
        title: parsedJob.title,
        company: parsedJob.company,
        location: parsedJob.location,
        type: parsedJob.type,
        remote: parsedJob.remote,
        salary: parsedJob.salary,
        description: parsedJob.description.slice(0, 500) + (parsedJob.description.length > 500 ? "..." : ""),
        fullDescription: parsedJob.description,
        requirements: parsedJob.requirements,
        keywords,
        url: url || parsedJob.url,
        source: parsedJob.source,
      },
    });
  } catch (error) {
    console.error("Import parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse job content" },
      { status: 500 }
    );
  }
}

// Save the parsed job
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, company, location, type, remote, salary, description, requirements, keywords, url } = body;

    if (!title || !company || !description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }

    // Save to database
    const job = createJob({
      title,
      company,
      location,
      type,
      remote,
      salary,
      description,
      requirements: requirements || [],
      responsibilities: [],
      keywords: keywords || [],
      url,
    });

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Import save error:", error);
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    );
  }
}
