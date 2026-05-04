import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getLLMConfig: vi.fn(),
  getClientIdentifier: vi.fn(),
  llmRateLimiter: vi.fn(),
  complete: vi.fn(),
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

vi.mock("@/lib/llm/client", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/llm/client")>()),
  LLMClient: class MockLLMClient {
    complete = mocks.complete;
  },
}));

import { POST } from "./route";

function critiqueRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai/critique-cover-letter", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const validCritique = {
  scores: { fit: 8, specificity: 7, hook: 6, ask: 9 },
  overall: 7.5,
  rationale_per_axis: {
    fit: "Shows company awareness.",
    specificity: "Uses concrete systems.",
    hook: "Opening is serviceable.",
    ask: "Close has a clear ask.",
  },
  suggested_rewrites: [
    {
      range_in_letter: "I built reliable systems.",
      suggestion: "I improved reliability for customer workflows.",
      why: "Adds clearer impact.",
    },
    {
      range_in_letter: "I would love to talk.",
      suggestion: "I would welcome a conversation about the role.",
      why: "Makes the ask more direct.",
    },
  ],
};

describe("cover letter critique route", () => {
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
    mocks.complete.mockResolvedValue(JSON.stringify(validCritique));
  });

  it("returns a validated critique from the configured LLM", async () => {
    const response = await POST(
      critiqueRequest({
        letter:
          "Dear Acme, I built reliable systems. I would love to talk about this role.",
        jd: "Acme needs a product engineer to improve developer tooling and reliability.",
        company: "Acme",
        role: "Product Engineer",
      }),
    );

    expect(mocks.getLLMConfig).toHaveBeenCalledWith("user-1");
    expect(mocks.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.2,
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining("Company: Acme"),
          }),
        ]),
      }),
    );
    await expect(response.json()).resolves.toEqual({
      success: true,
      critique: validCritique,
    });
  });

  it("rejects invalid request bodies before calling the LLM", async () => {
    const response = await POST(
      critiqueRequest({ letter: "Too short", jd: "Too short" }),
    );

    expect(response.status).toBe(400);
    expect(mocks.complete).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid critique request.",
    });
  });

  it("returns setup guidance when no LLM provider is configured", async () => {
    mocks.getLLMConfig.mockReturnValueOnce(null);

    const response = await POST(
      critiqueRequest({
        letter:
          "Dear Acme, I built reliable systems. I would love to talk about this role.",
        jd: "Acme needs a product engineer to improve developer tooling and reliability.",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "No LLM provider configured. Go to Settings to set one up.",
    });
  });
});
