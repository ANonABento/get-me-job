import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJobs, createJob } from "@/lib/db/jobs";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    const jobs = getJobs();
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

    const data = await request.json();

    if (!data.title || !data.company || !data.description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }

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

        // Parse response
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith("```json")) {
          cleanResponse = cleanResponse.slice(7);
        }
        if (cleanResponse.startsWith("```")) {
          cleanResponse = cleanResponse.slice(3);
        }
        if (cleanResponse.endsWith("```")) {
          cleanResponse = cleanResponse.slice(0, -3);
        }
        keywords = JSON.parse(cleanResponse.trim());
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
  const techKeywords = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
    "react", "vue", "angular", "node", "express", "django", "flask",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
    "sql", "postgresql", "mysql", "mongodb", "redis",
    "git", "ci/cd", "jenkins", "github actions",
    "agile", "scrum", "jira", "confluence",
    "rest", "graphql", "api", "microservices",
    "machine learning", "ai", "data science", "analytics",
  ];

  const lowerText = text.toLowerCase();
  return techKeywords.filter((kw) => lowerText.includes(kw));
}
