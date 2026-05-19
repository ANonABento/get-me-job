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
  createBasicDocumentParseRun,
  DocumentParseRunError,
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
    const parseRun = createBasicDocumentParseRun({
      documentId: params.id,
      userId: authResult.userId,
      artifactId: parsed.data.artifactId,
    });

    return NextResponse.json({ parseRun }, { status: 201 });
  } catch (error) {
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
