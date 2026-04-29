import { describe, expect, it, vi } from "vitest";
import {
  COVER_LETTER_DOCUMENT_ID,
  createStudioDocument,
  deleteStudioDocument,
  formatVersionTimestamp,
  getActiveStudioDocument,
  getDefaultDocumentName,
  getDocumentsForType,
  renameStudioDocument,
  updateStudioDocument,
  type StudioDocument,
} from "./studio-documents";

const documents: StudioDocument[] = [
  { id: "resume", name: "Resume", mode: "resume" },
  { id: "resume-2", name: "Resume 2", mode: "resume" },
  { id: "cover-1", name: "Cover Letter", mode: "cover_letter" },
];

describe("studio document helpers", () => {
  it("creates default document names from mode and index", () => {
    expect(getDefaultDocumentName("resume")).toBe("Resume");
    expect(getDefaultDocumentName("resume", 3)).toBe("Resume 3");
    expect(getDefaultDocumentName("cover_letter", 2)).toBe("Cover Letter 2");
  });

  it("creates documents with mode defaults", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "generated-id" });

    expect(createStudioDocument("cover_letter", { index: 4 })).toEqual({
      id: "generated-id",
      name: "Cover Letter 4",
      mode: "cover_letter",
    });
  });

  it("finds active documents within the selected mode", () => {
    expect(getDocumentsForType(documents, "resume")).toHaveLength(2);
    expect(getActiveStudioDocument(documents, "resume", "resume-2")).toBe(
      documents[1]
    );
    expect(getActiveStudioDocument(documents, "resume", "missing")).toBe(
      documents[0]
    );
    expect(getActiveStudioDocument([], "cover_letter", undefined)).toMatchObject(
      {
        id: COVER_LETTER_DOCUMENT_ID,
        mode: "cover_letter",
      }
    );
  });

  it("updates and renames documents without accepting blank names", () => {
    expect(
      updateStudioDocument(documents, "resume", { templateId: "modern" })[0]
    ).toMatchObject({ templateId: "modern" });
    expect(renameStudioDocument(documents, "resume", " Updated ")[0]).toHaveProperty(
      "name",
      "Updated"
    );
    expect(renameStudioDocument(documents, "resume", "   ")).toBe(documents);
  });

  it("keeps one document for a mode after deleting its last document", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "cover-replacement" });

    const result = deleteStudioDocument([documents[0], documents[2]], "cover-1", "cover_letter");

    expect(result.activeDocumentId).toBe("cover-replacement");
    expect(getDocumentsForType(result.documents, "cover_letter")).toEqual([
      {
        id: "cover-replacement",
        name: "Cover Letter",
        mode: "cover_letter",
      },
    ]);
  });

  it("formats version timestamps for display", () => {
    const formatted = formatVersionTimestamp("2026-04-28T12:30:00.000Z");

    expect(formatted).toContain("Apr");
    expect(formatted).toContain("28");
  });
});
