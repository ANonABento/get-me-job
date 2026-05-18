import { render, screen, waitFor } from "@testing-library/react";
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
              effectivePolicy: {
                primaryModel: "openrouter/anthropic/claude-haiku-4.5",
                fallbacks: ["openrouter/google/gemini-flash"],
              },
            },
          ],
          models: [
            {
              id: "openrouter/anthropic/claude-haiku-4.5",
              displayName: "Claude Haiku 4.5 via OpenRouter",
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
    expect(screen.getByLabelText("Primary model")).toBeInTheDocument();
  });
});
