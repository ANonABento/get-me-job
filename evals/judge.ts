import type { TestCase, GeneratorResult, JudgeScore } from "./types.js";

export const CLAUDE_OPUS_MODEL = "claude-opus-4-7";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = "2023-06-01";

const JUDGE_SYSTEM_PROMPT = `You are an expert hiring manager and career coach evaluating tailored resumes.
Your role is to objectively score two resume outputs for the same candidate and job.
Score each resume on a 1-5 scale based on these criteria:
- Keyword alignment: Does it incorporate relevant terms from the job description?
- Relevance emphasis: Does it highlight the most relevant experience for this role?
- Specificity: Are metrics and concrete achievements used effectively?
- Clarity: Is the writing professional, clear, and impactful?
- ATS optimization: Is the structure and language optimized for applicant tracking systems?

Be objective. Do not favor one resume over another without clear justification.
Respond ONLY with valid JSON — no markdown, no preamble.`;

export function buildJudgePrompt(
  testCase: TestCase,
  gpt55Result: GeneratorResult,
  claudeResult: GeneratorResult
): string {
  return `Evaluate these two tailored resumes for the same candidate and job.

JOB DESCRIPTION:
${testCase.jobDescription}

ORIGINAL CANDIDATE PROFILE:
${testCase.candidateProfile}

RESUME A:
${gpt55Result.output || "[No output — generator failed]"}

RESUME B:
${claudeResult.output || "[No output — generator failed]"}

Score each resume 1-5 and provide your assessment. Return this exact JSON structure:
{
  "resume_a": {
    "score": <number 1-5>,
    "reasoning": "<2-3 sentence explanation>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>"]
  },
  "resume_b": {
    "score": <number 1-5>,
    "reasoning": "<2-3 sentence explanation>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>"]
  }
}`;
}

interface RawJudgeScore {
  score: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

interface RawJudgeResponse {
  resume_a: RawJudgeScore;
  resume_b: RawJudgeScore;
}

export function parseJudgeResponse(
  response: string,
  gpt55Model: string,
  claudeModel: string
): { gpt55: JudgeScore; claude: JudgeScore } {
  let cleaned = response.trim();

  const jsonStart = cleaned.indexOf("{");
  if (jsonStart > 0) cleaned = cleaned.slice(jsonStart);

  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonEnd >= 0 && jsonEnd < cleaned.length - 1) {
    cleaned = cleaned.slice(0, jsonEnd + 1);
  }

  const parsed = JSON.parse(cleaned) as RawJudgeResponse;

  return {
    gpt55: {
      model: gpt55Model,
      score: Number(parsed.resume_a.score),
      reasoning: parsed.resume_a.reasoning ?? "",
      strengths: parsed.resume_a.strengths ?? [],
      weaknesses: parsed.resume_a.weaknesses ?? [],
    },
    claude: {
      model: claudeModel,
      score: Number(parsed.resume_b.score),
      reasoning: parsed.resume_b.reasoning ?? "",
      strengths: parsed.resume_b.strengths ?? [],
      weaknesses: parsed.resume_b.weaknesses ?? [],
    },
  };
}

export async function judgeOutputs(
  testCase: TestCase,
  gpt55Result: GeneratorResult,
  claudeResult: GeneratorResult,
  apiKey: string
): Promise<{ gpt55: JudgeScore; claude: JudgeScore }> {
  const prompt = buildJudgePrompt(testCase, gpt55Result, claudeResult);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_API_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_OPUS_MODEL,
      max_tokens: 800,
      system: JUDGE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  const raw = data.content[0]?.text ?? "";

  return parseJudgeResponse(raw, gpt55Result.model, claudeResult.model);
}
