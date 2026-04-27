import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GapAnalysis, ScoreRing } from "./gap-analysis";
import type { GapItem } from "@/lib/tailor/analyze";

const mockGaps: GapItem[] = [
  { requirement: "docker", category: "skill", suggestion: 'Add "docker" to Skills and support it with a project or experience bullet' },
  { requirement: "kubernetes", category: "skill", suggestion: 'Add "kubernetes" to Skills and support it with a project or experience bullet' },
];

describe("ScoreRing", () => {
  it("should render the score percentage", () => {
    render(<ScoreRing score={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should show 'Strong match' for scores >= 70", () => {
    render(<ScoreRing score={85} />);
    expect(screen.getByText("Strong match")).toBeInTheDocument();
  });

  it("should show 'Moderate match' for scores 40-69", () => {
    render(<ScoreRing score={55} />);
    expect(screen.getByText("Moderate match")).toBeInTheDocument();
  });

  it("should show 'Needs work' for scores < 40", () => {
    render(<ScoreRing score={25} />);
    expect(screen.getByText("Needs work")).toBeInTheDocument();
  });

  it("should render SVG circles", () => {
    const { container } = render(<ScoreRing score={50} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("should accept custom size and strokeWidth", () => {
    const { container } = render(<ScoreRing score={50} size={80} strokeWidth={6} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
  });
});

describe("GapAnalysis", () => {
  it("should render matched keywords section", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={["react", "typescript"]}
        keywordsMissing={[]}
        matchScore={80}
      />
    );
    expect(screen.getByText("Matched Keywords")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("2 found")).toBeInTheDocument();
  });

  it("should render missing keywords section", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={[]}
        keywordsMissing={["docker", "kubernetes"]}
        matchScore={20}
      />
    );
    expect(screen.getByText("Missing Keywords")).toBeInTheDocument();
    expect(screen.getByText("docker")).toBeInTheDocument();
    expect(screen.getByText("kubernetes")).toBeInTheDocument();
    expect(screen.getByText("2 missing")).toBeInTheDocument();
  });

  it("should render improvement suggestions", () => {
    render(
      <GapAnalysis
        gaps={mockGaps}
        keywordsFound={["react"]}
        keywordsMissing={["docker"]}
        matchScore={50}
      />
    );
    expect(screen.getByText("Improvement Suggestions")).toBeInTheDocument();
    expect(screen.getByText("2 tips")).toBeInTheDocument();
    expect(screen.getByText(/Add "docker" to Skills/)).toBeInTheDocument();
  });

  it("should show keyword count summary", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={["react", "typescript"]}
        keywordsMissing={["docker"]}
        matchScore={67}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument(); // found count
    expect(screen.getByText("3")).toBeInTheDocument(); // total count
  });

  it("should show '+N more' when keywords exceed display limit", () => {
    const manyKeywords = Array.from({ length: 15 }, (_, i) => `keyword${i}`);
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={manyKeywords}
        keywordsMissing={[]}
        matchScore={100}
      />
    );
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  it("should not render matched section when no keywords found", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={[]}
        keywordsMissing={["docker"]}
        matchScore={0}
      />
    );
    expect(screen.queryByText("Matched Keywords")).not.toBeInTheDocument();
  });

  it("should not render missing section when no keywords missing", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={["react"]}
        keywordsMissing={[]}
        matchScore={100}
      />
    );
    expect(screen.queryByText("Missing Keywords")).not.toBeInTheDocument();
  });

  it("should not render suggestions when no gaps", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={["react"]}
        keywordsMissing={[]}
        matchScore={100}
      />
    );
    expect(screen.queryByText("Improvement Suggestions")).not.toBeInTheDocument();
  });

  it("should render the score ring", () => {
    render(
      <GapAnalysis
        gaps={[]}
        keywordsFound={["react"]}
        keywordsMissing={[]}
        matchScore={75}
      />
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});
