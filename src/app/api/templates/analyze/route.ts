/**
 * @route POST /api/templates/analyze
 * @description Analyze a resume template's styling and structure using LLM
 * @auth Required
 * @request { templateContent: string }
 * @response TemplateAnalyzeResponse from @/types/api
 */
import { NextRequest } from "next/server";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import { analyzeTemplateWithLLM } from "@/lib/resume/template-analyzer";
import { requireAuth, isAuthError } from "@/lib/auth";
import { ApiErrors, successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();

    if (!body.text || typeof body.text !== "string") {
      return ApiErrors.badRequest("Resume text is required");
    }

    if (body.text.trim().length < 50) {
      return ApiErrors.badRequest("Resume text is too short to analyze");
    }

    const llmConfig = getLLMConfig(authResult.userId);
    const llmClient = llmConfig ? new LLMClient(llmConfig) : null;

    const analyzed = await analyzeTemplateWithLLM(body.text, llmClient);

    return successResponse({
      analyzed,
      usedLLM: llmClient !== null,
    });
  } catch (error) {
    console.error("Template analysis error:", error);
    return errorResponse("internal_error", "Failed to analyze template");
  }
}
