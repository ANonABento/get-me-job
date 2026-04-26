/**
 * @route GET /api/documents
 * @description List all uploaded documents
 * @auth Required
 * @response DocumentsListResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { db, documents, desc, eq } from "@/lib/db/drizzle";
import { requireAuth, isAuthError } from "@/lib/auth";
import { toIsoDateString } from "@/lib/utils";
import type { Document } from "@/types";

function toDocument(row: typeof documents.$inferSelect): Document {
  return {
    id: row.id,
    filename: row.filename,
    type: row.type as Document["type"],
    mimeType: row.mimeType,
    size: row.size,
    path: row.path,
    extractedText: row.extractedText ?? undefined,
    parsedData: row.parsedData
      ? (JSON.parse(row.parsedData) as Document["parsedData"])
      : undefined,
    uploadedAt: toIsoDateString(row.uploadedAt),
  };
}

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rows = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, authResult.userId))
      .orderBy(desc(documents.uploadedAt));

    return NextResponse.json({
      documents: rows.map(toDocument),
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}
