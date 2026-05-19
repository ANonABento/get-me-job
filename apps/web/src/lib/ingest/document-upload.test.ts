import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  saveDocument: vi.fn(),
  getDocumentByFileHash: vi.fn(),
  deleteDocumentArtifactsByDocumentIds: vi.fn(),
  deleteDocumentParseRunsByDocumentIds: vi.fn(),
  deleteSourceDocuments: vi.fn(),
  generateId: vi.fn(() => "doc-new"),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mocks.mkdir,
  writeFile: mocks.writeFile,
  unlink: mocks.unlink,
  default: {
    mkdir: mocks.mkdir,
    writeFile: mocks.writeFile,
    unlink: mocks.unlink,
  },
}));

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    saveDocument: mocks.saveDocument,
    getDocumentByFileHash: mocks.getDocumentByFileHash,
    deleteDocumentArtifactsByDocumentIds:
      mocks.deleteDocumentArtifactsByDocumentIds,
    deleteDocumentParseRunsByDocumentIds:
      mocks.deleteDocumentParseRunsByDocumentIds,
  };
});

vi.mock("@/lib/db/profile-bank", () => ({
  deleteSourceDocuments: mocks.deleteSourceDocuments,
}));

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    generateId: mocks.generateId,
  };
});

import { PATHS } from "@/lib/constants";
import { persistDocumentUpload } from "./document-upload";

function pdfFile(name = "resume.pdf") {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    name,
    type: "application/pdf",
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

describe("persistDocumentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.unlink.mockResolvedValue(undefined);
    mocks.getDocumentByFileHash.mockReturnValue(null);
  });

  it("returns an existing duplicate without replacing by default", async () => {
    const existing = {
      id: "doc-existing",
      filename: "resume.pdf",
      type: "resume",
      mimeType: "application/pdf",
      size: 5,
      path: "/uploads/doc-existing.pdf",
      fileHash: "hash",
      uploadedAt: "2026-05-18T10:00:00.000Z",
    };
    mocks.getDocumentByFileHash.mockReturnValueOnce(existing);

    const result = await persistDocumentUpload({
      file: pdfFile(),
      userId: "user-1",
      documentType: "resume",
    });

    expect(result).toEqual({ document: existing, duplicate: true });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
    expect(mocks.deleteSourceDocuments).not.toHaveBeenCalled();
  });

  it("replaces an existing duplicate when requested", async () => {
    const existing = {
      id: "doc-existing",
      filename: "resume.pdf",
      type: "resume",
      mimeType: "application/pdf",
      size: 5,
      path: "/uploads/doc-existing.pdf",
      fileHash: "hash",
      uploadedAt: "2026-05-18T10:00:00.000Z",
    };
    mocks.getDocumentByFileHash.mockReturnValueOnce(existing);

    const result = await persistDocumentUpload({
      file: pdfFile(),
      userId: "user-1",
      documentType: "resume",
      replaceExisting: true,
    });

    expect(mocks.deleteDocumentParseRunsByDocumentIds).toHaveBeenCalledWith(
      ["doc-existing"],
      "user-1",
    );
    expect(mocks.deleteDocumentArtifactsByDocumentIds).toHaveBeenCalledWith(
      ["doc-existing"],
      "user-1",
    );
    expect(mocks.deleteSourceDocuments).toHaveBeenCalledWith(
      ["doc-existing"],
      "user-1",
    );
    expect(mocks.unlink).toHaveBeenCalledWith("/uploads/doc-existing.pdf");
    expect(mocks.mkdir).toHaveBeenCalledWith(PATHS.UPLOADS, {
      recursive: true,
    });
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "doc-new",
        filename: "resume.pdf",
        type: "resume",
      }),
      "user-1",
    );
    expect(result).toMatchObject({
      duplicate: false,
      replacedDocumentId: "doc-existing",
      document: { id: "doc-new" },
    });
  });
});
