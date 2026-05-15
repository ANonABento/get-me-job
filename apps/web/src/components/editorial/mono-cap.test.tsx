import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MonoCap } from "./mono-cap";

describe("MonoCap", () => {
  it("renders as a span by default with mono + uppercase + tracked classes", () => {
    render(<MonoCap>Inside Slothing</MonoCap>);
    const el = screen.getByText("Inside Slothing");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass(
      "font-mono",
      "uppercase",
      "tracking-[0.14em]",
      "text-[11px]",
      "text-ink-3",
    );
  });

  it("supports size variants", () => {
    const { rerender } = render(<MonoCap size="sm">A</MonoCap>);
    expect(screen.getByText("A")).toHaveClass("text-[10px]");
    rerender(<MonoCap size="lg">A</MonoCap>);
    expect(screen.getByText("A")).toHaveClass("text-[12.5px]");
  });

  it("supports tone variants", () => {
    const { rerender } = render(<MonoCap tone="ink">A</MonoCap>);
    expect(screen.getByText("A")).toHaveClass("text-ink-2");
    rerender(<MonoCap tone="accent">A</MonoCap>);
    expect(screen.getByText("A")).toHaveClass("text-brand");
  });

  it("renders as a custom element when `as` is provided", () => {
    render(<MonoCap as="h3">Heading</MonoCap>);
    expect(screen.getByText("Heading").tagName).toBe("H3");
  });

  it("merges custom className", () => {
    render(<MonoCap className="extra-class">A</MonoCap>);
    expect(screen.getByText("A")).toHaveClass("extra-class", "font-mono");
  });
});
