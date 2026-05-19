/**
 * @route GET /api/documents/[id]/source-map
 * @description Return parser-v2 source-map data and optional parse-run refs
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getDocumentParseRun,
  getLatestDocumentArtifact,
  listDocumentParseRuns,
} from "@/lib/db";
import {
  createParserV2Diagnostic,
  createParserV2SourceRefs,
  isParsedResumeV2Result,
} from "@/lib/ingest/diagnostics";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const artifact = getLatestDocumentArtifact(params.id, authResult.userId);
    if (!artifact) {
      return NextResponse.json(
        { error: "Document artifact not found" },
        { status: 404 },
      );
    }

    const requestedParseRunId =
      request.nextUrl.searchParams.get("parseRunId") ?? undefined;
    const parseRun = requestedParseRunId
      ? getDocumentParseRun(requestedParseRunId, params.id, authResult.userId)
      : (listDocumentParseRuns(params.id, authResult.userId).find(
          (run) => run.artifactId === artifact.id && run.status === "ready",
        ) ?? null);

    if (requestedParseRunId && !parseRun) {
      return NextResponse.json(
        { error: "Document parse run not found" },
        { status: 404 },
      );
    }

    const diagnostic =
      parseRun && isParsedResumeV2Result(parseRun.structured)
        ? createParserV2Diagnostic(artifact.sourceMap, parseRun.structured)
        : null;
    const sourceRefs =
      parseRun && isParsedResumeV2Result(parseRun.structured)
        ? createParserV2SourceRefs(artifact.sourceMap, parseRun.structured)
        : [];

    return NextResponse.json({
      artifact,
      sourceMap: artifact.sourceMap,
      sourceText: artifact.sourceMap.rawText,
      parseRun,
      sourceRefs,
      diagnostic,
    });
  } catch (error) {
    console.error("Get document source map error:", error);
    return NextResponse.json(
      { error: "Failed to get document source map" },
      { status: 500 },
    );
  }
}
