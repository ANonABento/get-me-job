/**
 * @route GET/POST /api/documents/[id]/parse-runs
 * @description List or create parser-v2 parse runs for a document
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { listDocumentParseRuns } from "@/lib/db";
import {
  gateAiFeature,
  isAiGateResponse,
  type AiGatePass,
} from "@/lib/billing/ai-gate";
import {
  createAiDocumentParseRun,
  createBasicDocumentParseRun,
  DocumentParseRunError,
  resolveReadyDocumentArtifact,
} from "@/lib/ingest/document-parse-run";

export const dynamic = "force-dynamic";

const createParseRunSchema = z.object({
  mode: z.enum(["basic", "ai", "hybrid"]).default("basic"),
  artifactId: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    return NextResponse.json({
      parseRuns: listDocumentParseRuns(params.id, authResult.userId),
    });
  } catch (error) {
    console.error("List document parse runs error:", error);
    return NextResponse.json(
      { error: "Failed to list document parse runs" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: AiGatePass | null = null;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = createParseRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    if (parsed.data.mode === "ai") {
      // Check artifact readiness before billing/gating the explicit AI parse.
      resolveReadyDocumentArtifact({
        documentId: params.id,
        userId: authResult.userId,
        artifactId: parsed.data.artifactId,
      });
      const gate = gateAiFeature(
        authResult.userId,
        "tailor",
        `document-parse-run:${params.id}`,
      );
      if (isAiGateResponse(gate)) return gate;
      aiGate = gate;
      const parseRun = await createAiDocumentParseRun({
        documentId: params.id,
        userId: authResult.userId,
        artifactId: parsed.data.artifactId,
        llmConfig: gate.llmConfig,
      });
      return NextResponse.json({ parseRun }, { status: 201 });
    }

    const parseRun = createBasicDocumentParseRun({
      documentId: params.id,
      userId: authResult.userId,
      artifactId: parsed.data.artifactId,
    });

    return NextResponse.json({ parseRun }, { status: 201 });
  } catch (error) {
    aiGate?.refund();
    if (error instanceof DocumentParseRunError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status },
      );
    }
    console.error("Create document parse run error:", error);
    return NextResponse.json(
      { error: "Failed to create document parse run" },
      { status: 500 },
    );
  }
}
