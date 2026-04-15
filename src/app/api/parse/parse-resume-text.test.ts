import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LLMConfig } from "@/types";

const mockParseResumeWithLLM = vi.fn();
const mockParseResumeBasic = vi.fn();

vi.mock("@/lib/parser/resume", () => ({
  parseResumeWithLLM: (...args: unknown[]) => mockParseResumeWithLLM(...args),
  parseResumeBasic: (...args: unknown[]) => mockParseResumeBasic(...args),
}));

import { parseResumeText } from "./route";

const sampleText = "John Doe\nSoftware Engineer\n5 years experience";
const llmConfig: LLMConfig = {
  provider: "openai",
  model: "gpt-4",
  apiKey: "sk-test",
};

const basicProfile = {
  contact: { name: "John Doe" },
  experiences: [],
  skills: [],
};

const aiProfile = {
  contact: { name: "John Doe", email: "john@example.com" },
  experiences: [{ company: "Acme", title: "Engineer" }],
  skills: [{ name: "TypeScript" }],
};

describe("parseResumeText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseResumeBasic.mockReturnValue(basicProfile);
    mockParseResumeWithLLM.mockResolvedValue(aiProfile);
  });

  it("uses AI parsing when LLM config is provided", async () => {
    const result = await parseResumeText(sampleText, llmConfig);

    expect(mockParseResumeWithLLM).toHaveBeenCalledWith(sampleText, llmConfig);
    expect(result.parsingMethod).toBe("ai");
    expect(result.llmFallback).toBe(false);
    expect(result.parsedProfile).toEqual(aiProfile);
  });

  it("uses basic parsing when no LLM config", async () => {
    const result = await parseResumeText(sampleText, null);

    expect(mockParseResumeWithLLM).not.toHaveBeenCalled();
    expect(mockParseResumeBasic).toHaveBeenCalledWith(sampleText);
    expect(result.parsingMethod).toBe("basic");
    expect(result.llmFallback).toBe(false);
    expect(result.parsedProfile).toEqual(basicProfile);
  });

  it("falls back to basic parsing when LLM throws", async () => {
    mockParseResumeWithLLM.mockRejectedValue(new Error("API rate limit"));

    const result = await parseResumeText(sampleText, llmConfig);

    expect(mockParseResumeWithLLM).toHaveBeenCalledWith(sampleText, llmConfig);
    expect(mockParseResumeBasic).toHaveBeenCalledWith(sampleText);
    expect(result.parsingMethod).toBe("basic");
    expect(result.llmFallback).toBe(true);
    expect(result.parsedProfile).toEqual(basicProfile);
  });
});
