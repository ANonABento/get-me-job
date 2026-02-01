import { NextRequest, NextResponse } from "next/server";
import { getDocuments, getLLMConfig, updateProfile, getProfile } from "@/lib/db";
import { parseResumeWithLLM, parseResumeBasic } from "@/lib/parser/resume";

export async function POST(request: NextRequest) {
  try {
    const { filename, documentId } = await request.json();

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
      { error: "Parse failed", details: String(error) },
      { status: 500 }
    );
  }
}
