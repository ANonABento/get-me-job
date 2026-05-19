import { unlink } from "node:fs/promises";
import { evictCachedPdf } from "@/lib/parse/pdf-cache";

export interface StoredDocumentFileRef {
  id: string;
  path: string | null | undefined;
}

export interface DocumentFileCleanupResult {
  filesDeleted: number;
  fileDeletionErrors: number;
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

export async function deleteStoredDocumentFiles(
  documents: StoredDocumentFileRef[],
): Promise<DocumentFileCleanupResult> {
  let filesDeleted = 0;
  let fileDeletionErrors = 0;
  const seenPaths = new Set<string>();

  for (const document of documents) {
    evictCachedPdf(document.id);

    if (!document.path || seenPaths.has(document.path)) continue;
    seenPaths.add(document.path);

    try {
      await unlink(document.path);
      filesDeleted += 1;
    } catch (error) {
      if (!isMissingFileError(error)) {
        fileDeletionErrors += 1;
      }
    }
  }

  return { filesDeleted, fileDeletionErrors };
}
