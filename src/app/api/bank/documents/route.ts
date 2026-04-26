/**
 * @route GET /api/bank/documents
 * @description List source documents for bank
 * @auth Required
 * @response BankDocumentsResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, documents, profileBank, eq, and, desc, sqlOp } from "@/lib/db/drizzle";
import { toIsoDateString } from "@/lib/utils";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rows = await db
      .select({
        id: documents.id,
        filename: documents.filename,
        size: documents.size,
        uploadedAt: documents.uploadedAt,
        chunkCount: sqlOp<number>`count(${profileBank.id})`,
      })
      .from(documents)
      .innerJoin(
        profileBank,
        and(
          eq(profileBank.sourceDocumentId, documents.id),
          eq(profileBank.userId, authResult.userId)
        )
      )
      .where(eq(documents.userId, authResult.userId))
      .groupBy(documents.id, documents.filename, documents.size, documents.uploadedAt)
      .orderBy(desc(documents.uploadedAt));

    return NextResponse.json({
      documents: rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        size: row.size,
        uploadedAt: toIsoDateString(row.uploadedAt),
        chunkCount: Number(row.chunkCount),
      })),
    });
  } catch (error) {
    console.error("Get source documents error:", error);
    return NextResponse.json(
      { error: "Failed to get source documents" },
      { status: 500 }
    );
  }
}
