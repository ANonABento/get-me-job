import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LLMProviderSelector } from "./llm-provider-selector";

describe("LLMProviderSelector", () => {
  it("shows an explicit selected badge on the active provider", () => {
    render(
      <LLMProviderSelector
        provider="openai"
        apiKey="test-key"
        onProviderChange={vi.fn()}
      />,
    );

    const openAi = screen.getByRole("button", { name: /OpenAI/i });
    expect(openAi).toHaveAttribute("aria-pressed", "true");
    expect(openAi).toHaveTextContent("Selected");
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });

  it("keeps the current api key when switching cloud providers", () => {
    const onProviderChange = vi.fn();
    render(
      <LLMProviderSelector
        provider="openai"
        apiKey="test-key"
        onProviderChange={onProviderChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Anthropic/i }));

    expect(onProviderChange).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "anthropic",
        apiKey: "test-key",
      }),
    );
  });
});
