import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  saveDocument: vi.fn(),
  getDocumentByFileHash: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  generateId: vi.fn(() => "doc-generated"),
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

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    saveDocument: mocks.saveDocument,
    getDocumentByFileHash: mocks.getDocumentByFileHash,
  };
});

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    generateId: mocks.generateId,
  };
});

import { DuplicateDocumentError } from "@/lib/db";
import { PATHS } from "@/lib/constants";
import { POST } from "./route";

function fileWithBytes(name: string, type: string, bytes: Uint8Array): File {
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

function pdfFile(name = "resume.pdf") {
  return fileWithBytes(
    name,
    "application/pdf",
    new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
  );
}

function uploadRequest(
  file: File | null,
  fields: Record<string, FormDataEntryValue | null> = {},
) {
  const formData = {
    get: vi.fn((key: string) =>
      key === "file" ? file : (fields[key] ?? null),
    ),
  };
  return {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest;
}

describe("/api/documents/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.unlink.mockResolvedValue(undefined);
    mocks.getDocumentByFileHash.mockReturnValue(null);
  });

  it("persists the uploaded document without parsing or bank side effects", async () => {
    const response = await POST(uploadRequest(pdfFile(), { type: "resume" }));

    expect(response.status).toBe(201);
    expect(mocks.mkdir).toHaveBeenCalledWith(PATHS.UPLOADS, {
      recursive: true,
    });
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("doc-generated.pdf"),
      expect.any(Buffer),
    );
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "doc-generated",
        filename: "resume.pdf",
        type: "resume",
        mimeType: "application/pdf",
        size: 5,
        fileHash:
          "38523c087796e5d5dd1cf9bad1fb026781a838dd9dd2cf8af58b9f6502a46778",
      }),
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      duplicate: false,
      document: {
        id: "doc-generated",
        filename: "resume.pdf",
        type: "resume",
      },
      next: {
        extractUrl: "/api/documents/doc-generated/extract",
        parseRunsUrl: "/api/documents/doc-generated/parse-runs",
        sourceMapUrl: "/api/documents/doc-generated/source-map",
      },
    });
  });

  it("returns an existing document as a duplicate without writing a new file", async () => {
    mocks.getDocumentByFileHash.mockReturnValueOnce({
      id: "doc-existing",
      filename: "resume.pdf",
      type: "resume",
      mimeType: "application/pdf",
      size: 5,
      path: "/uploads/doc-existing.pdf",
      fileHash: "hash",
      uploadedAt: "2026-05-18T10:00:00.000Z",
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(200);
    expect(mocks.writeFile).not.toHaveBeenCalled();
    expect(mocks.saveDocument).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      duplicate: true,
      document: { id: "doc-existing" },
      next: { extractUrl: "/api/documents/doc-existing/extract" },
    });
  });

  it("cleans up the written file when a duplicate race hits saveDocument", async () => {
    mocks.saveDocument.mockImplementationOnce(() => {
      throw new DuplicateDocumentError();
    });
    mocks.getDocumentByFileHash.mockReturnValueOnce(null).mockReturnValueOnce({
      id: "doc-winner",
      filename: "resume.pdf",
      type: "resume",
      mimeType: "application/pdf",
      size: 5,
      path: "/uploads/doc-winner.pdf",
      uploadedAt: "2026-05-18T10:00:00.000Z",
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(mocks.unlink).toHaveBeenCalledWith(
      expect.stringContaining("doc-generated.pdf"),
    );
    await expect(response.json()).resolves.toMatchObject({
      duplicate: true,
      document: { id: "doc-winner" },
    });
  });

  it("rejects invalid file type, mismatched magic bytes, and unsupported document type", async () => {
    const htmlResponse = await POST(
      uploadRequest(
        fileWithBytes("resume.html", "text/html", new Uint8Array()),
      ),
    );
    expect(htmlResponse.status).toBe(400);

    const badPdfResponse = await POST(
      uploadRequest(
        fileWithBytes("resume.pdf", "application/pdf", new Uint8Array([1, 2])),
      ),
    );
    expect(badPdfResponse.status).toBe(400);

    const badTypeResponse = await POST(
      uploadRequest(pdfFile(), { type: "invoice" }),
    );
    expect(badTypeResponse.status).toBe(400);
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("returns the auth failure response", async () => {
    const authResponse = Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mocks.requireAuth.mockResolvedValue(authResponse);
    mocks.isAuthError.mockReturnValue(true);

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(401);
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });
});
