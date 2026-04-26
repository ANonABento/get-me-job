/**
 * @route GET /api/documents
 * @description List all uploaded documents
 * @auth Required
 * @response DocumentsListResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocuments } from "@/lib/db";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    return NextResponse.json({ documents: getDocuments(authResult.userId) });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
