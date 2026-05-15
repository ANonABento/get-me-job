import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoachRail } from "./coach-rail";
import type { InterviewSession } from "@/types/interview";
import type { Opportunity } from "@/types/opportunity";

function makeSession(
  overrides: Partial<InterviewSession> = {},
): InterviewSession {
  return {
    jobId: "job-1",
    questions: [
      { question: "Q1", category: "behavioral" },
      { question: "Q2", category: "behavioral" },
    ],
    currentIndex: 1,
    answers: ["answer one", ""],
    feedback: ["", ""],
    followUps: [[], []],
    mode: "text",
    ...overrides,
  };
}

const job = {
  id: "job-1",
  company: "Notion",
  title: "Sr Product Designer",
} as unknown as Opportunity;

describe("CoachRail", () => {
  it("shows a warm-up tip when no session is active", () => {
    render(
      <CoachRail session={null} selectedJob={undefined} pastSessions={[]} />,
    );
    expect(screen.getByText(/Today's focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Warm up first/i)).toBeInTheDocument();
  });

  it("renders the selected job meta panel when a job is provided", () => {
    render(
      <CoachRail session={makeSession()} selectedJob={job} pastSessions={[]} />,
    );
    expect(screen.getByText(/Live interview/i)).toBeInTheDocument();
    expect(screen.getByText("Notion")).toBeInTheDocument();
    expect(screen.getByText(/Sr Product Designer/)).toBeInTheDocument();
  });

  it("renders coach tips for every session state", () => {
    render(
      <CoachRail session={null} selectedJob={undefined} pastSessions={[]} />,
    );
    expect(screen.getByText(/Coach tips/i)).toBeInTheDocument();
    expect(screen.getByText(/STAR, fast\./)).toBeInTheDocument();
  });
});
