import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialEyebrow } from "./editorial-eyebrow";

describe("EditorialEyebrow", () => {
  it("renders label, dot, and no number by default", () => {
    const { container } = render(
      <EditorialEyebrow>Inside Slothing</EditorialEyebrow>,
    );
    expect(screen.getByText("Inside Slothing")).toBeInTheDocument();
    // dot is rendered as the first aria-hidden span
    const dots = container.querySelectorAll('span[aria-hidden="true"]');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("zero-pads a numeric prefix to two digits", () => {
    render(<EditorialEyebrow number={3}>Knowledge Bank</EditorialEyebrow>);
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Knowledge Bank")).toBeInTheDocument();
  });

  it("preserves a string prefix as-is", () => {
    render(<EditorialEyebrow number="A1">Test</EditorialEyebrow>);
    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  it("hides the dot when dot={false}", () => {
    const { container } = render(
      <EditorialEyebrow dot={false} number={1}>
        T
      </EditorialEyebrow>,
    );
    const dotEls = Array.from(
      container.querySelectorAll('span[aria-hidden="true"]'),
    ).filter((el) => el.className.includes("rounded-full"));
    expect(dotEls).toHaveLength(0);
  });
});
