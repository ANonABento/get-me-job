import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ATSScoreCard } from "./ats-score-card";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";

const mockAnalysisResult: ATSAnalysisResult = {
  score: {
    overall: 75,
    formatting: 80,
    keywords: 70,
    content: 75,
    structure: 78,
  },
  issues: [
    {
      type: "warning",
      category: "formatting",
      title: "Missing phone number",
      description: "Your resume doesn't include a phone number",
      suggestion: "Add a phone number to make it easier for recruiters to contact you",
    },
    {
      type: "error",
      category: "keywords",
      title: "Low keyword density",
      description: "Important keywords appear less than expected",
      suggestion: "Include more relevant keywords from the job description",
    },
  ],
  keywords: [
    { keyword: "React", found: true, frequency: 3, locations: ["experience", "skills"] },
    { keyword: "Node.js", found: true, frequency: 2, locations: ["skills"] },
    { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
  ],
  summary: "Your resume has good ATS compatibility with room for improvement.",
  recommendations: [
    "Add more relevant keywords to match the job description",
    "Include a phone number in your contact information",
  ],
};

describe("ATSScoreCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders initial state with analyze button", () => {
    render(<ATSScoreCard />);

    expect(screen.getByText("ATS Compatibility Check")).toBeInTheDocument();
    expect(screen.getByText("Analyze Resume")).toBeInTheDocument();
  });

  it("shows loading state when analyzing", async () => {
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve(mockAnalysisResult),
              } as Response),
            100
          )
        )
    ) as unknown as typeof fetch;

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    expect(screen.getByText("Analyzing...")).toBeInTheDocument();
  });

  it("displays analysis results after successful analysis", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(screen.getByText("ATS Compatibility Score")).toBeInTheDocument();
    });

    // Overall score of 75 appears in the main score circle
    expect(screen.getAllByText("75").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockAnalysisResult.summary)).toBeInTheDocument();
  });

  it("shows error count and warning count", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(screen.getByText("1 error")).toBeInTheDocument();
      expect(screen.getByText("1 warning")).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Analysis failed" }),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(screen.getByText("Analysis failed")).toBeInTheDocument();
    });
  });

  it("shows category scores after analysis", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(screen.getByText("Keywords")).toBeInTheDocument();
      expect(screen.getByText("Structure")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("Format")).toBeInTheDocument();
    });
  });

  it("expands details when Show Details is clicked", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(screen.getByText("Show Details")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Show Details"));

    expect(screen.getByText("Top Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Keyword Analysis")).toBeInTheDocument();
    expect(screen.getByText("Issues Found")).toBeInTheDocument();
  });

  it("shows keywords with found/not found status", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Details"));
    });

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("allows re-analysis after initial analysis", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Details"));
    });

    expect(screen.getByText("Re-analyze")).toBeInTheDocument();
  });

  it("calls onAnalyze callback when analysis completes", async () => {
    const onAnalyze = vi.fn();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard onAnalyze={onAnalyze} />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(onAnalyze).toHaveBeenCalledWith(mockAnalysisResult);
    });
  });

  it("passes jobId to API when provided", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard jobId="job-123" />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ats/analyze",
        expect.objectContaining({
          body: JSON.stringify({ jobId: "job-123" }),
        })
      );
    });
  });

  it("displays issues with correct icons", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      } as Response)
    );

    render(<ATSScoreCard />);

    fireEvent.click(screen.getByText("Analyze Resume"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Show Details"));
    });

    expect(screen.getByText("Missing phone number")).toBeInTheDocument();
    expect(screen.getByText("Low keyword density")).toBeInTheDocument();
  });
});
