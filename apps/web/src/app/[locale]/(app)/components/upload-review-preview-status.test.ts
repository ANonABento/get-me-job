import { describe, expect, it } from "vitest";
import { getUploadReviewPreviewStatus } from "./upload-review-preview-status";

describe("getUploadReviewPreviewStatus", () => {
  it("uses stored text-preview copy for TXT uploads", () => {
    const status = getUploadReviewPreviewStatus({
      filename: "riley-resume.txt",
      mimeType: "text/plain",
    });

    expect(status.kind).toBe("txt");
    expect(status.message).toBe(
      "Text preview is loaded from the stored TXT extraction. Layout highlights are unavailable, but parsed components are editable.",
    );
    expect(status.message).not.toMatch(/24h|24 hour|cache/i);
  });

  it("uses stored text-preview copy for DOCX uploads", () => {
    const status = getUploadReviewPreviewStatus({
      filename: "resume.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(status.kind).toBe("docx");
    expect(status.message).toBe(
      "Text preview is loaded from the stored DOCX extraction. Layout highlights are unavailable, but parsed components are editable.",
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
