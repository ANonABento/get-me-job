import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildTailoringPrompt, generateWithGPT55, generateWithClaude, GPT55_MODEL, CLAUDE_SONNET_MODEL } from "../generators.js";
import type { TestCase } from "../types.js";

const SAMPLE_TEST_CASE: TestCase = {
  id: "tc-test",
  label: "Test case",
  candidateProfile: "Software engineer with 3 years experience in React and Node.js.",
  jobDescription: "Looking for a senior frontend engineer with React and TypeScript skills.",
};

describe("buildTailoringPrompt", () => {
  it("includes the job description", () => {
    const prompt = buildTailoringPrompt(SAMPLE_TEST_CASE);
    expect(prompt).toContain(SAMPLE_TEST_CASE.jobDescription);
  });

  it("includes the candidate profile", () => {
    const prompt = buildTailoringPrompt(SAMPLE_TEST_CASE);
    expect(prompt).toContain(SAMPLE_TEST_CASE.candidateProfile);
  });

  it("asks to tailor the resume", () => {
    const prompt = buildTailoringPrompt(SAMPLE_TEST_CASE);
    expect(prompt.toLowerCase()).toContain("tailor");
  });

  it("returns a non-empty string", () => {
    const prompt = buildTailoringPrompt(SAMPLE_TEST_CASE);
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe("generateWithGPT55", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns output on success", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Tailored resume content here." } }],
      }),
    } as Response);

    const result = await generateWithGPT55(SAMPLE_TEST_CASE, "test-key");

    expect(result.model).toBe(GPT55_MODEL);
    expect(result.provider).toBe("openai");
    expect(result.output).toBe("Tailored resume content here.");
    expect(result.error).toBeUndefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns error on API failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    } as Response);

    const result = await generateWithGPT55(SAMPLE_TEST_CASE, "test-key");

    expect(result.model).toBe(GPT55_MODEL);
    expect(result.output).toBe("");
    expect(result.error).toContain("429");
  });

  it("returns error on network failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await generateWithGPT55(SAMPLE_TEST_CASE, "test-key");

    expect(result.output).toBe("");
    expect(result.error).toBe("Network error");
  });

  it("calls the correct OpenAI endpoint", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "output" } }] }),
    } as Response);

    await generateWithGPT55(SAMPLE_TEST_CASE, "test-key");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      })
    );
  });
});

describe("generateWithClaude", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns output on success", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "Claude tailored resume." }],
      }),
    } as Response);

    const result = await generateWithClaude(SAMPLE_TEST_CASE, "test-key");

    expect(result.model).toBe(CLAUDE_SONNET_MODEL);
    expect(result.provider).toBe("anthropic");
    expect(result.output).toBe("Claude tailored resume.");
    expect(result.error).toBeUndefined();
  });

  it("returns error on API failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as Response);

    const result = await generateWithClaude(SAMPLE_TEST_CASE, "bad-key");

    expect(result.output).toBe("");
    expect(result.error).toContain("401");
  });

  it("calls the correct Anthropic endpoint", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ type: "text", text: "output" }] }),
    } as Response);

    await generateWithClaude(SAMPLE_TEST_CASE, "test-key");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "test-key" }),
      })
    );
  });
});
