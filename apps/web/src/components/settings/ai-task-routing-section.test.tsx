import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiTaskRoutingSection } from "./ai-task-routing-section";

describe("AiTaskRoutingSection", () => {
  it("shows task groups and execution mode labels", () => {
    render(<AiTaskRoutingSection hasProvider={false} />);

    expect(
      screen.getByRole("heading", { name: "AI task routing" }),
    ).toBeInTheDocument();
    for (const surface of [
      "Studio",
      "Opportunities",
      "Cover Letters",
      "Interview",
      "Email",
      "Extension",
      "Learning",
    ]) {
      expect(
        screen.getByRole("heading", { name: surface }),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByText("Heuristic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Optional LLM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Needs LLM").length).toBeGreaterThan(0);
    expect(screen.getByText("Template import")).toBeInTheDocument();
    expect(screen.getByText("Salary negotiation script")).toBeInTheDocument();
  });

  it("links needs-LLM tasks to provider setup without hiding optional fallbacks", () => {
    render(<AiTaskRoutingSection hasProvider={false} />);

    expect(
      screen.getAllByRole("link", { name: "Set up provider" })[0],
    ).toHaveAttribute("href", "#ai-keys");

    expect(screen.getAllByText("Fallback available").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/deterministic PDF, DOCX, and LaTeX heuristics/i),
    ).toBeInTheDocument();
  });
});
