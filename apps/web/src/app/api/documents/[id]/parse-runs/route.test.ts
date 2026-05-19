import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocumentArtifact: vi.fn(),
  getLatestDocumentArtifact: vi.fn(),
  listDocumentParseRuns: vi.fn(),
  saveDocumentParseRun: vi.fn(),
  parseResumeV2FromSourceMap: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocumentArtifact: mocks.getDocumentArtifact,
  getLatestDocumentArtifact: mocks.getLatestDocumentArtifact,
  listDocumentParseRuns: mocks.listDocumentParseRuns,
  saveDocumentParseRun: mocks.saveDocumentParseRun,
}));

vi.mock("@/lib/ingest/parse-resume-v2", () => ({
  parseResumeV2FromSourceMap: mocks.parseResumeV2FromSourceMap,
}));

import { GET, POST } from "./route";
import {
  getRequest,
  invokeRouteHandler,
  jsonRequest,
  routeContext,
} from "@/test/contract";

describe("/api/documents/[id]/parse-runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.listDocumentParseRuns.mockReturnValue([]);
  });

  it("lists parse runs for the authenticated user", async () => {
    mocks.listDocumentParseRuns.mockReturnValueOnce([{ id: "run-1" }]);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/parse-runs"),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.listDocumentParseRuns).toHaveBeenCalledWith("doc-1", "user-1");
    await expect(response.json()).resolves.toEqual({
      parseRuns: [{ id: "run-1" }],
    });
  });

  it("creates a basic parse run from the latest artifact", async () => {
    const sourceMap = { pages: [], lines: [], rawText: "Jake Ryan" };
    const structured = {
      confidence: 0.75,
      warnings: ["No education detected"],
      rawText: "Jake Ryan",
      profile: { rawText: "Jake Ryan" },
    };
    mocks.getLatestDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "doc-1",
      sourceMap,
    });
    mocks.parseResumeV2FromSourceMap.mockReturnValue(structured);
    mocks.saveDocumentParseRun.mockReturnValue({ id: "run-1" });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/documents/doc-1/parse-runs", {}),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getLatestDocumentArtifact).toHaveBeenCalledWith(
      "doc-1",
      "user-1",
    );
    expect(mocks.parseResumeV2FromSourceMap).toHaveBeenCalledWith(sourceMap);
    expect(mocks.saveDocumentParseRun).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: "doc-1",
        artifactId: "artifact-1",
        userId: "user-1",
        mode: "basic",
        status: "ready",
        confidence: 0.75,
        structured,
        warnings: [
          {
            code: "parser_warning",
            message: "No education detected",
            severity: "warning",
          },
        ],
      }),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      parseRun: { id: "run-1" },
    });
  });

  it("creates from an explicit artifact id", async () => {
    mocks.getDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "doc-1",
      sourceMap: { pages: [], lines: [], rawText: "" },
    });
    mocks.parseResumeV2FromSourceMap.mockReturnValue({
      confidence: 1,
      warnings: [],
    });
    mocks.saveDocumentParseRun.mockReturnValue({ id: "run-1" });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/documents/doc-1/parse-runs", {
        artifactId: "artifact-1",
      }),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getDocumentArtifact).toHaveBeenCalledWith(
      "artifact-1",
      "user-1",
    );
    expect(response.status).toBe(201);
  });

  it("rejects ai mode until the cited parser exists", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/documents/doc-1/parse-runs", {
        mode: "ai",
      }),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Only basic parser-v2 mode is available in this phase",
    });
  });

  it("returns 404 when the requested artifact does not belong to the document", async () => {
    mocks.getDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "other-doc",
      sourceMap: { pages: [], lines: [], rawText: "" },
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/documents/doc-1/parse-runs", {
        artifactId: "artifact-1",
      }),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document artifact not found",
    });
  });

  it("does not create a parse run from a failed artifact", async () => {
    mocks.getLatestDocumentArtifact.mockReturnValue({
      id: "artifact-failed",
      documentId: "doc-1",
      status: "failed",
      failureReason: "Unsupported document type",
      sourceMap: { pages: [], lines: [], rawText: "" },
    });

    const response = await invokeRouteHandler(
      POST,
      jsonRequest("http://localhost/api/documents/doc-1/parse-runs", {}),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Document artifact is not ready",
    });
    expect(mocks.parseResumeV2FromSourceMap).not.toHaveBeenCalled();
    expect(mocks.saveDocumentParseRun).not.toHaveBeenCalled();
  });

  it("treats an empty POST body as default basic mode", async () => {
    mocks.getLatestDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "doc-1",
      sourceMap: { pages: [], lines: [], rawText: "" },
    });
    mocks.parseResumeV2FromSourceMap.mockReturnValue({
      confidence: 1,
      warnings: [],
    });
    mocks.saveDocumentParseRun.mockReturnValue({ id: "run-1" });

    const response = await invokeRouteHandler(
      POST,
      new NextRequest("http://localhost/api/documents/doc-1/parse-runs", {
        method: "POST",
      }),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(201);
  });
});
