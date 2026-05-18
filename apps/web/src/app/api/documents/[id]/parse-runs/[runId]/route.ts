/**
 * @route GET /api/documents/[id]/parse-runs/[runId]
 * @description Return a parser-v2 parse run
 * @auth Required
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocumentParseRun } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string; runId: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseRun = getDocumentParseRun(
      params.runId,
      params.id,
      authResult.userId,
    );
    if (!parseRun) {
      return NextResponse.json(
        { error: "Document parse run not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ parseRun });
  } catch (error) {
    console.error("Get document parse run error:", error);
    return NextResponse.json(
      { error: "Failed to get document parse run" },
      { status: 500 },
    );
  }
}
