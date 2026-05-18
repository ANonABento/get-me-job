import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocumentParseRun: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocumentParseRun: mocks.getDocumentParseRun,
}));

import { GET } from "./route";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

describe("/api/documents/[id]/parse-runs/[runId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("returns a parse run scoped to document and user", async () => {
    mocks.getDocumentParseRun.mockReturnValue({
      id: "run-1",
      documentId: "doc-1",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/parse-runs/run-1"),
      routeContext({ id: "doc-1", runId: "run-1" }),
    );

    expect(mocks.getDocumentParseRun).toHaveBeenCalledWith(
      "run-1",
      "doc-1",
      "user-1",
    );
    await expect(response.json()).resolves.toEqual({
      parseRun: { id: "run-1", documentId: "doc-1" },
    });
  });

  it("returns 404 when missing", async () => {
    mocks.getDocumentParseRun.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/parse-runs/run-1"),
      routeContext({ id: "doc-1", runId: "run-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document parse run not found",
    });
  });
});
