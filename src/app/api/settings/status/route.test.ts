import { describe, it, expect } from "vitest";
import { isLLMConfigured } from "@/lib/llm/is-configured";

describe("isLLMConfigured", () => {
  it("returns false for null config", () => {
    expect(isLLMConfigured(null)).toBe(false);
  });

  it("returns false when model is empty", () => {
    expect(isLLMConfigured({ provider: "openai", apiKey: "sk-test", model: "" })).toBe(false);
  });

  it("returns true for ollama without API key", () => {
    expect(isLLMConfigured({ provider: "ollama", model: "llama3.2" })).toBe(true);
  });

  it("returns true for ollama with empty API key", () => {
    expect(isLLMConfigured({ provider: "ollama", apiKey: "", model: "llama3.2" })).toBe(true);
  });

  it("returns false for openai without API key", () => {
    expect(isLLMConfigured({ provider: "openai", model: "gpt-4o-mini" })).toBe(false);
  });

  it("returns false for openai with empty API key", () => {
    expect(isLLMConfigured({ provider: "openai", apiKey: "", model: "gpt-4o-mini" })).toBe(false);
  });

  it("returns true for openai with API key", () => {
    expect(isLLMConfigured({ provider: "openai", apiKey: "sk-test123", model: "gpt-4o-mini" })).toBe(true);
  });

  it("returns true for anthropic with API key", () => {
    expect(isLLMConfigured({ provider: "anthropic", apiKey: "sk-ant-test", model: "claude-3-haiku-20240307" })).toBe(true);
  });

  it("returns false for anthropic without API key", () => {
    expect(isLLMConfigured({ provider: "anthropic", model: "claude-3-haiku-20240307" })).toBe(false);
  });

  it("returns true for openrouter with API key", () => {
    expect(isLLMConfigured({ provider: "openrouter", apiKey: "sk-or-test", model: "meta-llama/llama-3.2-3b-instruct:free" })).toBe(true);
  });

  it("returns false for openrouter without API key", () => {
    expect(isLLMConfigured({ provider: "openrouter", model: "meta-llama/llama-3.2-3b-instruct:free" })).toBe(false);
  });
});
