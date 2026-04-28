/**
 * @route GET /api/documents
 * @description List all uploaded documents
 * @auth Required
 * @response DocumentsListResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocuments, getDocumentsByType } from "@/lib/db";
import { documentTypeSchema } from "@/lib/constants/documents";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const type = request.nextUrl.searchParams.get("type");

    if (!type) {
      return NextResponse.json({ documents: getDocuments(authResult.userId) });
    }

    const parsedType = documentTypeSchema.safeParse(type);
    if (!parsedType.success) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      documents: getDocumentsByType(parsedType.data, authResult.userId),
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
