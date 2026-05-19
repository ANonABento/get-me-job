import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  saveDocumentArtifact,
  type DocumentArtifact,
  type DocumentParseRun,
} from "@/lib/db";
import { createParserV2Diagnostic } from "@/lib/ingest/diagnostics";
import { extractDocumentSourceMap } from "@/lib/ingest/extract-document";
import {
  createBasicDocumentParseRun,
  DocumentParseRunError,
} from "@/lib/ingest/document-parse-run";
import {
  parseDocumentUploadType,
  persistDocumentUpload,
  type PersistDocumentUploadResult,
} from "@/lib/ingest/document-upload";
import { buildParseRunReviewEntries } from "@/lib/ingest/parse-run-bank-import";
import { isParsedResumeV2Result } from "@/lib/ingest/diagnostics";
import type { BankEntry } from "@/types";

export interface ParserV2UploadReviewResult {
  upload: PersistDocumentUploadResult;
  artifact?: DocumentArtifact;
  parseRun?: DocumentParseRun;
  entries: BankEntry[];
  sourceText: string;
  diagnostic: ReturnType<typeof createParserV2Diagnostic> | null;
}

function resolveStoredDocumentPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

export async function createParserV2UploadReview(input: {
  file: File;
  userId: string;
  documentTypeValue: FormDataEntryValue | null;
  replaceExisting?: boolean;
}): Promise<ParserV2UploadReviewResult> {
  const documentType = parseDocumentUploadType(input.documentTypeValue);
  const upload = await persistDocumentUpload({
    file: input.file,
    userId: input.userId,
    documentType,
    replaceExisting: input.replaceExisting,
  });

  if (upload.duplicate) {
    return {
      upload,
      entries: [],
      sourceText: "",
      diagnostic: null,
    };
  }

  const buffer = await readFile(
    resolveStoredDocumentPath(upload.document.path),
  );
  const extracted = await extractDocumentSourceMap({
    buffer,
    filename: upload.document.filename,
    mimeType: upload.document.mimeType,
  });
  const artifact = saveDocumentArtifact({
    documentId: upload.document.id,
    userId: input.userId,
    extractorVersion: extracted.extractorVersion,
    status: "ready",
    sourceMap: extracted.sourceMap,
    links: extracted.links,
    ocrUsed: extracted.ocrUsed,
  });

  const parseRun = createBasicDocumentParseRun({
    documentId: upload.document.id,
    userId: input.userId,
    artifactId: artifact.id,
  });

  if (!isParsedResumeV2Result(parseRun.structured)) {
    throw new DocumentParseRunError("Parser-v2 result is not reviewable", 500);
  }

  return {
    upload,
    artifact,
    parseRun,
    entries: buildParseRunReviewEntries({
      parseRun,
      sourceMap: artifact.sourceMap,
    }),
    sourceText: artifact.sourceMap.rawText,
    diagnostic: createParserV2Diagnostic(
      artifact.sourceMap,
      parseRun.structured,
    ),
  };
}
