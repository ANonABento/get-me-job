import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonJobCard,
  SkeletonInsights,
  SkeletonTableRow,
  SkeletonChart,
  SkeletonButton,
} from "./skeleton";

describe("Skeleton", () => {
  it("should render with skeleton class", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("rounded-md");
  });

  it("should merge custom className", () => {
    render(<Skeleton data-testid="skeleton" className="h-8 w-32" />);
    const el = screen.getByTestId("skeleton");
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("h-8");
    expect(el.className).toContain("w-32");
  });

  it("should pass through HTML attributes", () => {
    render(<Skeleton data-testid="skeleton" aria-label="loading" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-label", "loading");
  });
});

describe("SkeletonText", () => {
  it("should render default 1 line", () => {
    render(<SkeletonText data-testid="text" />);
    const container = screen.getByTestId("text");
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBe(1);
  });

  it("should render multiple lines", () => {
    render(<SkeletonText lines={3} data-testid="text" />);
    const container = screen.getByTestId("text");
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("should make last line shorter", () => {
    render(<SkeletonText lines={2} data-testid="text" />);
    const container = screen.getByTestId("text");
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons[0].className).toContain("w-full");
    expect(skeletons[1].className).toContain("w-3/4");
  });
});

describe("SkeletonCard", () => {
  it("should render card structure", () => {
    render(<SkeletonCard data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("rounded-lg");
    expect(card.className).toContain("border");
    expect(card.className).toContain("bg-card");
    // Should contain skeleton elements
    const skeletons = card.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should merge custom className", () => {
    render(<SkeletonCard data-testid="card" className="w-full" />);
    expect(screen.getByTestId("card").className).toContain("w-full");
  });
});

describe("SkeletonStatCard", () => {
  it("should render stat card structure", () => {
    render(<SkeletonStatCard data-testid="stat" />);
    const stat = screen.getByTestId("stat");
    expect(stat.className).toContain("rounded-2xl");
    expect(stat.className).toContain("border");
    const skeletons = stat.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("SkeletonJobCard", () => {
  it("should render job card structure", () => {
    render(<SkeletonJobCard data-testid="job" />);
    const job = screen.getByTestId("job");
    expect(job.className).toContain("rounded-xl");
    expect(job.className).toContain("border");
    const skeletons = job.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("SkeletonInsights", () => {
  it("should render insights structure", () => {
    render(<SkeletonInsights data-testid="insights" />);
    const insights = screen.getByTestId("insights");
    expect(insights.className).toContain("rounded-2xl");
    const skeletons = insights.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("SkeletonTableRow", () => {
  it("should render default 4 columns", () => {
    render(<SkeletonTableRow data-testid="row" />);
    const row = screen.getByTestId("row");
    const skeletons = row.querySelectorAll(".skeleton");
    expect(skeletons.length).toBe(4);
  });

  it("should render custom column count", () => {
    render(<SkeletonTableRow columns={6} data-testid="row" />);
    const row = screen.getByTestId("row");
    const skeletons = row.querySelectorAll(".skeleton");
    expect(skeletons.length).toBe(6);
  });
});

describe("SkeletonChart", () => {
  it("should render chart structure with header and body", () => {
    render(<SkeletonChart data-testid="chart" />);
    const chart = screen.getByTestId("chart");
    expect(chart.className).toContain("rounded-lg");
    expect(chart.className).toContain("border");
    expect(chart.className).toContain("bg-card");
    const skeletons = chart.querySelectorAll(".skeleton");
    // 2 header items + 1 chart body + 3 legend items = 6
    expect(skeletons.length).toBe(6);
  });

  it("should merge custom className", () => {
    render(<SkeletonChart data-testid="chart" className="h-96" />);
    expect(screen.getByTestId("chart").className).toContain("h-96");
  });
});

describe("SkeletonButton", () => {
  it("should render a single skeleton sized like a button", () => {
    render(<SkeletonButton data-testid="btn" />);
    const btn = screen.getByTestId("btn");
    expect(btn.className).toContain("skeleton");
    expect(btn.className).toContain("h-9");
    expect(btn.className).toContain("w-32");
  });

  it("should allow width override via className", () => {
    render(<SkeletonButton data-testid="btn" className="w-48" />);
    expect(screen.getByTestId("btn").className).toContain("w-48");
  });
});
