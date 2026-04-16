/**
 * @route GET /api/documents
 * @description List all uploaded documents
 * @auth Required
 * @response DocumentsListResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const documents = getDocuments(authResult.userId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
