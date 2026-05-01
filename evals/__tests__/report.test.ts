import { describe, it, expect } from "vitest";
import { determineWinner, buildSummary, generateJSONReport, generateMarkdownReport } from "../report.js";
import type { TestCaseResult } from "../types.js";

function makeResult(
  id: string,
  gpt55Score: number,
  claudeScore: number,
  gpt55Error?: string,
  claudeError?: string
): TestCaseResult {
  const winner = determineWinner(gpt55Score, claudeScore);
  return {
    testCaseId: id,
    testCaseLabel: `Label ${id}`,
    gpt55: {
      model: "gpt-5.5",
      provider: "openai",
      output: gpt55Error ? "" : `GPT output for ${id}`,
      latencyMs: 1000,
      error: gpt55Error,
    },
    claude: {
      model: "claude-sonnet-4-6",
      provider: "anthropic",
      output: claudeError ? "" : `Claude output for ${id}`,
      latencyMs: 800,
      error: claudeError,
    },
    judgeScores: {
      gpt55: {
        model: "gpt-5.5",
        score: gpt55Score,
        reasoning: "GPT reasoning",
        strengths: ["strength A"],
        weaknesses: ["weakness A"],
      },
      claude: {
        model: "claude-sonnet-4-6",
        score: claudeScore,
        reasoning: "Claude reasoning",
        strengths: ["strength B"],
        weaknesses: ["weakness B"],
      },
    },
    winner,
  };
}

describe("determineWinner", () => {
  it("returns gpt55 when GPT score is higher", () => {
    expect(determineWinner(4, 3)).toBe("gpt55");
  });

  it("returns claude when Claude score is higher", () => {
    expect(determineWinner(3, 4)).toBe("claude");
  });

  it("returns tie on equal scores", () => {
    expect(determineWinner(3, 3)).toBe("tie");
    expect(determineWinner(5, 5)).toBe("tie");
  });
});

describe("buildSummary", () => {
  it("counts wins correctly", () => {
    const results = [
      makeResult("1", 4, 3),
      makeResult("2", 2, 5),
      makeResult("3", 3, 3),
    ];

    const summary = buildSummary(results);

    expect(summary.gpt55Wins).toBe(1);
    expect(summary.claudeWins).toBe(1);
    expect(summary.ties).toBe(1);
  });

  it("computes average scores correctly", () => {
    const results = [makeResult("1", 4, 2), makeResult("2", 2, 4)];
    const summary = buildSummary(results);

    expect(summary.avgScoreGpt55).toBe(3);
    expect(summary.avgScoreClaude).toBe(3);
  });

  it("counts errors in errorCount", () => {
    const results = [
      makeResult("1", 4, 3),
      makeResult("2", 0, 0, "API error"),
    ];

    const summary = buildSummary(results);
    expect(summary.errorCount).toBe(1);
  });

  it("handles empty results", () => {
    const summary = buildSummary([]);
    expect(summary.gpt55Wins).toBe(0);
    expect(summary.claudeWins).toBe(0);
    expect(summary.avgScoreGpt55).toBe(0);
    expect(summary.avgScoreClaude).toBe(0);
  });

  it("excludes errored cases from average calculation", () => {
    const results = [
      makeResult("1", 4, 2),
      makeResult("2", 0, 0, "error"),
    ];
    const summary = buildSummary(results);
    expect(summary.avgScoreGpt55).toBe(4);
    expect(summary.avgScoreClaude).toBe(2);
  });
});

describe("generateJSONReport", () => {
  it("includes required fields", () => {
    const results = [makeResult("1", 4, 3)];
    const report = generateJSONReport(results);

    expect(report.runAt).toBeTruthy();
    expect(report.generatorModels.gpt55).toBe("gpt-5.5");
    expect(report.generatorModels.claude).toBe("claude-sonnet-4-6");
    expect(report.judgeModel).toBeTruthy();
    expect(report.totalCases).toBe(1);
    expect(report.results).toHaveLength(1);
    expect(report.summary).toBeDefined();
  });

  it("sets successfulCases correctly", () => {
    const results = [
      makeResult("1", 4, 3),
      makeResult("2", 0, 0, "error"),
    ];
    const report = generateJSONReport(results);
    expect(report.totalCases).toBe(2);
    expect(report.successfulCases).toBe(1);
  });
});

describe("generateMarkdownReport", () => {
  it("includes a header", () => {
    const results = [makeResult("1", 4, 3)];
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md).toContain("# LLM Judge Comparison Report");
  });

  it("includes both model names in summary", () => {
    const results = [makeResult("1", 4, 3)];
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md).toContain("GPT-5.5");
    expect(md).toContain("Claude Sonnet");
  });

  it("includes test case IDs", () => {
    const results = [makeResult("tc-42", 4, 3)];
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md).toContain("tc-42");
  });

  it("shows winner in each test case section", () => {
    const results = [makeResult("1", 5, 2)];
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md).toContain("GPT-5.5 wins");
  });

  it("handles tie correctly", () => {
    const results = [makeResult("1", 3, 3)];
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md).toContain("Tie");
  });

  it("produces non-empty output for multiple cases", () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      makeResult(`tc-0${i + 1}`, (i % 5) + 1, ((i + 2) % 5) + 1)
    );
    const report = generateJSONReport(results);
    const md = generateMarkdownReport(report);

    expect(md.length).toBeGreaterThan(500);
    expect(md).toContain("## Results by Test Case");
  });
});
