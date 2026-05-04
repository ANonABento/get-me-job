import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getJobStatusForOpportunityStatus,
  jobToOpportunity,
  listOpportunities,
} from "@/lib/opportunities";
import { createJob, getJobs } from "@/lib/db/jobs";
import { getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { createJobSchema, TECH_KEYWORDS } from "@/lib/constants";
import { createOpportunitySchema } from "@/types/opportunity";
import { triggerBackgroundEnrichment } from "@/lib/enrichment/background";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const statuses = request.nextUrl.searchParams
    .get("status")
    ?.split(",")
    .map((status) => status.trim())
    .filter(Boolean);

  try {
    const jobs = getJobs(authResult.userId);
    return NextResponse.json({
      jobs,
      opportunities: listOpportunities(authResult.userId, statuses),
    });
  } catch (error) {
    console.error("List opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to list opportunities" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const legacyJobParseResult = createJobSchema.safeParse(body);
    if (legacyJobParseResult.success) {
      const data = legacyJobParseResult.data;
      const llmConfig = getLLMConfig(authResult.userId);
      let keywords: string[] = [];

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
          keywords = parseJSONFromLLM<string[]>(response);
        } catch (llmError) {
          console.error("Failed to extract keywords:", llmError);
          keywords = extractKeywordsBasic(data.description);
        }
      } else {
        keywords = extractKeywordsBasic(data.description);
      }

      const job = createJob(
        {
          ...data,
          requirements: data.requirements ?? [],
          responsibilities: data.responsibilities ?? [],
          keywords,
        },
        authResult.userId,
      );

      return NextResponse.json(
        { job, opportunity: jobToOpportunity(job) },
        { status: 201 },
      );
    }

    const parseResult = createOpportunitySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.flatten() },
        { status: 400 },
      );
    }
    const data = parseResult.data;
    const job = createJob(
      {
        title: data.title,
        company: data.company,
        description: data.summary,
        location: [data.city, data.province, data.country]
          .filter(Boolean)
          .join(", "),
        url: data.sourceUrl,
        requirements: data.requiredSkills ?? [],
        responsibilities: data.responsibilities ?? [],
        keywords: [...(data.techStack ?? []), ...(data.tags ?? [])],
        type: data.jobType === "co-op" ? "internship" : data.jobType,
        remote: data.remoteType === "remote",
        salary:
          data.salaryMin != null || data.salaryMax != null
            ? [data.salaryMin, data.salaryMax]
                .filter((value) => value != null)
                .join(" - ")
            : undefined,
        status: getJobStatusForOpportunityStatus(data.status),
        notes: data.notes,
        deadline: data.deadline,
      },
      authResult.userId,
    );
    triggerBackgroundEnrichment(
      { company: job.company, sourceUrl: job.url ?? null },
      authResult.userId,
    );

    return NextResponse.json(
      { job, opportunity: jobToOpportunity(job) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 },
    );
  }
}

function extractKeywordsBasic(text: string): string[] {
  const lowerText = text.toLowerCase();
  return TECH_KEYWORDS.filter((keyword) => lowerText.includes(keyword));
}
