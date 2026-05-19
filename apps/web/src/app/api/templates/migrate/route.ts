import { nowEpoch } from "@/lib/format/time";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { saveTemplateMigrationDraft } from "@/lib/db/template-migrations";
import { LLMClient } from "@/lib/llm/client";
import { createTemplateMigrationDraft } from "@/lib/resume/template-migration";
import { getClientIdentifier, rateLimiters } from "@/lib/rate-limit";
import {
  getTemplateSourceType,
  type TemplateSourceType,
} from "@/lib/templates/import";

export const dynamic = "force-dynamic";

const MAX_TEMPLATE_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  const rateLimit = rateLimiters.standard(
    getClientIdentifier(request, authResult.userId),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many visual template import requests.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(
            1,
            Math.ceil((rateLimit.resetAt - nowEpoch()) / 1000),
          ).toString(),
        },
      },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!isUploadedFile(file)) {
      return NextResponse.json(
        {
          error: "A PDF, DOCX, or LaTeX .tex file is required.",
          code: "missing_file",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_TEMPLATE_FILE_BYTES) {
      return NextResponse.json(
        {
          error: "Template files must be 10MB or smaller.",
          code: "file_too_large",
        },
        { status: 400 },
      );
    }

    const sourceType = getTemplateSourceType(file.name, file.type);
    if (!sourceType || !(await hasExpectedSignature(file, sourceType))) {
      return NextResponse.json(
        {
          error: "Upload a valid PDF, DOCX, or LaTeX .tex file.",
          code: "unsupported_file_type",
        },
        { status: 400 },
      );
    }

    const gate = gateOptionalAiFeature(
      authResult.userId,
      "document_assistant",
      `visual-template-import:${nowEpoch()}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    const llmClient = gate.llmConfig ? new LLMClient(gate.llmConfig) : null;
    const draft = await createTemplateMigrationDraft({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      mimeType: file.type,
      userId: authResult.userId,
      llmClient,
    });
    saveTemplateMigrationDraft(draft);

    const usedLLM = llmClient !== null;
    return NextResponse.json({
      draft: publicDraft(draft),
      warnings: draft.warnings,
      confidence: draft.confidence,
      usedLLM,
      fallbackUsed: !usedLLM,
      fallbackReason: usedLLM ? null : "provider_not_configured",
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Visual template import error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "We couldn't read enough visual structure from that file.",
        code: "layout_import_failed",
        ...(process.env.NODE_ENV === "production" ? {} : { detail }),
      },
      { status: 422 },
    );
  }
}

async function hasExpectedSignature(
  file: File,
  sourceType: TemplateSourceType,
): Promise<boolean> {
  if (sourceType === "tex") return true;
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (sourceType === "pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44;
  }
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).name === "string" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).slice === "function"
  );
}

function publicDraft<T extends { userId?: string }>(
  draft: T,
): Omit<T, "userId"> {
  const { userId: _userId, ...rest } = draft;
  return rest;
}
