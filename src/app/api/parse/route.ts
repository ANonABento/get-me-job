import { NextRequest, NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/auth";
import { parseDocumentSchema } from "@/features/documents/schemas";
import { getDocuments, getLLMConfig, getProfile, updateProfile } from "@/lib/db";
import { parseResumeBasic, parseResumeWithLLM } from "@/lib/parser/resume";

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

    // Find the document
    const documents = getDocuments();
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

    // Get LLM config
    const llmConfig = getLLMConfig();

    let parsedProfile;
    if (llmConfig) {
      // Use LLM for parsing
      try {
        parsedProfile = await parseResumeWithLLM(doc.extractedText, llmConfig);
      } catch (llmError) {
        console.error("LLM parsing failed, falling back to basic:", llmError);
        parsedProfile = parseResumeBasic(doc.extractedText);
      }
    } else {
      // Use basic regex parsing
      parsedProfile = parseResumeBasic(doc.extractedText);
    }

    // Save to profile
    updateProfile(parsedProfile);

    // Get updated profile
    const profile = getProfile();

    return NextResponse.json({
      success: true,
      profile,
      usedLLM: !!llmConfig,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Parse failed" },
      { status: 500 }
    );
  }
}
