/**
 * @route GET/POST /api/documents/[id]/parse-runs
 * @description List or create parser-v2 parse runs for a document
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getDocumentArtifact,
  getLatestDocumentArtifact,
  listDocumentParseRuns,
  saveDocumentParseRun,
  type ParseWarning,
} from "@/lib/db";
import { parseResumeV2FromSourceMap } from "@/lib/ingest/parse-resume-v2";

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

  if (parsed.data.mode !== "basic") {
    return NextResponse.json(
      { error: "Only basic parser-v2 mode is available in this phase" },
      { status: 400 },
    );
  }

  try {
    const artifact = parsed.data.artifactId
      ? getDocumentArtifact(parsed.data.artifactId, authResult.userId)
      : getLatestDocumentArtifact(params.id, authResult.userId);

    if (!artifact || artifact.documentId !== params.id) {
      return NextResponse.json(
        { error: "Document artifact not found" },
        { status: 404 },
      );
    }

    const structured = parseResumeV2FromSourceMap(artifact.sourceMap);
    const warnings: ParseWarning[] = structured.warnings.map((message) => ({
      code: "parser_warning",
      message,
      severity: "warning",
    }));
    const parseRun = saveDocumentParseRun({
      documentId: params.id,
      artifactId: artifact.id,
      userId: authResult.userId,
      mode: "basic",
      status: "ready",
      confidence: structured.confidence,
      warnings,
      structured,
    });

    return NextResponse.json({ parseRun }, { status: 201 });
  } catch (error) {
    console.error("Create document parse run error:", error);
    return NextResponse.json(
      { error: "Failed to create document parse run" },
      { status: 500 },
    );
  }
}
