/**
 * @route GET /api/bank/documents
 * @route DELETE /api/bank/documents
 * @description List source documents for bank
 * @auth Required
 * @response BankDocumentsResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { deleteSourceDocuments, getSourceDocuments } from "@/lib/db/profile-bank";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    return NextResponse.json({ documents: getSourceDocuments(authResult.userId) });
  } catch (error) {
    console.error("Get source documents error:", error);
    return NextResponse.json(
      { error: "Failed to get source documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const documentIds =
      typeof body === "object" && body !== null
        ? (body as { documentIds?: unknown }).documentIds
        : undefined;

    if (
      !Array.isArray(documentIds) ||
      documentIds.length === 0 ||
      !documentIds.every((id) => typeof id === "string" && id.trim().length > 0)
    ) {
      return NextResponse.json(
        { error: "documentIds must be a non-empty array of document ids" },
        { status: 400 }
      );
    }

    const result = deleteSourceDocuments(documentIds, authResult.userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Delete source documents error:", error);
    return NextResponse.json(
      { error: "Failed to delete source documents" },
      { status: 500 }
    );
  }
}
