/**
 * @route GET /api/documents/[id]/artifact
 * @description Return the latest source-map artifact for a document
 * @auth Required
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getLatestDocumentArtifact } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

    return NextResponse.json({ artifact });
  } catch (error) {
    console.error("Get document artifact error:", error);
    return NextResponse.json(
      { error: "Failed to get document artifact" },
      { status: 500 },
    );
  }
}
