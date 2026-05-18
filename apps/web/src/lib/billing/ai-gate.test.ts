import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getLLMConfig: vi.fn(),
  getUserPlan: vi.fn(),
  deductCredits: vi.fn(),
  refundCredits: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getLLMConfig: mocks.getLLMConfig,
}));

vi.mock("@/lib/db/credits", () => ({
  deductCredits: mocks.deductCredits,
  refundCredits: mocks.refundCredits,
}));

vi.mock("./plans", () => ({
  getUserPlan: mocks.getUserPlan,
}));

import {
  gateAiFeature,
  gateOptionalAiFeature,
  isAiGateResponse,
} from "./ai-gate";

describe("gateAiFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SLOTHING_HOSTED_LLM_API_KEY;
    mocks.getUserPlan.mockReturnValue("hosted-free");
    mocks.getLLMConfig.mockReturnValue(null);
    mocks.deductCredits.mockReturnValue({
      userId: "user-1",
      delta: -5,
      reason: "usage",
      feature: "tailor",
      refId: "job-1",
    });
  });

  it("lets self-host users pass with their configured provider", () => {
    mocks.getUserPlan.mockReturnValue("self-host");
    mocks.getLLMConfig.mockReturnValue({
      provider: "openai",
      apiKey: "sk-byok",
      model: "gpt-test",
    });

    const result = gateAiFeature("user-1", "tailor", "job-1");

    expect(isAiGateResponse(result)).toBe(false);
    if (!isAiGateResponse(result)) {
      expect(result.source).toBe("self-host");
      expect(result.llmConfig.apiKey).toBe("sk-byok");
    }
    expect(mocks.deductCredits).not.toHaveBeenCalled();
  });

  it("lets hosted BYOK users pass without deducting credits", () => {
    mocks.getLLMConfig.mockReturnValue({
      provider: "anthropic",
      apiKey: "sk-byok",
      model: "claude-test",
    });

    const result = gateAiFeature("user-1", "cover_letter", "letter-1");

    expect(isAiGateResponse(result)).toBe(false);
    if (!isAiGateResponse(result)) expect(result.source).toBe("byok");
    expect(mocks.deductCredits).not.toHaveBeenCalled();
  });

  it("returns 402 for hosted-free users without BYOK", async () => {
    const result = gateAiFeature("user-1", "tailor", "job-1");

    expect(isAiGateResponse(result)).toBe(true);
    if (isAiGateResponse(result)) {
      expect(result.status).toBe(402);
      await expect(result.json()).resolves.toMatchObject({
        code: "billing_required",
      });
    }
  });

  it("deducts Pro credits and refunds on request", () => {
    process.env.SLOTHING_HOSTED_LLM_API_KEY = "sk-hosted";
    mocks.getUserPlan.mockReturnValue("pro-monthly");

    const result = gateAiFeature("user-1", "tailor", "job-1");

    expect(isAiGateResponse(result)).toBe(false);
    if (!isAiGateResponse(result)) {
      expect(result.source).toBe("credits");
      expect(result.llmConfig.apiKey).toBe("sk-hosted");
      result.refund();
    }
    expect(mocks.deductCredits).toHaveBeenCalledWith(
      "user-1",
      "tailor",
      "job-1",
    );
    expect(mocks.refundCredits).toHaveBeenCalledWith(
      "user-1",
      "tailor",
      "job-1",
    );
  });

  it("lets self-host optional AI routes fall back without a provider", () => {
    mocks.getUserPlan.mockReturnValue("self-host");

    const result = gateOptionalAiFeature("user-1", "tailor", "upload-1");

    expect(isAiGateResponse(result)).toBe(false);
    if (!isAiGateResponse(result)) {
      expect(result.source).toBe("self-host");
      expect(result.llmConfig).toBeNull();
    }
    expect(mocks.deductCredits).not.toHaveBeenCalled();
  });

  it("lets hosted-free optional AI routes fall back without billing", () => {
    const result = gateOptionalAiFeature("user-1", "tailor", "upload-1");

    expect(isAiGateResponse(result)).toBe(false);
    if (!isAiGateResponse(result)) {
      expect(result.source).toBe("fallback");
      expect(result.llmConfig).toBeNull();
    }
    expect(mocks.deductCredits).not.toHaveBeenCalled();
  });
});
