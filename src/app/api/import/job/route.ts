/**
 * @route POST /api/import/job
 * @description Parse a single job from text, JSON, or URL and return a preview
 * @auth Required
 * @request { source: "text" | "json" | "url", content: string }
 * @response ImportJobPreviewResponse from @/types/api
 *
 * @route PUT /api/import/job
 * @description Save a validated job from preview data
 * @auth Required
 * @request { job: ParsedJob }
 * @response ImportJobResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { parseJobText, parseJobJSON, extractKeywords, type ParsedJob } from "@/lib/import/job-parser";
import { createJob } from "@/lib/db/jobs";
import { requireAuth, isAuthError } from "@/lib/auth";

interface ImportRequest {
  text?: string;
  json?: Record<string, unknown>;
  url?: string;
}

// Fetch job content from URL
async function fetchJobFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TaidaBot/1.0; +https://taida.app)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Extract text content from HTML
  // Remove script and style tags first
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

  // Convert common block elements to newlines
  text = text
    .replace(/<\/?(div|p|br|li|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return text;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = (await request.json()) as ImportRequest;
    const { text, json, url } = body;

    // URL-only import: fetch content from URL
    if (url && !text && !json) {
      try {
        const fetchedText = await fetchJobFromUrl(url);
        const parsedJob = parseJobText(fetchedText, url);
        const keywords = extractKeywords(parsedJob.description);

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
            url: parsedJob.url || url,
            source: parsedJob.source,
          },
        });
      } catch (fetchError) {
        console.error("URL fetch error:", fetchError);
        return NextResponse.json(
          { error: `Failed to fetch job from URL: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}` },
          { status: 400 }
        );
      }
    }

    if (!text && !json) {
      return NextResponse.json(
        { error: "Either 'text', 'json', or 'url' is required" },
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
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

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
    }, authResult.userId);

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
