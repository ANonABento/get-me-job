import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDocumentFilename,
  createHtmlPdfExportPayload,
  downloadHtmlAsPdf,
  HTML_PDF_EXPORT_ENDPOINT,
} from "./document-export";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createHtmlPdfExportPayload", () => {
  it("builds the resume export API PDF payload", () => {
    expect(createHtmlPdfExportPayload("<html>Doc</html>")).toEqual({
      html: "<html>Doc</html>",
      format: "pdf",
    });
  });
});

describe("createDocumentFilename", () => {
  it("normalizes labels into stable PDF filenames", () => {
    expect(createDocumentFilename("resume", "Senior Engineer / Acme")).toBe(
      "resume-senior-engineer-acme.pdf"
    );
  });

  it("falls back when the label has no filename-safe characters", () => {
    expect(createDocumentFilename("cover-letter", "!!!")).toBe(
      "cover-letter-document.pdf"
    );
  });

  it("supports custom extensions", () => {
    expect(createDocumentFilename("cover-letter", "Acme", "html")).toBe(
      "cover-letter-acme.html"
    );
  });
});

describe("downloadHtmlAsPdf", () => {
  it("posts HTML to the PDF export endpoint and clicks a download link", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    });
    vi.stubGlobal("fetch", fetchMock);
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:document");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await downloadHtmlAsPdf("<html>Doc</html>", "document.pdf");

    expect(fetchMock).toHaveBeenCalledWith(HTML_PDF_EXPORT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: "<html>Doc</html>",
        format: "pdf",
      }),
    });
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:document");
  });

  it("rejects blank HTML before calling the export endpoint", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(downloadHtmlAsPdf("  ", "document.pdf")).rejects.toThrow(
      "No document HTML available to export."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the PDF export endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        blob: async () => new Blob(),
      })
    );

    await expect(downloadHtmlAsPdf("<html>Doc</html>", "document.pdf")).rejects.toThrow(
      "Failed to export PDF."
    );
  });
});
