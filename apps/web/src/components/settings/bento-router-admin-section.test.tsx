import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SlothingBentoRouterAdminSection } from "./bento-router-admin-section";

describe("SlothingBentoRouterAdminSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tasks: [
            {
              id: "slothing.parse_resume",
              appId: "slothing",
              name: "Parse resume",
              category: "Studio",
              description: "Extract structured resume chunks from resume text.",
              effectivePolicy: {
                primaryModel: "openrouter/anthropic/claude-haiku-4.5",
                fallbacks: ["openrouter/google/gemini-flash"],
                guardrails: {
                  maxRequestCostUsd: 0.02,
                  timeoutMs: 20000,
                  maxRetries: 1,
                },
              },
            },
          ],
          models: [
            {
              id: "openrouter/anthropic/claude-haiku-4.5",
              displayName: "Claude Haiku 4.5 via OpenRouter",
              provider: "openrouter",
              qualityTier: "standard",
              maxContextTokens: 200000,
            },
            {
              id: "openai/gpt-4o-mini",
              displayName: "GPT-4o Mini",
              provider: "openai",
              qualityTier: "cheap",
              maxContextTokens: 128000,
            },
          ],
          providers: [
            {
              id: "openai-personal",
              type: "openai",
              displayName: "OpenAI Personal",
              createdAt: "2026-05-18T00:00:00.000Z",
            },
          ],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the BentoRouter admin provider and task policy UI", async () => {
    render(<SlothingBentoRouterAdminSection />);

    expect(
      screen.getByRole("heading", { name: "BentoRouter provider policies" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("OpenAI Personal")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Parse resume").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Extract structured resume chunks from resume text.")
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText("Task provider")).toBeInTheDocument();
    expect(screen.getByLabelText("Task model")).toBeInTheDocument();
  });

  it("saves task policies with separate provider and model controls", async () => {
    render(<SlothingBentoRouterAdminSection />);

    await waitFor(() => {
      expect(screen.getByLabelText("Task provider")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Task provider"), {
      target: { value: "openai" },
    });
    expect(screen.getByLabelText("Task model")).toHaveValue(
      "openai/gpt-4o-mini",
    );

    fireEvent.click(screen.getByRole("button", { name: "Save policy" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/settings/llm/bentorouter/policies/slothing.parse_resume",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ primaryModel: "openai/gpt-4o-mini" }),
        }),
      );
    });
  });
});
