/**
 * @route POST /api/tailor/autofix
 * @description Uses LLM to rewrite resume sections incorporating missing keywords
 * @auth Required
 * @request { resume: TailoredResume, keywordsMissing: string[], jobDescription: string }
 * @response { resume: TailoredResume }
 */
import { NextRequest, NextResponse } from "next/server";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import { extractJSON } from "@/lib/utils";
import { requireAuth, isAuthError } from "@/lib/auth";
import type { TailoredResume } from "@/lib/resume/generator";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { resume, keywordsMissing, jobDescription } = body as {
      resume: TailoredResume;
      keywordsMissing: string[];
      jobDescription: string;
    };

    if (!resume || !keywordsMissing?.length || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const llmConfig = getLLMConfig(authResult.userId);
    if (!llmConfig) {
      return NextResponse.json(
        { error: "No LLM provider configured. Visit Settings to set one up." },
        { status: 400 }
      );
    }

    const client = new LLMClient(llmConfig);

    const prompt = `You are a resume optimization expert. Rewrite the following resume to naturally incorporate these missing keywords while maintaining authenticity and readability.

MISSING KEYWORDS TO INCORPORATE:
${keywordsMissing.slice(0, 15).join(", ")}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

RULES:
- Only modify summary, experience highlights, and skills
- Keep contact info and education unchanged
- Incorporate keywords naturally — don't just list them
- Maintain the same JSON structure
- Keep it concise (one-page resume)

Return the improved resume as a JSON object with the same structure (contact, summary, experiences, skills, education).`;

    const response = await client.complete({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      maxTokens: 4096,
    });

    const parsed = extractJSON(response);
    const improved: TailoredResume = {
      contact: resume.contact,
      summary: typeof parsed.summary === "string" ? parsed.summary : resume.summary,
      experiences: Array.isArray(parsed.experiences)
        ? (parsed.experiences as TailoredResume["experiences"])
        : resume.experiences,
      skills: Array.isArray(parsed.skills)
        ? (parsed.skills as string[])
        : resume.skills,
      education: resume.education,
    };

    return NextResponse.json({ resume: improved });
  } catch (error) {
    console.error("Auto-fix error:", error);
    return NextResponse.json(
      { error: "Failed to auto-fix resume" },
      { status: 500 }
    );
  }
}
