/**
 * @route GET /api/bank/documents/[id]/text
 * @description Return stored extracted text for non-PDF source previews.
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";

import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocument } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const documentId = params.id;
  if (!documentId) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }

  const document = getDocument(documentId, authResult.userId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const extractedText = document.extractedText?.trim();
  if (!extractedText) {
    return NextResponse.json(
      { error: "Text preview not available" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    document: {
      id: document.id,
      filename: document.filename,
      mimeType: document.mimeType,
      extractedText,
    },
  });
}
