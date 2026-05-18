import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  gateAiFeature,
  isAiGateResponse,
  type AiGatePass,
} from "@/lib/billing/ai-gate";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import { isDocumentAssistantAction } from "@/lib/document-assistant";
import { rewriteDocumentSelection } from "@/lib/document-assistant.server";
import { nowEpoch } from "@/lib/format/time";

export const dynamic = "force-dynamic";

type DocumentAssistantRequestBody = {
  action?: unknown;
  selectedText?: unknown;
  documentContent?: unknown;
  jobDescription?: unknown;
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: AiGatePass | null = null;

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

    const gate = gateAiFeature(
      authResult.userId,
      "document_assistant",
      `${body.action}:${nowEpoch()}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

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
      gate.llmConfig,
    );

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Assistant returned an empty rewrite. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    aiGate?.refund();
    console.error(
      "Document assistant error:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json(
      { error: "Failed to rewrite selected text" },
      { status: 500 },
    );
  }
}
