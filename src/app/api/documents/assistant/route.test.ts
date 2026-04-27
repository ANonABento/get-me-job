import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getLLMConfig: vi.fn(),
  getClientIdentifier: vi.fn(),
  llmRateLimiter: vi.fn(),
  rewriteDocumentSelection: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db", () => ({
  getLLMConfig: mocks.getLLMConfig,
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimiters: {
    llm: mocks.llmRateLimiter,
  },
}));

vi.mock("@/lib/document-assistant", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/document-assistant")>()),
  rewriteDocumentSelection: mocks.rewriteDocumentSelection,
}));

import { POST } from "./route";

function assistantRequest(body: string) {
  return new NextRequest("http://localhost/api/documents/assistant", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}

describe("documents assistant route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getClientIdentifier.mockReturnValue("user:user-1");
    mocks.llmRateLimiter.mockReturnValue({ allowed: true });
    mocks.getLLMConfig.mockReturnValue({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
    });
    mocks.rewriteDocumentSelection.mockResolvedValue("Better selected text.");
  });

  it("rewrites selected document text for the authenticated user", async () => {
    const response = await POST(
      assistantRequest(
        JSON.stringify({
          action: "rewrite",
          selectedText: "Original text.",
          documentContent: "Original text.",
          jobDescription: "React role",
        }),
      ),
    );

    expect(mocks.getLLMConfig).toHaveBeenCalledWith("user-1");
    expect(mocks.rewriteDocumentSelection).toHaveBeenCalledWith(
      {
        action: "rewrite",
        selectedText: "Original text.",
        documentContent: "Original text.",
        jobDescription: "React role",
      },
      {
        provider: "openai",
        apiKey: "sk-test",
        model: "gpt-4o-mini",
      },
    );
    await expect(response.json()).resolves.toEqual({
      success: true,
      content: "Better selected text.",
    });
  });

  it("rejects malformed JSON without calling the LLM", async () => {
    const response = await POST(assistantRequest("{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON",
    });
    expect(mocks.rewriteDocumentSelection).not.toHaveBeenCalled();
  });

  it("rejects unsupported assistant actions", async () => {
    const response = await POST(
      assistantRequest(
        JSON.stringify({
          action: "invent",
          selectedText: "Original text.",
          documentContent: "Original text.",
        }),
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Unsupported assistant action.",
    });
    expect(mocks.rewriteDocumentSelection).not.toHaveBeenCalled();
  });

  it("rejects empty LLM rewrites", async () => {
    mocks.rewriteDocumentSelection.mockResolvedValueOnce("   ");

    const response = await POST(
      assistantRequest(
        JSON.stringify({
          action: "rewrite",
          selectedText: "Original text.",
          documentContent: "Original text.",
        }),
      ),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Assistant returned an empty rewrite. Please try again.",
    });
  });
});
