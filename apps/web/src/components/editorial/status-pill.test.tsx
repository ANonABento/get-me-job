import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill, STAGE_PRESENTATION, type StageId } from "./status-pill";

const STAGES: StageId[] = [
  "saved",
  "apply",
  "applied",
  "interview",
  "offer",
  "rejected",
];

describe("StatusPill", () => {
  it.each(STAGES)("renders the default label for stage=%s", (stage) => {
    render(<StatusPill stage={stage} />);
    expect(screen.getByText(STAGE_PRESENTATION[stage].label)).toBeVisible();
  });

  it("allows a custom label via children", () => {
    render(<StatusPill stage="applied">Sent May 12</StatusPill>);
    expect(screen.getByText("Sent May 12")).toBeVisible();
    // default label should not also render
    expect(screen.queryByText("Applied")).toBeNull();
  });

  it("includes the leading dot for visual stage indication", () => {
    const { container } = render(<StatusPill stage="offer" />);
    const dot = container.querySelector('span[aria-hidden="true"]');
    expect(dot).not.toBeNull();
    expect(dot?.className).toMatch(/h-1\.5 w-1\.5 rounded-full/);
  });

  it("uses brand-aligned classes for the apply stage", () => {
    const { container } = render(<StatusPill stage="apply" />);
    const pill = container.querySelector("span:not([aria-hidden])");
    expect(pill?.className).toMatch(/bg-brand-soft/);
  });

  it("applies line-through styling for the rejected stage", () => {
    const { container } = render(<StatusPill stage="rejected" />);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toMatch(/line-through/);
  });
});
