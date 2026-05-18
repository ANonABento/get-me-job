/**
 * @route GET /api/documents/[id]/preview/pdf
 * @description Stream the stored PDF file for parser-v2 source preview
 * @auth Required
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocument } from "@/lib/db";

export const dynamic = "force-dynamic";

function isPdfDocument(document: { filename: string; mimeType: string }) {
  return (
    document.mimeType === "application/pdf" ||
    document.filename.toLowerCase().endsWith(".pdf")
  );
}

function resolveStoredDocumentPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

function inlineFilename(filename: string): string {
  return filename.replace(/["\r\n]/g, "").trim() || "document.pdf";
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const document = getDocument(params.id, authResult.userId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!isPdfDocument(document)) {
    return NextResponse.json(
      { error: "PDF preview is only available for PDF documents" },
      { status: 415 },
    );
  }

  try {
    const bytes = await readFile(resolveStoredDocumentPath(document.path));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${inlineFilename(
          document.filename,
        )}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const code =
      error && typeof error === "object"
        ? (error as { code?: string }).code
        : undefined;
    if (code === "ENOENT") {
      return NextResponse.json(
        { error: "Document file not found" },
        { status: 404 },
      );
    }

    console.error("Get document PDF preview error:", error);
    return NextResponse.json(
      { error: "Failed to get document PDF preview" },
      { status: 500 },
    );
  }
}
