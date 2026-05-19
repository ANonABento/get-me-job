import type { BankEntry } from "@/types";

export interface ParserV2ReviewDiagnostic {
  lineCount: number;
  parsedRoots: {
    education: number;
    experiences: number;
    projects: number;
    skills: number;
  };
  missingRootSourceSpans: string[];
  missingBulletSourceSpans: string[];
  partialRootSourceSpans: string[];
  partialBulletSourceSpans: string[];
}

export type ParserV2ReviewContext =
  | {
      status: "ready";
      artifactId?: string;
      parseRunId?: string;
      sourceText: string;
      diagnostic: ParserV2ReviewDiagnostic | null;
      entries: BankEntry[];
    }
  | {
      status: "unavailable";
      error: string;
    };

async function jsonOrNull(
  response: Response,
): Promise<Record<string, unknown>> {
  const data = await response.json().catch(() => null);
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

function responseError(
  data: Record<string, unknown>,
  fallback: string,
): string {
  return typeof data.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

function stringId(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function nestedId(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const nested = data[key];
  return nested && typeof nested === "object" && !Array.isArray(nested)
    ? stringId((nested as Record<string, unknown>).id)
    : undefined;
}

function diagnosticFromPayload(
  value: unknown,
): ParserV2ReviewDiagnostic | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const diagnostic = value as ParserV2ReviewDiagnostic;
  return typeof diagnostic.lineCount === "number" &&
    diagnostic.parsedRoots &&
    typeof diagnostic.parsedRoots === "object"
    ? diagnostic
    : null;
}

function entriesFromPayload(value: unknown): BankEntry[] {
  return Array.isArray(value) ? (value as BankEntry[]) : [];
}

export async function loadParserV2ReviewContext(
  documentId: string,
): Promise<ParserV2ReviewContext> {
  const encodedDocumentId = encodeURIComponent(documentId);

  try {
    const extractResponse = await fetch(
      `/api/documents/${encodedDocumentId}/extract`,
      { method: "POST" },
    );
    const extractData = await jsonOrNull(extractResponse);
    if (!extractResponse.ok) {
      throw new Error(
        responseError(extractData, "Parser-v2 extraction unavailable"),
      );
    }

    const artifactId = nestedId(extractData, "artifact");
    const parseResponse = await fetch(
      `/api/documents/${encodedDocumentId}/parse-runs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artifactId ? { artifactId } : {}),
      },
    );
    const parseData = await jsonOrNull(parseResponse);
    if (!parseResponse.ok) {
      throw new Error(responseError(parseData, "Parser-v2 parse unavailable"));
    }

    const parseRunId = nestedId(parseData, "parseRun");
    const sourceMapUrl = parseRunId
      ? `/api/documents/${encodedDocumentId}/source-map?parseRunId=${encodeURIComponent(parseRunId)}`
      : `/api/documents/${encodedDocumentId}/source-map`;
    const sourceMapResponse = await fetch(sourceMapUrl);
    const sourceMapData = await jsonOrNull(sourceMapResponse);
    if (!sourceMapResponse.ok) {
      throw new Error(
        responseError(sourceMapData, "Parser-v2 source map unavailable"),
      );
    }

    let entries: BankEntry[] = [];
    if (parseRunId) {
      const previewResponse = await fetch(
        `/api/bank/imports/${encodeURIComponent(parseRunId)}/preview`,
      );
      const previewData = await jsonOrNull(previewResponse);
      if (!previewResponse.ok) {
        throw new Error(
          responseError(previewData, "Parser-v2 review preview unavailable"),
        );
      }
      entries = entriesFromPayload(previewData.entries);
    }

    return {
      status: "ready",
      artifactId,
      parseRunId,
      sourceText:
        typeof sourceMapData.sourceText === "string"
          ? sourceMapData.sourceText
          : "",
      diagnostic: diagnosticFromPayload(sourceMapData.diagnostic),
      entries,
    };
  } catch (error) {
    return {
      status: "unavailable",
      error:
        error instanceof Error
          ? error.message
          : "Parser-v2 review context unavailable",
    };
  }
}
