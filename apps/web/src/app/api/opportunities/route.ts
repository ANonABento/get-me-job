import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { jobToOpportunity } from "@/lib/opportunities";
import { createJob, listJobsPaginated } from "@/lib/db/jobs";
import { enrichCompany } from "@/lib/enrichment";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { TECH_KEYWORDS } from "@/lib/constants";
import { createJobSchema } from "@/lib/validation/jobs";
import { OPPORTUNITY_STATUSES } from "@slothing/shared/schemas";
import { createOpportunitySchema } from "@/types/opportunity";
import { trackActivationEvent } from "@/lib/db/product-analytics";
import { safeTrackActivity } from "@/lib/streak/track";
import {
  buildPaginationResult,
  decodeCursor,
  InvalidCursorError,
  PaginationParamsSchema,
} from "@/lib/pagination";
import type { JobStatus, OpportunityStatus } from "@/types";

export const dynamic = "force-dynamic";

const createdAtCursorSchema = z.object({
  lastId: z.string(),
  lastCreatedAt: z.string(),
});

const opportunitiesQuerySchema = PaginationParamsSchema.extend({
  status: z.string().optional(),
});

const opportunityStatuses = new Set<OpportunityStatus>(OPPORTUNITY_STATUSES);

// `JobStatus` aliases `OpportunityStatus` after F2.1, but we still translate
// the legacy URL params `offered` / `withdrawn` so cached clients keep working.
function statusParamToJobStatuses(
  value?: string,
): JobStatus[] | undefined | null {
  if (!value) return undefined;
  const statuses = value
    .split(",")
    .map((status) => status.trim())
    .filter(Boolean)
    .map((status) =>
      status === "offered"
        ? "offer"
        : status === "withdrawn"
          ? "dismissed"
          : status,
    )
    .filter((status): status is OpportunityStatus =>
      opportunityStatuses.has(status as OpportunityStatus),
    );
  return statuses.length ? statuses : null;
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parsed = opportunitiesQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const cursor = decodeCursor(parsed.data.cursor, createdAtCursorSchema);
    const statuses = statusParamToJobStatuses(parsed.data.status);
    if (statuses === null) {
      return NextResponse.json({
        jobs: [],
        opportunities: [],
        items: [],
        nextCursor: null,
        hasMore: false,
      });
    }
    const jobs = listJobsPaginated({
      userId: authResult.userId,
      statuses,
      cursor,
      limit: parsed.data.limit,
    });
    const page = buildPaginationResult(jobs, parsed.data.limit, (job) => ({
      lastId: job.id,
      lastCreatedAt: job.createdAt,
    }));
    const opportunities = page.items.map(jobToOpportunity);
    return NextResponse.json({
      jobs: page.items,
      opportunities,
      items: opportunities,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  } catch (error) {
    if (error instanceof InvalidCursorError) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }
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
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const body = await request.json();
    const legacyJobParseResult = createJobSchema.safeParse(body);
    if (legacyJobParseResult.success) {
      const data = legacyJobParseResult.data;
      let keywords: string[] = [];

      const gate = gateOptionalAiFeature(
        authResult.userId,
        "document_assistant",
        `opportunity:${data.company}:${data.title}`,
      );
      if (isAiGateResponse(gate)) return gate;
      aiGate = gate;
      let usedLLM = false;
      let fallbackReason: "provider_not_configured" | "llm_error" | null =
        gate.llmConfig ? null : "provider_not_configured";
      if (gate.llmConfig) {
        try {
          const client = new LLMClient(gate.llmConfig);
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
          usedLLM = true;
        } catch (llmError) {
          aiGate?.refund();
          fallbackReason = "llm_error";
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
      scheduleCompanyEnrichment(job.company, job.url, authResult.userId);
      const { unlocked } = await safeTrackActivity(
        authResult.userId,
        "opp_created",
      );
      try {
        trackActivationEvent({
          event: "opportunity_created",
          userId: authResult.userId,
          source: "api/opportunities",
          metadata: { mode: "legacy_job_schema" },
        });
      } catch (analyticsError) {
        console.error("Opportunity analytics failed:", analyticsError);
      }

      return NextResponse.json(
        {
          job,
          opportunity: jobToOpportunity(job),
          unlocked,
          usedLLM,
          fallbackUsed: !usedLLM,
          fallbackReason,
        },
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
        status: data.status,
        notes: data.notes,
        deadline: data.deadline,
      },
      authResult.userId,
    );
    scheduleCompanyEnrichment(job.company, job.url, authResult.userId);
    const { unlocked } = await safeTrackActivity(
      authResult.userId,
      "opp_created",
    );
    try {
      trackActivationEvent({
        event: "opportunity_created",
        userId: authResult.userId,
        source: "api/opportunities",
        metadata: { mode: "opportunity_schema" },
      });
    } catch (analyticsError) {
      console.error("Opportunity analytics failed:", analyticsError);
    }
    return NextResponse.json(
      { job, opportunity: jobToOpportunity(job), unlocked },
      { status: 201 },
    );
  } catch (error) {
    aiGate?.refund();
    console.error("Create opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 },
    );
  }
}

function scheduleCompanyEnrichment(
  companyName: string,
  companyUrl: string | undefined,
  userId: string,
): void {
  if (process.env.NODE_ENV === "test") return;
  void enrichCompany({
    companyName,
    companyUrl,
    userId,
  }).catch((error) => {
    console.error("[enrichment] background failed", error);
  });
}

function extractKeywordsBasic(text: string): string[] {
  const lowerText = text.toLowerCase();
  return TECH_KEYWORDS.filter((keyword) => lowerText.includes(keyword));
}
