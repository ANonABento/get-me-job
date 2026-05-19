import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocumentParseRunById: vi.fn(),
  getDocumentArtifact: vi.fn(),
  buildParseRunReviewEntries: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocumentParseRunById: mocks.getDocumentParseRunById,
  getDocumentArtifact: mocks.getDocumentArtifact,
}));

vi.mock("@/lib/ingest/parse-run-bank-import", () => ({
  buildParseRunReviewEntries: mocks.buildParseRunReviewEntries,
}));

import { GET } from "./route";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

const parseRun = {
  id: "run-1",
  documentId: "doc-1",
  artifactId: "artifact-1",
  userId: "user-1",
  status: "ready",
  structured: { profile: { experiences: [] } },
};

const artifact = {
  id: "artifact-1",
  documentId: "doc-1",
  sourceMap: { pages: [], lines: [], rawText: "" },
};

describe("/api/bank/imports/[parseRunId]/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getDocumentParseRunById.mockReturnValue(parseRun);
    mocks.getDocumentArtifact.mockReturnValue(artifact);
    mocks.buildParseRunReviewEntries.mockReturnValue([
      {
        id: "exp-1",
        userId: "user-1",
        category: "experience",
        content: { title: "Engineer" },
        confidenceScore: 0.9,
        createdAt: "2026-05-18T10:00:00.000Z",
      },
    ]);
  });

  it("returns parser-v2 review entries for the authenticated user", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/bank/imports/run-1/preview"),
      routeContext({ parseRunId: "run-1" }),
    );

    expect(mocks.getDocumentParseRunById).toHaveBeenCalledWith(
      "run-1",
      "user-1",
    );
    expect(mocks.getDocumentArtifact).toHaveBeenCalledWith(
      "artifact-1",
      "user-1",
    );
    expect(mocks.buildParseRunReviewEntries).toHaveBeenCalledWith({
      parseRun,
      sourceMap: artifact.sourceMap,
    });
    await expect(response.json()).resolves.toEqual({
      parseRunId: "run-1",
      documentId: "doc-1",
      artifactId: "artifact-1",
      entries: [
        {
          id: "exp-1",
          userId: "user-1",
          category: "experience",
          content: { title: "Engineer" },
          confidenceScore: 0.9,
          createdAt: "2026-05-18T10:00:00.000Z",
        },
      ],
    });
  });

  it("returns 404 when the parse run is missing", async () => {
    mocks.getDocumentParseRunById.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/bank/imports/run-1/preview"),
      routeContext({ parseRunId: "run-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Parse run not found",
    });
  });

  it("rejects failed parse runs", async () => {
    mocks.getDocumentParseRunById.mockReturnValue({
      ...parseRun,
      status: "failed",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/bank/imports/run-1/preview"),
      routeContext({ parseRunId: "run-1" }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Parse run is not ready for review",
    });
  });

  it("returns 404 when the artifact is missing or mismatched", async () => {
    mocks.getDocumentArtifact.mockReturnValue({
      ...artifact,
      documentId: "other",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/bank/imports/run-1/preview"),
      routeContext({ parseRunId: "run-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document artifact not found",
    });
  });

  it("returns the auth failure response", async () => {
    const authResponse = Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mocks.requireAuth.mockResolvedValue(authResponse);
    mocks.isAuthError.mockReturnValue(true);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/bank/imports/run-1/preview"),
      routeContext({ parseRunId: "run-1" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.getDocumentParseRunById).not.toHaveBeenCalled();
  });
});
