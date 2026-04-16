/**
 * @route GET /api/jobs
 * @description List all jobs for the current user
 * @route POST /api/jobs
 * @description Create a new job with LLM-powered keyword extraction
 * @auth Required
 * @request { title: string, company: string, url?: string, description: string, location?: string, salary?: string, jobType?: string }
 * @response JobsResponse | JobResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/db/jobs";
import { getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { createJobSchema, TECH_KEYWORDS } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const jobs = getJobs(authResult.userId);
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = createJobSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Try to extract keywords using LLM
    let keywords: string[] = [];
    const llmConfig = getLLMConfig();

    if (llmConfig) {
      try {
        const client = new LLMClient(llmConfig);
        const response = await client.complete({
          messages: [
            {
              role: "user",
              content: `Extract the key skills, technologies, and requirements from this job description. Return ONLY a JSON array of strings, nothing else.

Job Description:
${data.description}

Return format: ["skill1", "skill2", "skill3", ...]`,
            },
          ],
          temperature: 0.1,
          maxTokens: 500,
        });

        // Parse response using utility that handles markdown code blocks
        keywords = parseJSONFromLLM<string[]>(response);
      } catch (llmError) {
        console.error("Failed to extract keywords:", llmError);
        // Extract keywords using basic regex
        keywords = extractKeywordsBasic(data.description);
      }
    } else {
      keywords = extractKeywordsBasic(data.description);
    }

    const job = createJob({
      ...data,
      requirements: data.requirements ?? [],
      responsibilities: data.responsibilities ?? [],
      keywords,
    }, authResult.userId);

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

// Basic keyword extraction
function extractKeywordsBasic(text: string): string[] {
  const lowerText = text.toLowerCase();
  return TECH_KEYWORDS.filter((kw) => lowerText.includes(kw));
}
