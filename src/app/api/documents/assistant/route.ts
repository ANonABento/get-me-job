import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getLLMConfig } from "@/lib/db";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import {
  isDocumentAssistantAction,
  rewriteDocumentSelection,
} from "@/lib/document-assistant";

type DocumentAssistantRequestBody = {
  action?: unknown;
  selectedText?: unknown;
  documentContent?: unknown;
  jobDescription?: unknown;
};

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

  let body: DocumentAssistantRequestBody;

  try {
    body = (await request.json()) as DocumentAssistantRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    if (!isDocumentAssistantAction(body.action)) {
      return NextResponse.json(
        { error: "Unsupported assistant action." },
        { status: 400 },
      );
    }

    if (
      typeof body.selectedText !== "string" ||
      body.selectedText.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Select text before asking the assistant to rewrite it." },
        { status: 400 },
      );
    }

    if (typeof body.documentContent !== "string") {
      return NextResponse.json(
        { error: "Document content is required." },
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

    const content = await rewriteDocumentSelection(
      {
        action: body.action,
        selectedText: body.selectedText,
        documentContent: body.documentContent,
        jobDescription:
          typeof body.jobDescription === "string"
            ? body.jobDescription
            : undefined,
      },
      llmConfig,
    );

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Assistant returned an empty rewrite. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Document assistant error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite selected text", details: String(error) },
      { status: 500 },
    );
  }
}
