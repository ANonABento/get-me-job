/**
 * @route GET /api/bank/documents
 * @description List source documents for bank
 * @auth Required
 * @response BankDocumentsResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getSourceDocuments } from "@/lib/db/profile-bank";

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
