import {
  getDocumentArtifact,
  getLatestDocumentArtifact,
  saveDocumentParseRun,
  type DocumentParseRun,
  type ParseWarning,
} from "@/lib/db";
import { parseResumeV2FromSourceMap } from "@/lib/ingest/parse-resume-v2";

export class DocumentParseRunError extends Error {
  readonly status: number;
  readonly publicMessage: string;

  constructor(publicMessage: string, status = 500, cause?: unknown) {
    super(publicMessage);
    this.name = "DocumentParseRunError";
    this.status = status;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}

export interface CreateBasicDocumentParseRunInput {
  documentId: string;
  userId: string;
  artifactId?: string;
}

export function createBasicDocumentParseRun({
  documentId,
  userId,
  artifactId,
}: CreateBasicDocumentParseRunInput): DocumentParseRun {
  try {
    const artifact = artifactId
      ? getDocumentArtifact(artifactId, userId)
      : getLatestDocumentArtifact(documentId, userId);

    if (!artifact || artifact.documentId !== documentId) {
      throw new DocumentParseRunError("Document artifact not found", 404);
    }
    if (artifact.status === "failed") {
      throw new DocumentParseRunError("Document artifact is not ready", 409);
    }

    const structured = parseResumeV2FromSourceMap(artifact.sourceMap);
    const warnings: ParseWarning[] = structured.warnings.map((message) => ({
      code: "parser_warning",
      message,
      severity: "warning",
    }));

    return saveDocumentParseRun({
      documentId,
      artifactId: artifact.id,
      userId,
      mode: "basic",
      status: "ready",
      confidence: structured.confidence,
      warnings,
      structured,
    });
  } catch (error) {
    if (error instanceof DocumentParseRunError) throw error;
    throw new DocumentParseRunError(
      "Failed to create document parse run",
      500,
      error,
    );
  }
}
