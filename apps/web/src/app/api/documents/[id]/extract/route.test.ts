import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocument: vi.fn(),
  saveDocumentArtifact: vi.fn(),
  readFile: vi.fn(),
  extractDocumentSourceMap: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocument: mocks.getDocument,
  saveDocumentArtifact: mocks.saveDocumentArtifact,
}));

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: mocks.readFile,
  },
  readFile: mocks.readFile,
}));

vi.mock("@/lib/ingest/extract-document", () => ({
  extractDocumentSourceMap: mocks.extractDocumentSourceMap,
}));

import { POST } from "./route";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

const sourceMap = {
  pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001"] }],
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Jake Ryan",
      tokenIds: [],
      tokens: [],
      bbox: { page: 1, x0: 0, y0: 0, x1: 100, y1: 14 },
    },
  ],
  rawText: "Jake Ryan",
};

describe("/api/documents/[id]/extract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getDocument.mockReturnValue({
      id: "doc-1",
      filename: "resume.pdf",
      mimeType: "application/pdf",
      path: "/tmp/resume.pdf",
    });
    mocks.readFile.mockResolvedValue(Buffer.from("%PDF"));
    mocks.extractDocumentSourceMap.mockResolvedValue({
      sourceMap,
      extractorVersion: "pdf-source-map-v1",
      links: [],
      ocrUsed: false,
    });
    mocks.saveDocumentArtifact.mockImplementation((input) => ({
      id: input.status === "failed" ? "artifact-failed" : "artifact-1",
      ...input,
      extractorVersion: input.extractorVersion ?? "pdf-source-map-v1",
      sourceMap: input.sourceMap ?? { pages: [], lines: [], rawText: "" },
      rawText: input.rawText ?? input.sourceMap?.rawText ?? "",
      ocrUsed: Boolean(input.ocrUsed),
    }));
  });

  it("extracts and persists a source artifact for the authenticated user", async () => {
    const response = await invokeRouteHandler(
      POST,
      getRequest("http://localhost/api/documents/doc-1/extract"),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getDocument).toHaveBeenCalledWith("doc-1", "user-1");
    expect(mocks.readFile).toHaveBeenCalledWith("/tmp/resume.pdf");
    expect(mocks.extractDocumentSourceMap).toHaveBeenCalledWith({
      buffer: Buffer.from("%PDF"),
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });
    expect(mocks.saveDocumentArtifact).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: "doc-1",
        userId: "user-1",
        extractorVersion: "pdf-source-map-v1",
        status: "ready",
        sourceMap,
        links: [],
        ocrUsed: false,
      }),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      artifact: { id: "artifact-1", documentId: "doc-1" },
      diagnostics: {
        extractorVersion: "pdf-source-map-v1",
        pageCount: 1,
        lineCount: 1,
        rawTextLength: 9,
        ocrUsed: false,
      },
    });
  });

  it("returns 404 when the document is not owned by the user", async () => {
    mocks.getDocument.mockReturnValue(null);

    const response = await invokeRouteHandler(
      POST,
      getRequest("http://localhost/api/documents/doc-1/extract"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document not found",
    });
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("persists a failed artifact when extraction fails", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mocks.extractDocumentSourceMap.mockRejectedValueOnce(
      new Error("Unsupported document type for extraction: image/png"),
    );

    const response = await invokeRouteHandler(
      POST,
      getRequest("http://localhost/api/documents/doc-1/extract"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(422);
    expect(mocks.saveDocumentArtifact).toHaveBeenLastCalledWith(
      expect.objectContaining({
        documentId: "doc-1",
        userId: "user-1",
        status: "failed",
        failureReason: "Unsupported document type for extraction: image/png",
        rawText: "",
        normalizedText: "",
      }),
    );
    await expect(response.json()).resolves.toMatchObject({
      error: "Failed to extract document artifact",
      artifact: { id: "artifact-failed", status: "failed" },
    });
    errorSpy.mockRestore();
  });

  it("returns the auth failure response", async () => {
    const authResponse = Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mocks.requireAuth.mockResolvedValue(authResponse);
    mocks.isAuthError.mockReturnValue(true);

    const response = await invokeRouteHandler(
      POST,
      getRequest("http://localhost/api/documents/doc-1/extract"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.getDocument).not.toHaveBeenCalled();
  });
});
