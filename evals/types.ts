export interface TestCase {
  id: string;
  label: string;
  candidateProfile: string;
  jobDescription: string;
}

export interface GeneratorResult {
  model: string;
  provider: "openai" | "anthropic";
  output: string;
  latencyMs: number;
  error?: string;
}

export interface JudgeScore {
  model: string;
  score: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

export interface TestCaseResult {
  testCaseId: string;
  testCaseLabel: string;
  gpt55: GeneratorResult;
  claude: GeneratorResult;
  judgeScores: {
    gpt55: JudgeScore;
    claude: JudgeScore;
  };
  winner: "gpt55" | "claude" | "tie";
}

export interface RunSummary {
  gpt55Wins: number;
  claudeWins: number;
  ties: number;
  avgScoreGpt55: number;
  avgScoreClaude: number;
  errorCount: number;
}

export interface ComparisonReport {
  runAt: string;
  generatorModels: { gpt55: string; claude: string };
  judgeModel: string;
  totalCases: number;
  successfulCases: number;
  results: TestCaseResult[];
  summary: RunSummary;
}
