import { describe, expect, it } from "vitest";
import { PROMPT_QA_FIXTURES } from "../../../evals/prompt-qa/fixtures";
import {
  buildContextPackInterviewQuestionsPrompt,
  buildGenericInterviewQuestionsPrompt,
  buildInterviewAnswerFeedbackPrompt,
  buildJobInterviewQuestionsPrompt,
} from "./prompt-builders";

describe("interview prompt builders", () => {
  it("builds job-specific question prompts with profile and category guardrails", () => {
    const fixture = PROMPT_QA_FIXTURES[0];
    const prompt = buildJobInterviewQuestionsPrompt({
      job: fixture.job,
      profile: fixture.profile,
      difficulty: "entry",
      questionCount: 5,
    });

    expect(prompt).toContain("Frontend Engineer Intern at BrightApps");
    expect(prompt).toContain("Ava Chen");
    expect(prompt).toContain("Return ONLY a JSON array");
    expect(prompt).toContain("cultural-fit");
  });

  it("builds generic prompts without referencing a company", () => {
    const prompt = buildGenericInterviewQuestionsPrompt({
      category: "technical",
      difficulty: "entry",
      questionCount: 5,
    });

    expect(prompt).toContain("Do not reference any specific role or company");
    expect(prompt).toContain('"category": "technical"');
  });

  it("builds answer feedback prompts with concise coaching instructions", () => {
    const fixture = PROMPT_QA_FIXTURES[2];
    const prompt = buildInterviewAnswerFeedbackPrompt({
      job: fixture.job,
      answer: "I built the Task Board project.",
      category: "behavioral",
    });

    expect(prompt).toContain("Software Engineering Intern at Northstar");
    expect(prompt).toContain("2-3 sentences");
    expect(prompt).toContain("One specific improvement suggestion");
  });

  it("builds context-pack prompts with source grounding and probe metadata", () => {
    const prompt = buildContextPackInterviewQuestionsPrompt({
      contextPack: {
        id: "pack-1",
        title: "project defense: Portfolio",
        mode: "project-defense",
        status: "ready",
        sources: [
          {
            type: "custom-url",
            url: "https://github.com/example/portfolio",
            label: "Portfolio repo",
          },
        ],
        summary: {
          detectedStack: ["next.js", "typescript"],
          skills: ["Next.js", "TypeScript"],
          claims: ["Built a portfolio with an interview prep dashboard"],
          weakSpots: ["No measurable outcome found"],
          questionAngles: ["architecture choices", "hardest bug"],
          warnings: [],
          sourceLabels: ["Portfolio repo"],
        },
        rawContextExcerpt:
          "Built a Next.js portfolio with TypeScript, Tailwind, and SQLite.",
        deepDiveEnabled: true,
        promotionState: "none",
        createdAt: "2026-05-20T00:00:00.000Z",
      },
      difficulty: "senior",
      questionCount: 5,
    });

    expect(prompt).toContain("candidate-specific context pack");
    expect(prompt).toContain("project-defense");
    expect(prompt).toContain("No measurable outcome found");
    expect(prompt).toContain('"probeType"');
    expect(prompt).toContain('"sourceRefs"');
  });
});
