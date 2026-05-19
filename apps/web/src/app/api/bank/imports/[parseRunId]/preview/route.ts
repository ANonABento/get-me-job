/**
 * @route GET /api/bank/imports/[parseRunId]/preview
 * @description Return parser-v2 review components without committing them
 * @auth Required
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocumentArtifact, getDocumentParseRunById } from "@/lib/db";
import { buildParseRunReviewEntries } from "@/lib/ingest/parse-run-bank-import";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { parseRunId: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseRun = getDocumentParseRunById(
      params.parseRunId,
      authResult.userId,
    );
    if (!parseRun) {
      return NextResponse.json(
        { error: "Parse run not found" },
        { status: 404 },
      );
    }
    if (parseRun.status !== "ready") {
      return NextResponse.json(
        { error: "Parse run is not ready for review" },
        { status: 409 },
      );
    }

    const artifact = getDocumentArtifact(
      parseRun.artifactId,
      authResult.userId,
    );
    if (!artifact || artifact.documentId !== parseRun.documentId) {
      return NextResponse.json(
        { error: "Document artifact not found" },
        { status: 404 },
      );
    }

    const entries = buildParseRunReviewEntries({
      parseRun,
      sourceMap: artifact.sourceMap,
    });

    return NextResponse.json({
      parseRunId: parseRun.id,
      documentId: parseRun.documentId,
      artifactId: parseRun.artifactId,
      entries,
    });
  } catch (error) {
    console.error("Preview parse run import error:", error);
    return NextResponse.json(
      { error: "Failed to preview parse run import" },
      { status: 500 },
    );
  }
}
