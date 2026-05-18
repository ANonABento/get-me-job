export type UploadReviewSourceKind = "pdf" | "txt" | "docx" | "unknown";

export interface UploadReviewPreviewStatus {
  kind: UploadReviewSourceKind;
  message: string;
}

export function getUploadReviewSourceKind({
  filename,
  mimeType,
}: {
  filename?: string;
  mimeType?: string;
}): UploadReviewSourceKind {
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  const extension = filename?.split(".").pop()?.toLowerCase() ?? "";

  if (normalizedMime.includes("pdf") || extension === "pdf") return "pdf";
  if (normalizedMime.includes("text/plain") || extension === "txt") {
    return "txt";
  }
  if (
    normalizedMime.includes("wordprocessingml.document") ||
    extension === "docx"
  ) {
    return "docx";
  }
  return "unknown";
}

export function getUploadReviewPreviewStatus(input: {
  filename?: string;
  mimeType?: string;
}): UploadReviewPreviewStatus {
  const kind = getUploadReviewSourceKind(input);

  if (kind === "pdf") {
    return {
      kind,
      message:
        "PDF preview appears in the center pane. If it cannot load, re-upload to refresh the source preview.",
    };
  }

  if (kind === "txt" || kind === "docx") {
    return {
      kind,
      message: `Source preview is not available for ${kind.toUpperCase()} uploads yet. Parsed components are still editable.`,
    };
  }

  return {
    kind,
    message:
      "Parsed components are editable, but Slothing could not locate them in the source preview.",
  };
}
