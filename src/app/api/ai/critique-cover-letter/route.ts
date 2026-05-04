import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import {
  buildCoverLetterCritiqueMessages,
  parseCoverLetterCritiqueResponse,
} from "@/lib/ai/critique-prompts";
import { getClientIdentifier, rateLimiters } from "@/lib/rate-limit";

const critiqueRequestSchema = z.object({
  letter: z.string().trim().min(20, "Cover letter draft is too short."),
  jd: z.string().trim().min(20, "Job description is too short."),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const clientId = getClientIdentifier(request, authResult.userId);
  const rateLimit = rateLimiters.llm(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 },
    );
  }

  try {
    const parseResult = critiqueRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid critique request.",
          issues: parseResult.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const llmConfig = getLLMConfig(authResult.userId);
    if (!llmConfig) {
      return NextResponse.json(
        { error: "No LLM provider configured. Go to Settings to set one up." },
        { status: 400 },
      );
    }

    const client = new LLMClient(llmConfig);
    const rawResponse = await client.complete({
      messages: buildCoverLetterCritiqueMessages(parseResult.data),
      temperature: 0.2,
      maxTokens: 1800,
    });

    return NextResponse.json({
      success: true,
      critique: parseCoverLetterCritiqueResponse(rawResponse),
    });
  } catch (error) {
    console.error("Cover letter critique error:", error);
    return NextResponse.json(
      { error: "Failed to critique cover letter", details: String(error) },
      { status: 500 },
    );
  }
}
