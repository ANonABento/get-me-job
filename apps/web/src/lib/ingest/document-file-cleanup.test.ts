import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  unlink: vi.fn(),
  evictCachedPdf: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    unlink: mocks.unlink,
  },
  unlink: mocks.unlink,
}));

vi.mock("@/lib/parse/pdf-cache", () => ({
  evictCachedPdf: mocks.evictCachedPdf,
}));

import { deleteStoredDocumentFiles } from "./document-file-cleanup";

describe("deleteStoredDocumentFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.unlink.mockResolvedValue(undefined);
  });

  it("evicts cached PDFs and unlinks stored files", async () => {
    const result = await deleteStoredDocumentFiles([
      { id: "doc-1", path: "/tmp/doc-1.pdf" },
      { id: "doc-2", path: "/tmp/doc-2.pdf" },
    ]);

    expect(mocks.evictCachedPdf).toHaveBeenCalledWith("doc-1");
    expect(mocks.evictCachedPdf).toHaveBeenCalledWith("doc-2");
    expect(mocks.unlink).toHaveBeenCalledWith("/tmp/doc-1.pdf");
    expect(mocks.unlink).toHaveBeenCalledWith("/tmp/doc-2.pdf");
    expect(result).toEqual({ filesDeleted: 2, fileDeletionErrors: 0 });
  });

  it("deduplicates file paths while still evicting each document cache entry", async () => {
    const result = await deleteStoredDocumentFiles([
      { id: "doc-1", path: "/tmp/shared.pdf" },
      { id: "doc-2", path: "/tmp/shared.pdf" },
    ]);

    expect(mocks.evictCachedPdf).toHaveBeenCalledTimes(2);
    expect(mocks.unlink).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ filesDeleted: 1, fileDeletionErrors: 0 });
  });

  it("ignores missing files and reports other unlink failures", async () => {
    mocks.unlink
      .mockRejectedValueOnce(
        Object.assign(new Error("missing"), { code: "ENOENT" }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error("denied"), { code: "EACCES" }),
      );

    const result = await deleteStoredDocumentFiles([
      { id: "doc-1", path: "/tmp/missing.pdf" },
      { id: "doc-2", path: "/tmp/denied.pdf" },
    ]);

    expect(result).toEqual({ filesDeleted: 0, fileDeletionErrors: 1 });
  });
});
