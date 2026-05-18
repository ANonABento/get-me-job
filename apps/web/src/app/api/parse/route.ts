/**
 * @route POST /api/parse
 * @description Parse resume from uploaded document and extract profile data
 * @auth Required
 * @request { documentId: string; strategy?: string }
 * @response ParseResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getDocuments, updateProfile, getProfile } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { parseResumeWithLLM } from "@/lib/parser/resume";
import { smartParseResume } from "@/lib/parser/smart-parser";
import { parseDocumentSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { populateBankFromProfile } from "@/lib/resume/info-bank";
import { mergeParsedProfileForAutoPromote } from "@/lib/profile/auto-promote";
import { CREDIT_COSTS } from "@/lib/db/credits";
import type { LLMConfig, Profile } from "@/types";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

export interface ParseResumeResult {
  parsedProfile: Partial<Profile>;
  parsingMethod: "ai" | "basic";
  llmFallback: boolean;
  parsingMode: "basic" | "ai";
  creditsUsed: number;
  creditSource: "self-host" | "byok" | "credits" | "none";
}

async function parseResumeText(
  text: string,
  mode: "basic" | "ai",
  llmConfig: LLMConfig | null,
  creditSource: "self-host" | "byok" | "credits" | "none",
): Promise<ParseResumeResult> {
  const parseWithSmartFallback = async () => {
    const result = await smartParseResume(text, null);
    return result.profile;
  };

  if (mode === "ai" && llmConfig) {
    try {
      const parsedProfile = await parseResumeWithLLM(text, llmConfig);
      return {
        parsedProfile,
        parsingMethod: "ai",
        llmFallback: false,
        parsingMode: "ai",
        creditsUsed: 0,
        creditSource,
      };
    } catch (llmError) {
      console.error("LLM parsing failed, falling back to basic:", llmError);
      const parsedProfile = await parseWithSmartFallback();
      return {
        parsedProfile,
        parsingMethod: "basic",
        llmFallback: true,
        parsingMode: "ai",
        creditsUsed: 0,
        creditSource: "none",
      };
    }
  }

  log.debug("parse", "no LLM configured; using basic regex parsing");
  const parsedProfile = await parseWithSmartFallback();
  return {
    parsedProfile,
    parsingMethod: "basic",
    llmFallback: false,
    parsingMode: "basic",
    creditsUsed: 0,
    creditSource: "none",
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = parseDocumentSchema.safeParse(rawData);
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

    const { filename, documentId, mode = "basic" } = parseResult.data;

    if (!documentId && !filename) {
      return NextResponse.json(
        { error: "Either documentId or filename is required" },
        { status: 400 },
      );
    }

    log.debug("parse", "starting parse", {
      filename,
    });

    // Find the document
    const documents = getDocuments(authResult.userId);
    const doc = documents.find((d) =>
      documentId ? d.id === documentId : d.filename === filename,
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (!doc.extractedText) {
      return NextResponse.json(
        { error: "No text extracted from document" },
        { status: 400 },
      );
    }

    const gate =
      mode === "ai"
        ? gateOptionalAiFeature(authResult.userId, "tailor", `parse:${doc.id}`)
        : null;

    let llmConfigured = false;
    let parsingResult: ParseResumeResult;

    if (mode === "ai") {
      if (!gate || (gate && isAiGateResponse(gate))) {
        if (gate && isAiGateResponse(gate)) {
          return gate;
        }
        return NextResponse.json(
          { error: "AI gate unavailable" },
          { status: 500 },
        );
      }

      aiGate = gate;
      llmConfigured = !!gate.llmConfig;
      log.debug("parse", "LLM config loaded", {
        provider: gate.llmConfig?.provider ?? "none",
      });

      const result = await parseResumeText(
        doc.extractedText,
        "ai",
        gate.llmConfig,
        gate.source,
      );
      parsingResult = result.llmFallback
        ? { ...result, creditsUsed: 0, creditSource: "none" }
        : {
            ...result,
            creditsUsed: gate.source === "credits" ? CREDIT_COSTS.tailor : 0,
            creditSource: gate.source,
          };
      if (result.llmFallback) {
        aiGate.refund();
      }
    } else {
      parsingResult = await parseResumeText(
        doc.extractedText,
        "basic",
        null,
        "none",
      );
    }

    const {
      parsedProfile,
      parsingMethod,
      llmFallback,
      parsingMode,
      creditsUsed,
      creditSource,
    } = parsingResult;

    const sections = Object.keys(parsedProfile).filter(
      (k) => parsedProfile[k as keyof typeof parsedProfile] != null,
    );
    log.debug("parse", "parse complete", { sections });

    // Save only into empty profile fields, preserving manual edits.
    const existingProfile = getProfile(authResult.userId);
    const promoted = mergeParsedProfileForAutoPromote(
      existingProfile,
      parsedProfile,
    );
    if (Object.keys(promoted).length > 0) {
      updateProfile(promoted, authResult.userId);
    }

    // Populate information bank from parsed profile (non-fatal)
    try {
      populateBankFromProfile(parsedProfile, doc.id, authResult.userId);
    } catch (bankError) {
      console.error(
        "[parse] Bank population failed:",
        bankError instanceof Error ? bankError.stack : bankError,
      );
    }

    // Get updated profile
    const profile = getProfile(authResult.userId);

    return NextResponse.json({
      success: true,
      profile,
      parsingMethod,
      llmFallback,
      llmConfigured,
      parsingMode,
      creditsUsed,
      creditSource,
    });
  } catch (error) {
    aiGate?.refund();
    console.error(
      "[parse] Parse error:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}
