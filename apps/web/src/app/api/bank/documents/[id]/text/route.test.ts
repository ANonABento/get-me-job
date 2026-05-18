import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getDocument: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/queries", () => ({
  getDocument: mocks.getDocument,
}));

import { GET } from "./route";

function request() {
  return new NextRequest("http://localhost/api/bank/documents/doc-1/text");
}

describe("/api/bank/documents/[id]/text", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("returns extracted text for the authenticated user's document", async () => {
    mocks.getDocument.mockReturnValueOnce({
      id: "doc-1",
      filename: "resume.txt",
      mimeType: "text/plain",
      extractedText: "  Jane Candidate\nExperience  ",
    });

    const response = await GET(request(), { params: { id: "doc-1" } });

    expect(mocks.getDocument).toHaveBeenCalledWith("doc-1", "user-1");
    await expect(response.json()).resolves.toEqual({
      document: {
        id: "doc-1",
        filename: "resume.txt",
        mimeType: "text/plain",
        extractedText: "Jane Candidate\nExperience",
      },
    });
  });

  it("returns 404 when stored extracted text is empty", async () => {
    mocks.getDocument.mockReturnValueOnce({
      id: "doc-1",
      filename: "resume.txt",
      mimeType: "text/plain",
      extractedText: "   ",
    });

    const response = await GET(request(), { params: { id: "doc-1" } });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Text preview not available",
    });
  });
});
