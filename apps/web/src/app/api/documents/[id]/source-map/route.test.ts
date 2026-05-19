import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocumentParseRun: vi.fn(),
  getLatestDocumentArtifact: vi.fn(),
  listDocumentParseRuns: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocumentParseRun: mocks.getDocumentParseRun,
  getLatestDocumentArtifact: mocks.getLatestDocumentArtifact,
  listDocumentParseRuns: mocks.listDocumentParseRuns,
}));

import { GET } from "./route";
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
      bbox: { page: 1, x0: 10, y0: 10, x1: 80, y1: 24 },
    },
  ],
  rawText: "Jake Ryan",
};

const artifact = {
  id: "artifact-1",
  documentId: "doc-1",
  userId: "user-1",
  extractorVersion: "pdf-source-map-v1",
  status: "ready",
  sourceMap,
  links: [],
  ocrUsed: false,
};

describe("/api/documents/[id]/source-map", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getLatestDocumentArtifact.mockReturnValue(artifact);
    mocks.listDocumentParseRuns.mockReturnValue([]);
  });

  it("returns the latest artifact source map and matching latest ready parse run", async () => {
    mocks.listDocumentParseRuns.mockReturnValue([
      {
        id: "run-1",
        documentId: "doc-1",
        artifactId: "artifact-1",
        status: "ready",
        structured: {
          rawText: "Jake Ryan",
          warnings: [],
          profile: {
            contact: {
              name: "Jake Ryan",
              sourceSpanIds: ["p1-l001"],
              sourceQuality: "exact",
            },
            education: [
              {
                id: "edu-1",
                sourceSpanIds: ["p1-l001"],
                sourceQuality: "exact",
              },
            ],
            experiences: [],
            projects: [],
            skills: [],
          },
        },
      },
    ]);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/source-map"),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getLatestDocumentArtifact).toHaveBeenCalledWith(
      "doc-1",
      "user-1",
    );
    expect(mocks.listDocumentParseRuns).toHaveBeenCalledWith("doc-1", "user-1");
    await expect(response.json()).resolves.toMatchObject({
      artifact: { id: "artifact-1", documentId: "doc-1" },
      sourceMap,
      sourceText: "Jake Ryan",
      parseRun: { id: "run-1", artifactId: "artifact-1" },
      diagnostic: {
        lineCount: 1,
        parsedRoots: { education: 1, experiences: 0, projects: 0, skills: 0 },
        missingRootSourceSpans: [],
        missingBulletSourceSpans: [],
        partialRootSourceSpans: [],
        partialBulletSourceSpans: [],
      },
      sourceRefs: [
        {
          componentId: "contact",
          category: "contact",
          sourceSpanIds: ["p1-l001"],
          sourceQuality: "exact",
          sourceText: ["Jake Ryan"],
        },
        {
          componentId: "edu-1",
          category: "education",
          sourceSpanIds: ["p1-l001"],
          sourceQuality: "exact",
          sourceText: ["Jake Ryan"],
        },
      ],
    });
  });

  it("returns a requested parse run scoped to the document and user", async () => {
    mocks.getDocumentParseRun.mockReturnValue({
      id: "run-2",
      documentId: "doc-1",
      artifactId: "artifact-1",
      status: "ready",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest(
        "http://localhost/api/documents/doc-1/source-map?parseRunId=run-2",
      ),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getDocumentParseRun).toHaveBeenCalledWith(
      "run-2",
      "doc-1",
      "user-1",
    );
    expect(mocks.listDocumentParseRuns).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      parseRun: { id: "run-2" },
      diagnostic: null,
    });
  });

  it("returns source text and null diagnostic when no parse run is available", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/source-map"),
      routeContext({ id: "doc-1" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      sourceText: "Jake Ryan",
      parseRun: null,
      sourceRefs: [],
      diagnostic: null,
    });
  });

  it("returns 404 when the artifact is missing", async () => {
    mocks.getLatestDocumentArtifact.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/source-map"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document artifact not found",
    });
  });

  it("returns 404 when a requested parse run is missing", async () => {
    mocks.getDocumentParseRun.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest(
        "http://localhost/api/documents/doc-1/source-map?parseRunId=missing",
      ),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document parse run not found",
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
      getRequest("http://localhost/api/documents/doc-1/source-map"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(401);
  });
});
