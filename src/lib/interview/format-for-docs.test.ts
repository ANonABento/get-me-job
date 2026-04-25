import { describe, it, expect } from "vitest";
import { formatInterviewForDocs } from "./format-for-docs";
import type { InterviewSession } from "@/types/interview";
import type { JobDescription } from "@/types";

function makeSession(overrides: Partial<InterviewSession> = {}): InterviewSession {
  return {
    jobId: "job-1",
    mode: "text",
    currentIndex: 0,
    questions: [
      { question: "Tell me about yourself.", category: "behavioral" },
    ],
    answers: [""],
    feedback: [""],
    followUps: [],
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "job-1",
    title: "Senior Engineer",
    company: "Acme Corp",
    description: "",
    requirements: [],
    responsibilities: [],
    keywords: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("formatInterviewForDocs", () => {
  it("renders '(No answer provided)' when answer is empty", () => {
    const session = makeSession({ answers: [""], feedback: [""] });
    const output = formatInterviewForDocs(session);

    expect(output).toContain("(No answer provided)");
  });

  it("renders '(No answer provided)' when answer is only whitespace", () => {
    const session = makeSession({ answers: ["   "], feedback: [""] });
    const output = formatInterviewForDocs(session);

    expect(output).toContain("(No answer provided)");
  });

  it("includes an AI Feedback block when feedback is present", () => {
    const session = makeSession({
      answers: ["My real answer."],
      feedback: ["Great use of STAR."],
    });
    const output = formatInterviewForDocs(session);

    expect(output).toContain("AI Feedback:");
    expect(output).toContain("Great use of STAR.");
  });

  it("omits AI Feedback block when feedback is empty", () => {
    const session = makeSession({
      answers: ["An answer."],
      feedback: [""],
    });
    const output = formatInterviewForDocs(session);

    expect(output).not.toContain("AI Feedback:");
  });

  it("omits Position/Company lines when no job is provided", () => {
    const session = makeSession();
    const output = formatInterviewForDocs(session);

    expect(output).not.toContain("Position:");
    expect(output).not.toContain("Company:");
  });

  it("includes Position and Company when a job is provided", () => {
    const session = makeSession();
    const job = makeJob({ title: "Backend Engineer", company: "Globex" });
    const output = formatInterviewForDocs(session, job);

    expect(output).toContain("Position: Backend Engineer");
    expect(output).toContain("Company: Globex");
  });

  it("includes category labels for each question", () => {
    const session = makeSession({
      questions: [
        { question: "Describe a conflict.", category: "behavioral" },
        { question: "What is a closure?", category: "technical" },
        { question: "How would you handle X?", category: "situational" },
        { question: "Why this role?", category: "general" },
      ],
      answers: ["a1", "a2", "a3", "a4"],
      feedback: ["", "", "", ""],
    });
    const output = formatInterviewForDocs(session);

    expect(output).toContain("Question 1 (behavioral)");
    expect(output).toContain("Question 2 (technical)");
    expect(output).toContain("Question 3 (situational)");
    expect(output).toContain("Question 4 (general)");
  });

  it("labels mode as Voice when session.mode is voice", () => {
    const voiceSession = makeSession({ mode: "voice" });
    const textSession = makeSession({ mode: "text" });

    expect(formatInterviewForDocs(voiceSession)).toContain("Mode: Voice");
    expect(formatInterviewForDocs(textSession)).toContain("Mode: Text");
  });
});
