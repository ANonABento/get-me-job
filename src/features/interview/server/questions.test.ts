import { describe, expect, it } from "vitest";
import { getDefaultInterviewQuestions } from "@/features/interview/server/defaults";

describe("getDefaultInterviewQuestions", () => {
  const job = {
    title: "Staff Engineer",
    company: "Acme",
    keywords: ["typescript", "react", "node"],
  };

  it("returns five mid-level questions by default", () => {
    const questions = getDefaultInterviewQuestions(job);

    expect(questions).toHaveLength(5);
    expect(questions.every((question) => question.difficulty === "mid")).toBe(true);
  });

  it("includes company context for executive prompts", () => {
    const questions = getDefaultInterviewQuestions(job, "executive");

    expect(questions[0]?.question).toContain("Acme");
    expect(questions.every((question) => question.difficulty === "executive")).toBe(true);
  });
});
