import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildJudgePrompt, parseJudgeResponse, judgeOutputs, CLAUDE_OPUS_MODEL } from "../judge.js";
import type { TestCase, GeneratorResult } from "../types.js";

const SAMPLE_TEST_CASE: TestCase = {
  id: "tc-test",
  label: "Test case",
  candidateProfile: "Software engineer with 3 years React experience.",
  jobDescription: "Senior frontend engineer with React and TypeScript.",
};

const GPT55_RESULT: GeneratorResult = {
  model: "gpt-5.5",
  provider: "openai",
  output: "Experienced React developer with TypeScript proficiency...",
  latencyMs: 1200,
};

const CLAUDE_RESULT: GeneratorResult = {
  model: "claude-sonnet-4-6",
  provider: "anthropic",
  output: "Results-driven frontend engineer skilled in React and TypeScript...",
  latencyMs: 900,
};

describe("buildJudgePrompt", () => {
  it("includes the job description", () => {
    const prompt = buildJudgePrompt(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT);
    expect(prompt).toContain(SAMPLE_TEST_CASE.jobDescription);
  });

  it("includes the candidate profile", () => {
    const prompt = buildJudgePrompt(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT);
    expect(prompt).toContain(SAMPLE_TEST_CASE.candidateProfile);
  });

  it("includes both resume outputs", () => {
    const prompt = buildJudgePrompt(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT);
    expect(prompt).toContain(GPT55_RESULT.output);
    expect(prompt).toContain(CLAUDE_RESULT.output);
  });

  it("labels resumes as A and B (blind evaluation)", () => {
    const prompt = buildJudgePrompt(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT);
    expect(prompt).toContain("RESUME A:");
    expect(prompt).toContain("RESUME B:");
    expect(prompt).not.toContain("GPT");
    expect(prompt).not.toContain("Claude");
  });

  it("handles failed generator output gracefully", () => {
    const failedResult: GeneratorResult = {
      model: "gpt-5.5",
      provider: "openai",
      output: "",
      latencyMs: 0,
      error: "API error",
    };
    const prompt = buildJudgePrompt(SAMPLE_TEST_CASE, failedResult, CLAUDE_RESULT);
    expect(prompt).toContain("[No output — generator failed]");
  });
});

describe("parseJudgeResponse", () => {
  it("parses a valid JSON response", () => {
    const response = JSON.stringify({
      resume_a: {
        score: 4,
        reasoning: "Strong keyword alignment with the job description.",
        strengths: ["TypeScript emphasis", "Relevant experience"],
        weaknesses: ["Missing metrics"],
      },
      resume_b: {
        score: 3,
        reasoning: "Good structure but lacks specific metrics.",
        strengths: ["Clear formatting"],
        weaknesses: ["Generic language", "No quantification"],
      },
    });

    const result = parseJudgeResponse(response, "gpt-5.5", "claude-sonnet-4-6");

    expect(result.gpt55.model).toBe("gpt-5.5");
    expect(result.gpt55.score).toBe(4);
    expect(result.gpt55.reasoning).toBe("Strong keyword alignment with the job description.");
    expect(result.gpt55.strengths).toHaveLength(2);
    expect(result.gpt55.weaknesses).toHaveLength(1);

    expect(result.claude.model).toBe("claude-sonnet-4-6");
    expect(result.claude.score).toBe(3);
  });

  it("strips preamble text before JSON", () => {
    const response = `Here is my evaluation:\n{"resume_a":{"score":5,"reasoning":"Excellent.","strengths":["a"],"weaknesses":["b"]},"resume_b":{"score":2,"reasoning":"Poor.","strengths":["c"],"weaknesses":["d"]}}`;

    const result = parseJudgeResponse(response, "gpt-5.5", "claude-sonnet-4-6");

    expect(result.gpt55.score).toBe(5);
    expect(result.claude.score).toBe(2);
  });

  it("coerces score to number", () => {
    const response = JSON.stringify({
      resume_a: { score: "4", reasoning: "Good.", strengths: [], weaknesses: [] },
      resume_b: { score: "3", reasoning: "OK.", strengths: [], weaknesses: [] },
    });

    const result = parseJudgeResponse(response, "gpt-5.5", "claude-sonnet-4-6");

    expect(typeof result.gpt55.score).toBe("number");
    expect(result.gpt55.score).toBe(4);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJudgeResponse("not json at all", "gpt-5.5", "claude")).toThrow();
  });
});

describe("judgeOutputs", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns scores for both models on success", async () => {
    const judgeResponse = JSON.stringify({
      resume_a: {
        score: 4,
        reasoning: "Strong output.",
        strengths: ["keyword alignment"],
        weaknesses: ["lacks detail"],
      },
      resume_b: {
        score: 3,
        reasoning: "Decent output.",
        strengths: ["clear structure"],
        weaknesses: ["generic language"],
      },
    });

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: judgeResponse }],
      }),
    } as Response);

    const result = await judgeOutputs(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT, "test-key");

    expect(result.gpt55.score).toBe(4);
    expect(result.claude.score).toBe(3);
    expect(result.gpt55.model).toBe(GPT55_RESULT.model);
    expect(result.claude.model).toBe(CLAUDE_RESULT.model);
  });

  it("calls Claude Opus model", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: JSON.stringify({
          resume_a: { score: 3, reasoning: "ok", strengths: [], weaknesses: [] },
          resume_b: { score: 3, reasoning: "ok", strengths: [], weaknesses: [] },
        }) }],
      }),
    } as Response);

    await judgeOutputs(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT, "test-key");

    const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(callBody.model).toBe(CLAUDE_OPUS_MODEL);
  });

  it("throws on API failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as Response);

    await expect(
      judgeOutputs(SAMPLE_TEST_CASE, GPT55_RESULT, CLAUDE_RESULT, "test-key")
    ).rejects.toThrow("500");
  });
});
