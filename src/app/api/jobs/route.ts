import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJobs, createJob } from "@/lib/db/drizzle/queries";
import { getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { createJobSchema, TECH_KEYWORDS } from "@/lib/constants";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await getJobs(userId);
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const job = await createJob(userId, {
      ...data,
      requirements: data.requirements ?? [],
      responsibilities: data.responsibilities ?? [],
      keywords,
    });

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
