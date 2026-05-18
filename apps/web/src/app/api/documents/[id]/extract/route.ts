/**
 * @route POST /api/documents/[id]/extract
 * @description Extract and persist a parser-v2 source artifact for a document
 * @auth Required
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getDocument, saveDocumentArtifact } from "@/lib/db";
import { extractDocumentSourceMap } from "@/lib/ingest/extract-document";

export const dynamic = "force-dynamic";

function resolveStoredDocumentPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

function diagnosticsForArtifact(input: {
  extractorVersion: string;
  sourceMap: { pages: unknown[]; lines: unknown[]; rawText: string };
  ocrUsed: boolean;
}) {
  return {
    extractorVersion: input.extractorVersion,
    pageCount: input.sourceMap.pages.length,
    lineCount: input.sourceMap.lines.length,
    rawTextLength: input.sourceMap.rawText.length,
    ocrUsed: input.ocrUsed,
  };
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const document = getDocument(params.id, authResult.userId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(resolveStoredDocumentPath(document.path));
    const extracted = await extractDocumentSourceMap({
      buffer,
      filename: document.filename,
      mimeType: document.mimeType,
    });
    const artifact = saveDocumentArtifact({
      documentId: document.id,
      userId: authResult.userId,
      extractorVersion: extracted.extractorVersion,
      status: "ready",
      sourceMap: extracted.sourceMap,
      links: extracted.links,
      ocrUsed: extracted.ocrUsed,
    });

    return NextResponse.json(
      {
        artifact,
        diagnostics: diagnosticsForArtifact({
          extractorVersion: artifact.extractorVersion,
          sourceMap: artifact.sourceMap,
          ocrUsed: artifact.ocrUsed,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Document extraction failed";
    const artifact = saveDocumentArtifact({
      documentId: document.id,
      userId: authResult.userId,
      status: "failed",
      failureReason,
      rawText: "",
      normalizedText: "",
    });

    console.error("Extract document artifact error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract document artifact",
        artifact,
      },
      { status: 422 },
    );
  }
}
