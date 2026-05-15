import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  MatchScoreBar,
  MATCH_THRESHOLDS,
  getMatchTier,
} from "./match-score-bar";

describe("getMatchTier", () => {
  it.each([
    [100, "strong"],
    [MATCH_THRESHOLDS.strong, "strong"],
    [MATCH_THRESHOLDS.strong - 1, "ok"],
    [MATCH_THRESHOLDS.ok, "ok"],
    [MATCH_THRESHOLDS.ok - 1, "weak"],
    [0, "weak"],
  ])("treats %d as %s", (value, tier) => {
    expect(getMatchTier(value)).toBe(tier);
  });
});

describe("MatchScoreBar", () => {
  it("renders the value as a tabular percent by default", () => {
    render(<MatchScoreBar value={72} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("clamps out-of-range values to 0–100", () => {
    render(<MatchScoreBar value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("rounds fractional values", () => {
    render(<MatchScoreBar value={66.4} />);
    expect(screen.getByText("66%")).toBeInTheDocument();
  });

  it("hides the value when hideValue=true", () => {
    render(<MatchScoreBar value={50} hideValue />);
    expect(screen.queryByText("50%")).toBeNull();
  });

  it("shows the tier label when showTier=true", () => {
    render(<MatchScoreBar value={92} showTier />);
    expect(screen.getByText("Strong fit")).toBeInTheDocument();
  });

  it("uses a custom trailing label when provided", () => {
    render(<MatchScoreBar value={50} trailingLabel="Pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("applies the strong-tier fill class for values ≥85", () => {
    const { container } = render(<MatchScoreBar value={90} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill?.className).toMatch(/stage-applied-dot/);
  });

  it("applies the weak-tier fill class for values <65", () => {
    const { container } = render(<MatchScoreBar value={40} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill?.className).toMatch(/stage-interview-dot/);
  });

  it("applies the ok-tier brand fill class for values in [65,85)", () => {
    const { container } = render(<MatchScoreBar value={70} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill?.className).toMatch(/bg-brand/);
  });
});
