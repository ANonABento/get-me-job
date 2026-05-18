import { describe, expect, it } from "vitest";
import { getUploadReviewPreviewStatus } from "./upload-review-preview-status";

describe("getUploadReviewPreviewStatus", () => {
  it("uses unsupported-source copy for TXT uploads", () => {
    const status = getUploadReviewPreviewStatus({
      filename: "riley-resume.txt",
      mimeType: "text/plain",
    });

    expect(status.kind).toBe("txt");
    expect(status.message).toBe(
      "Source preview is not available for TXT uploads yet. Parsed components are still editable.",
    );
    expect(status.message).not.toMatch(/24h|24 hour|cache/i);
  });

  it("uses unsupported-source copy for DOCX uploads", () => {
    const status = getUploadReviewPreviewStatus({
      filename: "resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(status.kind).toBe("docx");
    expect(status.message).toBe(
      "Source preview is not available for DOCX uploads yet. Parsed components are still editable.",
    );
  });

  it("uses neutral PDF preview copy", () => {
    const status = getUploadReviewPreviewStatus({
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });

    expect(status.kind).toBe("pdf");
    expect(status.message).toBe(
      "PDF preview appears in the center pane. If it cannot load, re-upload to refresh the source preview.",
    );
  });
});
