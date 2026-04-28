import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getLLMConfig, getProfile } from "@/lib/db";
import { getGroupedBankEntries } from "@/lib/db/profile-bank";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import {
  generateCoverLetter,
  reviseCoverLetter,
  rewriteCoverLetterSelection,
  getTotalBankEntries,
} from "@/lib/cover-letter/generate";
import type { CoverLetterInput } from "@/lib/cover-letter/generate";

const COVER_LETTER_ACTIONS = ["generate", "revise", "rewrite"] as const;
type CoverLetterAction = (typeof COVER_LETTER_ACTIONS)[number];

function isCoverLetterAction(action: unknown): action is CoverLetterAction {
  return (
    typeof action === "string" &&
    COVER_LETTER_ACTIONS.includes(action as CoverLetterAction)
  );
}

/**
 * POST /api/cover-letter/generate
 *
 * Body: {
 *   jobDescription: string;
 *   jobTitle?: string;
 *   company?: string;
 *   action: "generate" | "revise" | "rewrite";
 *   currentContent?: string;   // required for "revise" and "rewrite"
 *   instruction?: string;      // required for "revise" and "rewrite"
 *   selectedText?: string;     // required for "rewrite"
 * }
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const clientId = getClientIdentifier(request, authResult.userId);
  const rateLimit = rateLimiters.llm(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      jobDescription,
      jobTitle,
      company,
      action = "generate",
      currentContent,
      selectedText,
      instruction,
      selectedText,
    } = body as {
      jobDescription?: string;
      jobTitle?: string;
      company?: string;
      action?: unknown;
      currentContent?: string;
      selectedText?: string;
      instruction?: string;
      selectedText?: string;
    };

    if (!isCoverLetterAction(action)) {
      return NextResponse.json(
        { error: "Unsupported cover letter action." },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "Job description is too short. Please paste the full JD." },
        { status: 400 }
      );
    }

    if (action !== "generate" && action !== "revise" && action !== "rewrite") {
      return NextResponse.json(
        { error: "Unsupported cover letter action." },
        { status: 400 }
      );
    }

    const llmConfig = getLLMConfig(authResult.userId);
    if (!llmConfig) {
      return NextResponse.json(
        { error: "No LLM provider configured. Go to Settings to set one up." },
        { status: 400 }
      );
    }

    const bankEntries = getGroupedBankEntries(authResult.userId);
    if (getTotalBankEntries(bankEntries) === 0) {
      return NextResponse.json(
        {
          error:
            "No knowledge bank entries found. Upload a resume first to populate your bank.",
        },
        { status: 400 }
      );
    }

    const profile = getProfile(authResult.userId);
    const userName = profile?.contact?.name;

    const input: CoverLetterInput = {
      jobDescription: jobDescription.trim(),
      jobTitle,
      company,
      bankEntries,
      userName,
    };

    if (action === "revise") {
      if (!currentContent?.trim() || !instruction?.trim()) {
        return NextResponse.json(
          { error: "currentContent and instruction are required for revision." },
          { status: 400 }
        );
      }

      const revised = await reviseCoverLetter(
        currentContent,
        instruction.trim(),
        input,
        llmConfig
      );

      return NextResponse.json({ success: true, content: revised });
    }

    if (action === "rewrite") {
      if (
        !currentContent?.trim() ||
        !selectedText?.trim() ||
        !instruction?.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "currentContent, selectedText, and instruction are required for rewriting.",
          },
          { status: 400 }
        );
      }

      const rewritten = await rewriteCoverLetterSelection(
        currentContent,
        selectedText,
        instruction.trim(),
        input,
        llmConfig
      );

      return NextResponse.json({ success: true, content: rewritten });
    }

    // action === "generate"
    const content = await generateCoverLetter(input, llmConfig);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter", details: String(error) },
      { status: 500 }
    );
  }
}
