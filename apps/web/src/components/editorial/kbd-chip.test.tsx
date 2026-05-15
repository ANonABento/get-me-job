import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KbdChip } from "./kbd-chip";

describe("KbdChip", () => {
  it("renders a single key from children as a kbd element", () => {
    render(<KbdChip>K</KbdChip>);
    const el = screen.getByText("K");
    expect(el.tagName).toBe("KBD");
    expect(el).toHaveClass("font-mono", "uppercase", "border-rule", "bg-paper");
  });

  it("renders a multi-key combo with one chip per key", () => {
    render(<KbdChip keys={["⌘", "K"]} />);
    const wrapper = screen.getByLabelText("⌘ K");
    const chips = wrapper.querySelectorAll("kbd");
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toBe("⌘");
    expect(chips[1].textContent).toBe("K");
  });

  it("applies the smaller size class by default", () => {
    render(<KbdChip>K</KbdChip>);
    expect(screen.getByText("K")).toHaveClass("text-[10px]");
  });

  it("applies the md size class when requested", () => {
    render(<KbdChip size="md">K</KbdChip>);
    expect(screen.getByText("K")).toHaveClass("text-[11px]");
  });

  it("merges custom className", () => {
    render(<KbdChip className="ring-1">K</KbdChip>);
    expect(screen.getByText("K")).toHaveClass("ring-1", "font-mono");
  });
});
