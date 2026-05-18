/**
 * @route POST /api/email/generate
 * @description Generate an email from a template or via LLM based on job and profile context
 * @auth Required
 * @request { jobId: string, templateType: string, customPrompt?: string }
 * @response EmailGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { generateEmail, EMAIL_TEMPLATE_INFO } from "@/lib/email/templates";
import { generateEmailSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { buildEmailGenerationPrompt } from "@/lib/email/prompt-builders";
import {
  detectGenericPhrases,
  mergeGenericPhraseMatches,
} from "@/lib/ai/prompt-quality";

export const dynamic = "force-dynamic";

interface LLMEmailResponse {
  subject: string;
  body: string;
  selfCheck?: {
    evidencePoint: string;
    matchedReason: string;
    unsupportedFacts: string[];
    genericPhrases: string[];
    hasClearCTA: boolean;
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = generateEmailSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 },
      );
    }

    const { type, jobId, useLLM, ...contextParams } = parseResult.data;

    if (type === "daily_digest") {
      return NextResponse.json(
        { error: "daily_digest is a system email type" },
        { status: 400 },
      );
    }

    if (!EMAIL_TEMPLATE_INFO[type]) {
      return NextResponse.json(
        { error: "Invalid email type" },
        { status: 400 },
      );
    }

    const profile = getProfile(authResult.userId);
    const job = jobId ? getJob(jobId, authResult.userId) : undefined;

    const context = {
      job: job || undefined,
      profile: profile || undefined,
      ...contextParams,
    };

    // Try LLM-enhanced generation first
    let fallbackReason: "provider_not_configured" | "llm_error" | null = null;
    if (useLLM) {
      const gate = gateOptionalAiFeature(
        authResult.userId,
        "email",
        `${type}:${jobId ?? "general"}`,
      );
      if (isAiGateResponse(gate)) return gate;
      aiGate = gate;
      fallbackReason = gate.llmConfig ? null : "provider_not_configured";
      if (gate.llmConfig) {
        try {
          const client = new LLMClient(gate.llmConfig);
          const templateInfo = EMAIL_TEMPLATE_INFO[type];

          const prompt = buildEmailGenerationPrompt({
            templateInfo,
            profile: profile || undefined,
            job: job || undefined,
            contextParams,
            type,
          });

          const response = await client.complete({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            maxTokens: 1000,
          });

          const parsed = parseJSONFromLLM<LLMEmailResponse>(response);
          if (parsed.subject && parsed.body) {
            const selfCheck = parsed.selfCheck
              ? {
                  ...parsed.selfCheck,
                  genericPhrases: mergeGenericPhraseMatches(
                    parsed.selfCheck.genericPhrases,
                    detectGenericPhrases(parsed.body),
                  ),
                }
              : undefined;

            return NextResponse.json({
              success: true,
              email: {
                subject: parsed.subject,
                body: parsed.body,
                placeholders: [],
              },
              ...(selfCheck ? { selfCheck } : {}),
              usedLLM: true,
              fallbackUsed: false,
              fallbackReason: null,
            });
          }
        } catch (llmError) {
          aiGate?.refund();
          fallbackReason = "llm_error";
          console.error(
            "LLM generation failed, falling back to template:",
            llmError,
          );
        }
      }
    }

    // Fallback to template-based generation
    const email = generateEmail(type, context);

    return NextResponse.json({
      success: true,
      email,
      usedLLM: false,
      fallbackUsed: useLLM,
      fallbackReason: useLLM ? fallbackReason : null,
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 },
    );
  }
}
