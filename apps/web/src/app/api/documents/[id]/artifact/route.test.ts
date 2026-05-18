import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getLatestDocumentArtifact: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getLatestDocumentArtifact: mocks.getLatestDocumentArtifact,
}));

import { GET } from "./route";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

describe("/api/documents/[id]/artifact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("returns the latest document artifact for the authenticated user", async () => {
    mocks.getLatestDocumentArtifact.mockReturnValue({
      id: "artifact-1",
      documentId: "doc-1",
      userId: "user-1",
      status: "ready",
      sourceMap: { pages: [], lines: [], rawText: "" },
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/artifact"),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getLatestDocumentArtifact).toHaveBeenCalledWith(
      "doc-1",
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      artifact: { id: "artifact-1", documentId: "doc-1" },
    });
  });

  it("returns 404 when no artifact exists", async () => {
    mocks.getLatestDocumentArtifact.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/artifact"),
      routeContext({ id: "doc-1" }),
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
      getRequest("http://localhost/api/documents/doc-1/artifact"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(401);
  });
});
