import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  createParserV2UploadReview: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/ingest/parser-v2-upload-review", () => ({
  createParserV2UploadReview: mocks.createParserV2UploadReview,
}));

import { DocumentParseRunError } from "@/lib/ingest/document-parse-run";
import { DocumentUploadError } from "@/lib/ingest/document-upload";
import { POST } from "./route";

function pdfFile() {
  return new File(
    [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])],
    "resume.pdf",
    {
      type: "application/pdf",
    },
  );
}

function uploadRequest(url = "http://localhost/api/documents/upload/review") {
  const formData = new FormData();
  formData.append("file", pdfFile());
  formData.append("type", "resume");
  return new NextRequest(url, {
    method: "POST",
    body: formData,
  });
}

const document = {
  id: "doc-1",
  filename: "resume.pdf",
  type: "resume",
  mimeType: "application/pdf",
  size: 5,
  path: "/tmp/doc-1.pdf",
  uploadedAt: "2026-05-18T10:00:00.000Z",
};

describe("/api/documents/upload/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.createParserV2UploadReview.mockResolvedValue({
      upload: { document, duplicate: false },
      artifact: { id: "artifact-1" },
      parseRun: { id: "run-1" },
      entries: [{ id: "entry-1", category: "experience" }],
      sourceText: "Kevin Jiang",
      diagnostic: { lineCount: 10, parsedRoots: {} },
    });
  });

  it("returns parser-v2 review context for a new upload", async () => {
    const response = await POST(uploadRequest());

    expect(response.status).toBe(201);
    expect(mocks.createParserV2UploadReview).toHaveBeenCalledWith({
      file: expect.anything(),
      userId: "user-1",
      documentTypeValue: "resume",
      replaceExisting: false,
    });
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      document: { id: "doc-1" },
      artifact: { id: "artifact-1" },
      parseRun: { id: "run-1" },
      entries: [{ id: "entry-1" }],
      sourceText: "Kevin Jiang",
      next: {
        sourceMapUrl: "/api/documents/doc-1/source-map?parseRunId=run-1",
        commitUrl: "/api/bank/imports/run-1/commit",
      },
    });
  });

  it("passes force replacement through to the service", async () => {
    const response = await POST(
      uploadRequest("http://localhost/api/documents/upload/review?force=true"),
    );

    expect(response.status).toBe(201);
    expect(mocks.createParserV2UploadReview).toHaveBeenCalledWith(
      expect.objectContaining({ replaceExisting: true }),
    );
  });

  it("returns 409 when the file is a duplicate and force is not set", async () => {
    mocks.createParserV2UploadReview.mockResolvedValueOnce({
      upload: { document, duplicate: true },
      entries: [],
      sourceText: "",
      diagnostic: null,
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Duplicate file upload",
      existing: {
        id: "doc-1",
        filename: "resume.pdf",
        uploadedAt: "2026-05-18T10:00:00.000Z",
      },
    });
  });

  it("maps upload validation errors to their public response", async () => {
    mocks.createParserV2UploadReview.mockRejectedValueOnce(
      new DocumentUploadError("invalid_magic_bytes", "Bad file", 400),
    );

    const response = await POST(uploadRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Bad file" });
  });

  it("maps parse-run errors to their public response", async () => {
    mocks.createParserV2UploadReview.mockRejectedValueOnce(
      new DocumentParseRunError("No artifact", 404),
    );

    const response = await POST(uploadRequest());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "No artifact" });
  });
});
