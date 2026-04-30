import fs from "fs";
import path from "path";
import { TEST_CASES } from "./test-cases.js";
import { generateWithGPT55, generateWithClaude } from "./generators.js";
import { judgeOutputs } from "./judge.js";
import { generateJSONReport, generateMarkdownReport, determineWinner } from "./report.js";
import type { TestCaseResult } from "./types.js";

function getApiKeys(): { openaiKey: string; anthropicKey: string } {
  const openaiKey = process.env.OPENAI_API_KEY ?? "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!openaiKey) throw new Error("OPENAI_API_KEY environment variable is required");
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY environment variable is required");

  return { openaiKey, anthropicKey };
}

async function runTestCase(
  testCase: (typeof TEST_CASES)[0],
  openaiKey: string,
  anthropicKey: string
): Promise<TestCaseResult> {
  console.log(`  Running generators for: ${testCase.label}...`);

  const [gpt55Result, claudeResult] = await Promise.all([
    generateWithGPT55(testCase, openaiKey),
    generateWithClaude(testCase, anthropicKey),
  ]);

  if (gpt55Result.error) {
    console.warn(`  ⚠ GPT-5.5 error: ${gpt55Result.error}`);
  }
  if (claudeResult.error) {
    console.warn(`  ⚠ Claude error: ${claudeResult.error}`);
  }

  console.log(`  Running judge...`);
  const judgeScores = await judgeOutputs(
    testCase,
    gpt55Result,
    claudeResult,
    anthropicKey
  );

  const winner = determineWinner(judgeScores.gpt55.score, judgeScores.claude.score);

  console.log(
    `  ✓ GPT-5.5: ${judgeScores.gpt55.score}/5 | Claude: ${judgeScores.claude.score}/5 | Winner: ${winner}`
  );

  return {
    testCaseId: testCase.id,
    testCaseLabel: testCase.label,
    gpt55: gpt55Result,
    claude: claudeResult,
    judgeScores,
    winner,
  };
}

async function main() {
  console.log("LLM Judge Harness: GPT-5.5 vs Claude on Resume Tailoring");
  console.log("=".repeat(60));

  let openaiKey: string;
  let anthropicKey: string;
  try {
    ({ openaiKey, anthropicKey } = getApiKeys());
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const results: TestCaseResult[] = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n[${testCase.id}] ${testCase.label}`);
    try {
      const result = await runTestCase(testCase, openaiKey, anthropicKey);
      results.push(result);
    } catch (err) {
      console.error(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Generating reports...");

  const report = generateJSONReport(results);
  const markdown = generateMarkdownReport(report);

  const reportsDir = path.join(path.dirname(new URL(import.meta.url).pathname), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(reportsDir, `comparison-${timestamp}.json`);
  const mdPath = path.join(reportsDir, `comparison-${timestamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, markdown);

  console.log(`\nReports saved:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Markdown: ${mdPath}`);

  const { summary } = report;
  console.log(`\nResults: ${summary.gpt55Wins} GPT-5.5 wins | ${summary.claudeWins} Claude wins | ${summary.ties} ties`);
  console.log(`Avg scores: GPT-5.5 ${summary.avgScoreGpt55}/5 | Claude ${summary.avgScoreClaude}/5`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
