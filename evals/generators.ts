import type { TestCase, GeneratorResult } from "./types.js";

export const GPT55_MODEL = "gpt-5.5";
export const CLAUDE_SONNET_MODEL = "claude-sonnet-4-6";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = "2023-06-01";

const SYSTEM_PROMPT = `You are an expert resume writer and career coach.
Your task is to tailor a candidate's resume/profile to match a specific job description.
Rewrite the candidate's experience and skills to highlight the most relevant aspects for this role.
Be concise, use action verbs, and include specific metrics where possible.
Output only the tailored resume content — no preamble or explanation.`;

export function buildTailoringPrompt(testCase: TestCase): string {
  return `Tailor this candidate's profile for the following job.

JOB DESCRIPTION:
${testCase.jobDescription}

CANDIDATE PROFILE:
${testCase.candidateProfile}

Write a tailored resume summary and experience section (3-5 bullet points) that best positions this candidate for the role. Be specific and concise.`;
}

export async function generateWithGPT55(
  testCase: TestCase,
  apiKey: string
): Promise<GeneratorResult> {
  const start = Date.now();
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GPT55_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildTailoringPrompt(testCase) },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const output = data.choices[0]?.message?.content ?? "";

    return {
      model: GPT55_MODEL,
      provider: "openai",
      output,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      model: GPT55_MODEL,
      provider: "openai",
      output: "",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function generateWithClaude(
  testCase: TestCase,
  apiKey: string
): Promise<GeneratorResult> {
  const start = Date.now();
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_SONNET_MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildTailoringPrompt(testCase) }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const output = data.content[0]?.text ?? "";

    return {
      model: CLAUDE_SONNET_MODEL,
      provider: "anthropic",
      output,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      model: CLAUDE_SONNET_MODEL,
      provider: "anthropic",
      output: "",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
