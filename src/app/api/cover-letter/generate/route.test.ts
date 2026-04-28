import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getLLMConfig: vi.fn(),
  getProfile: vi.fn(),
  getGroupedBankEntries: vi.fn(),
  getClientIdentifier: vi.fn(),
  llmRateLimiter: vi.fn(),
  generateCoverLetter: vi.fn(),
  reviseCoverLetter: vi.fn(),
  rewriteCoverLetterSelection: vi.fn(),
  getTotalBankEntries: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/db", () => ({
  getLLMConfig: mocks.getLLMConfig,
  getProfile: mocks.getProfile,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  getGroupedBankEntries: mocks.getGroupedBankEntries,
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimiters: {
    llm: mocks.llmRateLimiter,
  },
}));

vi.mock("@/lib/cover-letter/generate", () => ({
  generateCoverLetter: mocks.generateCoverLetter,
  reviseCoverLetter: mocks.reviseCoverLetter,
  rewriteCoverLetterSelection: mocks.rewriteCoverLetterSelection,
  getTotalBankEntries: mocks.getTotalBankEntries,
}));

import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/cover-letter/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("cover letter generate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getClientIdentifier.mockReturnValue("client-1");
    mocks.llmRateLimiter.mockReturnValue({ allowed: true });
    mocks.getLLMConfig.mockReturnValue({
      provider: "openai",
      apiKey: "test-key",
      model: "gpt-test",
    });
    mocks.getProfile.mockReturnValue({ contact: { name: "Jane Doe" } });
    mocks.getGroupedBankEntries.mockReturnValue({
      experience: [],
      skill: [{ id: "skill-1", content: { name: "React" } }],
      project: [],
      education: [],
      achievement: [],
      certification: [],
    });
    mocks.getTotalBankEntries.mockReturnValue(1);
  });

  it("routes selection rewrites to the rewrite helper", async () => {
    mocks.rewriteCoverLetterSelection.mockResolvedValue("Reliable API impact.");

    const response = await POST(
      jsonRequest({
        jobDescription:
          "We need a frontend engineer who can improve reliability across customer-facing systems.",
        jobTitle: "Frontend Engineer",
        company: "Acme",
        action: "rewrite",
        currentContent: "I built APIs quickly.",
        selectedText: "I built APIs quickly.",
        instruction: "Add reliability impact",
      })
    );

    await expect(response.json()).resolves.toEqual({
      success: true,
      content: "Reliable API impact.",
    });
    expect(mocks.rewriteCoverLetterSelection).toHaveBeenCalledWith(
      "I built APIs quickly.",
      "I built APIs quickly.",
      "Add reliability impact",
      expect.objectContaining({
        jobTitle: "Frontend Engineer",
        company: "Acme",
        userName: "Jane Doe",
      }),
      expect.objectContaining({ model: "gpt-test" })
    );
    expect(mocks.generateCoverLetter).not.toHaveBeenCalled();
  });

  it("rejects rewrite requests without selected text", async () => {
    const response = await POST(
      jsonRequest({
        jobDescription:
          "We need a frontend engineer who can improve reliability across customer-facing systems.",
        action: "rewrite",
        currentContent: "I built APIs quickly.",
        selectedText: " ",
        instruction: "Rewrite",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error:
        "currentContent, selectedText, and instruction are required for rewriting.",
    });
    expect(mocks.rewriteCoverLetterSelection).not.toHaveBeenCalled();
  });

  it("rejects unsupported actions", async () => {
    const response = await POST(
      jsonRequest({
        jobDescription:
          "We need a frontend engineer who can improve reliability across customer-facing systems.",
        action: "summarize",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Unsupported cover letter action.",
    });
    expect(mocks.generateCoverLetter).not.toHaveBeenCalled();
    expect(mocks.reviseCoverLetter).not.toHaveBeenCalled();
    expect(mocks.rewriteCoverLetterSelection).not.toHaveBeenCalled();
  });
});
