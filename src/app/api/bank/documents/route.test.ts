import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getSourceDocuments: vi.fn(),
  deleteSourceDocuments: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  getSourceDocuments: mocks.getSourceDocuments,
  deleteSourceDocuments: mocks.deleteSourceDocuments,
}));

import { DELETE, GET } from "./route";

function deleteRequest(body: string) {
  return new NextRequest("http://localhost/api/bank/documents", {
    method: "DELETE",
    body,
    headers: { "content-type": "application/json" },
  });
}

describe("bank documents route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("lists source documents for the authenticated user", async () => {
    mocks.getSourceDocuments.mockReturnValueOnce([
      {
        id: "doc-1",
        filename: "resume.pdf",
        size: 1234,
        uploadedAt: "2024-01-15T10:00:00.000Z",
        chunkCount: 2,
      },
    ]);

    const response = await GET();

    expect(mocks.getSourceDocuments).toHaveBeenCalledWith("user-1");
    await expect(response.json()).resolves.toEqual({
      documents: [
        {
          id: "doc-1",
          filename: "resume.pdf",
          size: 1234,
          uploadedAt: "2024-01-15T10:00:00.000Z",
          chunkCount: 2,
        },
      ],
    });
  });

  it("bulk deletes requested source documents for the authenticated user", async () => {
    mocks.deleteSourceDocuments.mockReturnValueOnce({
      documentsDeleted: 2,
      chunksDeleted: 5,
    });

    const response = await DELETE(
      deleteRequest(JSON.stringify({ documentIds: ["doc-1", "doc-2"] }))
    );

    expect(mocks.deleteSourceDocuments).toHaveBeenCalledWith(
      ["doc-1", "doc-2"],
      "user-1"
    );
    await expect(response.json()).resolves.toEqual({
      success: true,
      documentsDeleted: 2,
      chunksDeleted: 5,
    });
  });

  it("trims document ids before deleting", async () => {
    mocks.deleteSourceDocuments.mockReturnValueOnce({
      documentsDeleted: 1,
      chunksDeleted: 2,
    });

    await DELETE(deleteRequest(JSON.stringify({ documentIds: [" doc-1 "] })));

    expect(mocks.deleteSourceDocuments).toHaveBeenCalledWith(
      ["doc-1"],
      "user-1"
    );
  });

  it("rejects malformed JSON without calling the database", async () => {
    const response = await DELETE(deleteRequest("{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON",
    });
    expect(mocks.deleteSourceDocuments).not.toHaveBeenCalled();
  });

  it("rejects JSON that is not an object", async () => {
    const response = await DELETE(deleteRequest("null"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "documentIds must be a non-empty array of document ids",
    });
    expect(mocks.deleteSourceDocuments).not.toHaveBeenCalled();
  });

  it("rejects empty or blank document ids", async () => {
    const response = await DELETE(
      deleteRequest(JSON.stringify({ documentIds: ["doc-1", "   "] }))
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "documentIds must be a non-empty array of document ids",
    });
    expect(mocks.deleteSourceDocuments).not.toHaveBeenCalled();
  });
});
