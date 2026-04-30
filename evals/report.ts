import type { TestCaseResult, ComparisonReport, RunSummary } from "./types.js";
import { GPT55_MODEL, CLAUDE_SONNET_MODEL } from "./generators.js";
import { CLAUDE_OPUS_MODEL } from "./judge.js";

export function determineWinner(
  gpt55Score: number,
  claudeScore: number
): "gpt55" | "claude" | "tie" {
  if (gpt55Score > claudeScore) return "gpt55";
  if (claudeScore > gpt55Score) return "claude";
  return "tie";
}

export function buildSummary(results: TestCaseResult[]): RunSummary {
  const successful = results.filter(
    (r) => !r.gpt55.error && !r.claude.error
  );

  const gpt55Wins = results.filter((r) => r.winner === "gpt55").length;
  const claudeWins = results.filter((r) => r.winner === "claude").length;
  const ties = results.filter((r) => r.winner === "tie").length;
  const errorCount = results.filter(
    (r) => r.gpt55.error || r.claude.error
  ).length;

  const avgScoreGpt55 =
    successful.length > 0
      ? successful.reduce((sum, r) => sum + r.judgeScores.gpt55.score, 0) /
        successful.length
      : 0;

  const avgScoreClaude =
    successful.length > 0
      ? successful.reduce((sum, r) => sum + r.judgeScores.claude.score, 0) /
        successful.length
      : 0;

  return {
    gpt55Wins,
    claudeWins,
    ties,
    avgScoreGpt55: Math.round(avgScoreGpt55 * 100) / 100,
    avgScoreClaude: Math.round(avgScoreClaude * 100) / 100,
    errorCount,
  };
}

export function generateJSONReport(results: TestCaseResult[]): ComparisonReport {
  const summary = buildSummary(results);
  return {
    runAt: new Date().toISOString(),
    generatorModels: { gpt55: GPT55_MODEL, claude: CLAUDE_SONNET_MODEL },
    judgeModel: CLAUDE_OPUS_MODEL,
    totalCases: results.length,
    successfulCases: results.length - summary.errorCount,
    results,
    summary,
  };
}

function scoreBar(score: number): string {
  const filled = Math.round(score);
  return "█".repeat(filled) + "░".repeat(5 - filled) + ` ${score.toFixed(1)}/5`;
}

export function generateMarkdownReport(report: ComparisonReport): string {
  const { summary } = report;
  const overallWinner =
    summary.avgScoreGpt55 > summary.avgScoreClaude
      ? `**GPT-5.5** (${summary.avgScoreGpt55} vs ${summary.avgScoreClaude})`
      : summary.avgScoreClaude > summary.avgScoreGpt55
      ? `**Claude Sonnet** (${summary.avgScoreClaude} vs ${summary.avgScoreGpt55})`
      : `**Tie** (${summary.avgScoreGpt55} each)`;

  const lines: string[] = [
    `# LLM Judge Comparison Report`,
    ``,
    `**Run:** ${report.runAt}`,
    `**Generator A:** ${report.generatorModels.gpt55}`,
    `**Generator B:** ${report.generatorModels.claude}`,
    `**Judge:** ${report.judgeModel}`,
    `**Test Cases:** ${report.successfulCases}/${report.totalCases} successful`,
    ``,
    `## Summary`,
    ``,
    `| Model | Avg Score | Wins | Ties | Losses |`,
    `|-------|-----------|------|------|--------|`,
    `| GPT-5.5 | ${scoreBar(summary.avgScoreGpt55)} | ${summary.gpt55Wins} | ${summary.ties} | ${summary.claudeWins} |`,
    `| Claude Sonnet | ${scoreBar(summary.avgScoreClaude)} | ${summary.claudeWins} | ${summary.ties} | ${summary.gpt55Wins} |`,
    ``,
    `**Overall Winner:** ${overallWinner}`,
    ``,
    `## Results by Test Case`,
    ``,
  ];

  for (const result of report.results) {
    const gptScore = result.judgeScores.gpt55.score;
    const claudeScore = result.judgeScores.claude.score;
    const winnerLabel =
      result.winner === "gpt55"
        ? "GPT-5.5 wins"
        : result.winner === "claude"
        ? "Claude wins"
        : "Tie";

    lines.push(`### ${result.testCaseId}: ${result.testCaseLabel}`);
    lines.push(``);
    lines.push(`**Winner:** ${winnerLabel}`);
    lines.push(``);
    lines.push(`| | GPT-5.5 | Claude Sonnet |`);
    lines.push(`|--|---------|---------------|`);
    lines.push(`| Score | ${gptScore}/5 | ${claudeScore}/5 |`);

    if (result.gpt55.error || result.claude.error) {
      lines.push(`| Error | ${result.gpt55.error ?? "—"} | ${result.claude.error ?? "—"} |`);
    }

    lines.push(``);
    lines.push(`**GPT-5.5 reasoning:** ${result.judgeScores.gpt55.reasoning}`);
    lines.push(``);
    lines.push(`*Strengths:* ${result.judgeScores.gpt55.strengths.join("; ")}`);
    lines.push(`*Weaknesses:* ${result.judgeScores.gpt55.weaknesses.join("; ")}`);
    lines.push(``);
    lines.push(`**Claude Sonnet reasoning:** ${result.judgeScores.claude.reasoning}`);
    lines.push(``);
    lines.push(`*Strengths:* ${result.judgeScores.claude.strengths.join("; ")}`);
    lines.push(`*Weaknesses:* ${result.judgeScores.claude.weaknesses.join("; ")}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join("\n");
}
