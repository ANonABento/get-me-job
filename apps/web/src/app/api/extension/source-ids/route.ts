/**
 * @route GET /api/extension/source-ids?source=<scraperKey>
 * @description Returns the user's already-imported sourceJobIds for a given
 *   source (e.g. "waterloo_works"). Used by the bulk-scrape orchestrator's
 *   pre-row dupe filter so we skip postings the user has already imported.
 * @auth Extension token via X-Extension-Token
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { listSourceJobIds } from "@/lib/db/jobs";

export async function GET(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const source = request.nextUrl.searchParams.get("source")?.trim();
  if (!source) {
    return NextResponse.json(
      { error: "source query param is required" },
      { status: 400 },
    );
  }

  try {
    const ids = listSourceJobIds(source, authResult.userId);
    return NextResponse.json({ ids });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
