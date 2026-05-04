import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LLMProviderConfig } from "./llm-provider-config";

const baseProps = {
  config: {
    provider: "ollama" as const,
    model: "llama3.2",
    baseUrl: "http://localhost:11434",
  },
  selectedProvider: {
    value: "ollama" as const,
    label: "Ollama",
    description: "Local models",
    icon: null,
    requiresKey: false,
  },
  models: ["llama3.2"],
  testing: false,
  saveStatus: "saved" as const,
  testResult: null,
  onConfigChange: vi.fn(),
  onSave: vi.fn(),
  onTestConnection: vi.fn(),
};

describe("LLMProviderConfig", () => {
  it("shows failed auto-save status with a retry handler", () => {
    const onSave = vi.fn();

    render(
      <LLMProviderConfig
        {...baseProps}
        saveStatus="error"
        onSave={onSave}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Save failed");

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onSave).toHaveBeenCalledOnce();
  });
});
