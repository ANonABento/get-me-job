import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocument: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getDocument: mocks.getDocument,
}));

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: mocks.readFile,
  },
  readFile: mocks.readFile,
}));

import { GET } from "./route";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

describe("/api/documents/[id]/preview/pdf", () => {
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
  });

  it("streams the authenticated user's stored PDF document", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/preview/pdf"),
      routeContext({ id: "doc-1" }),
    );

    expect(mocks.getDocument).toHaveBeenCalledWith("doc-1", "user-1");
    expect(mocks.readFile).toHaveBeenCalledWith("/tmp/resume.pdf");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe(
      'inline; filename="resume.pdf"',
    );
    expect(await response.text()).toBe("%PDF");
  });

  it("returns 404 when the document is missing", async () => {
    mocks.getDocument.mockReturnValue(null);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/preview/pdf"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document not found",
    });
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("rejects non-PDF documents", async () => {
    mocks.getDocument.mockReturnValue({
      id: "doc-1",
      filename: "resume.txt",
      mimeType: "text/plain",
      path: "/tmp/resume.txt",
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/preview/pdf"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: "PDF preview is only available for PDF documents",
    });
  });

  it("returns 404 when the stored file is missing", async () => {
    mocks.readFile.mockRejectedValue(
      Object.assign(new Error("missing"), { code: "ENOENT" }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/documents/doc-1/preview/pdf"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Document file not found",
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
      getRequest("http://localhost/api/documents/doc-1/preview/pdf"),
      routeContext({ id: "doc-1" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.getDocument).not.toHaveBeenCalled();
  });
});
