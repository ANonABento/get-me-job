import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  saveDocument: vi.fn(),
  getLLMConfig: vi.fn(),
  getDocumentByFileHash: vi.fn(),
  deleteSourceDocuments: vi.fn(),
  extractTextFromFile: vi.fn(),
  classifyDocument: vi.fn(),
  smartParseResume: vi.fn(),
}));

vi.mock("fs/promises", () => {
  const mocked = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };
  return { ...mocked, default: mocked };
});

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  saveDocument: mocks.saveDocument,
  getLLMConfig: mocks.getLLMConfig,
  getDocumentByFileHash: mocks.getDocumentByFileHash,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  insertBankEntries: vi.fn().mockReturnValue(["entry-1"]),
  deleteSourceDocuments: mocks.deleteSourceDocuments,
}));

vi.mock("@/lib/parser/pdf", () => ({
  extractTextFromFile: mocks.extractTextFromFile,
}));

vi.mock("@/lib/parser/document-classifier", () => ({
  classifyDocument: mocks.classifyDocument,
}));

vi.mock("@/lib/parser/resume", () => ({
  parseDocumentByType: vi.fn(),
}));

vi.mock("@/lib/parser/smart-parser", () => ({
  smartParseResume: mocks.smartParseResume,
}));

import { POST } from "./route";

function uploadRequest(file: File, url = "http://localhost/api/upload") {
  const formData = {
    get: vi.fn().mockReturnValue(file),
  };
  return {
    nextUrl: new URL(url),
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest;
}

function pdfFile(name = "test-resume.pdf") {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    name,
    type: "application/pdf",
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

function fileWithBytes(
  name: string,
  type: string,
  bytes: Uint8Array,
): File {
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
  } as unknown as File;
}

function exeMasqueradingAsPdf() {
  // PE/MZ header — Windows executable bytes claiming application/pdf MIME and
  // a .pdf filename. Magic-byte validation must reject this.
  const peHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00]);
  return fileWithBytes("malicious.pdf", "application/pdf", peHeader);
}

describe("upload route dedupe flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getLLMConfig.mockReturnValue(null);
    mocks.extractTextFromFile.mockResolvedValue("resume text");
    mocks.classifyDocument.mockResolvedValue("resume");
    mocks.smartParseResume.mockResolvedValue({
      profile: {
        experiences: [
          {
            company: "Acme Corp",
            title: "Senior Developer",
          },
        ],
      },
      confidence: 0.9,
      sectionsDetected: ["experience"],
      llmUsed: false,
      llmSectionsCount: 0,
      warnings: [],
    });
  });

  it("rejects an .exe masquerading as a .pdf via magic-byte validation", async () => {
    const response = await POST(uploadRequest(exeMasqueradingAsPdf()));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("does not match"),
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
    expect(mocks.extractTextFromFile).not.toHaveBeenCalled();
  });

  it("rejects a disallowed MIME type", async () => {
    const html = new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e]);
    const response = await POST(
      uploadRequest(fileWithBytes("payload.html", "text/html", html)),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("Invalid file type"),
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("returns 409 with existing document metadata when the file hash already exists", async () => {
    mocks.getDocumentByFileHash.mockReturnValueOnce({
      id: "doc-existing",
      filename: "test-resume.pdf",
      type: "resume",
      size: 5,
      path: "/tmp/test-resume.pdf",
      uploadedAt: "2024-01-01T09:00:00.000Z",
    });

    const response = await POST(uploadRequest(pdfFile()));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Duplicate file upload",
      existing: {
        id: "doc-existing",
        filename: "test-resume.pdf",
        uploaded_at: "2024-01-01T09:00:00.000Z",
      },
    });
    expect(mocks.saveDocument).not.toHaveBeenCalled();
  });

  it("deletes the previous source document and accepts the upload when forced", async () => {
    mocks.getDocumentByFileHash.mockReturnValueOnce({
      id: "doc-existing",
      filename: "test-resume.pdf",
      type: "resume",
      size: 5,
      path: "/tmp/test-resume.pdf",
      uploadedAt: "2024-01-01T09:00:00.000Z",
    });

    const response = await POST(
      uploadRequest(pdfFile(), "http://localhost/api/upload?force=true")
    );

    expect(response.status).toBe(200);
    expect(mocks.deleteSourceDocuments).toHaveBeenCalledWith(
      ["doc-existing"],
      "user-1"
    );
    expect(mocks.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "test-resume.pdf",
        fileHash: expect.any(String),
      }),
      "user-1"
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      entriesCreated: 1,
    });
  });
});
