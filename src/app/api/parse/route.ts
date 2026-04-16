/**
 * @route POST /api/parse
 * @description Parse resume from uploaded document and extract profile data
 * @auth Required
 * @request { documentId: string; strategy?: string }
 * @response ParseResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getDocuments, getLLMConfig, updateProfile, getProfile } from "@/lib/db";
import { parseResumeWithLLM, parseResumeBasic } from "@/lib/parser/resume";
import { parseDocumentSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { populateBankFromProfile } from "@/lib/resume/info-bank";
import type { LLMConfig, Profile } from "@/types";

export interface ParseResumeResult {
  parsedProfile: Partial<Profile>;
  parsingMethod: "ai" | "basic";
  llmFallback: boolean;
}

async function parseResumeText(
  text: string,
  llmConfig: LLMConfig | null
): Promise<ParseResumeResult> {
  if (llmConfig) {
    try {
      const parsedProfile = await parseResumeWithLLM(text, llmConfig);
      return { parsedProfile, parsingMethod: "ai", llmFallback: false };
    } catch (llmError) {
      console.error("LLM parsing failed, falling back to basic:", llmError);
      const parsedProfile = parseResumeBasic(text);
      return { parsedProfile, parsingMethod: "basic", llmFallback: true };
    }
  }

  console.log("No LLM configured — using basic regex parsing");
  const parsedProfile = parseResumeBasic(text);
  return { parsedProfile, parsingMethod: "basic", llmFallback: false };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

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
        { status: 400 }
      );
    }

    const { filename, documentId } = parseResult.data;

    console.log(`[parse] Starting parse for document ${documentId || filename}`);

    // Find the document
    const documents = getDocuments(authResult.userId);
    const doc = documents.find(
      (d) => d.id === documentId || d.filename === filename
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!doc.extractedText) {
      return NextResponse.json(
        { error: "No text extracted from document" },
        { status: 400 }
      );
    }

    // Get LLM config and parse resume
    const llmConfig = getLLMConfig();
    console.log(`[parse] LLM config: ${llmConfig ? llmConfig.provider : "none"}`);

    const { parsedProfile, parsingMethod, llmFallback } = await parseResumeText(
      doc.extractedText,
      llmConfig
    );

    const sections = Object.keys(parsedProfile).filter(k => parsedProfile[k as keyof typeof parsedProfile] != null);
    console.log(`[parse] Parse complete: ${sections.join(", ")}`);

    // Save to profile
    updateProfile(parsedProfile, authResult.userId);

    // Populate information bank from parsed profile (non-fatal)
    try {
      populateBankFromProfile(parsedProfile, doc.id, authResult.userId);
    } catch (bankError) {
      console.error("[parse] Bank population failed:", bankError instanceof Error ? bankError.stack : bankError);
    }

    // Get updated profile
    const profile = getProfile(authResult.userId);

    return NextResponse.json({
      success: true,
      profile,
      parsingMethod,
      llmFallback,
      llmConfigured: !!llmConfig,
    });
  } catch (error) {
    console.error("[parse] Parse error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: "Parse failed" },
      { status: 500 }
    );
  }
}
