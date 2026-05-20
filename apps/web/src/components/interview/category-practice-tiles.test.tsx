import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryPracticeTiles } from "./category-practice-tiles";
import type { PastSession } from "@/types/interview";

const pastSessions: PastSession[] = [
  {
    id: "session-1",
    jobId: null,
    category: "behavioral",
    mode: "generic-text",
    status: "completed",
    startedAt: "2026-05-19T12:00:00.000Z",
    completedAt: "2026-05-19T12:12:00.000Z",
    questions: [
      { question: "Tell me about a challenge.", category: "behavioral" },
    ],
    answers: [
      {
        id: "answer-1",
        questionIndex: 0,
        answer: "I used STAR.",
        feedback: "Add detail.",
      },
    ],
    followUps: [
      {
        id: "follow-up-1",
        questionIndex: 0,
        followUpQuestion: "What changed after that?",
        answer: "The team shipped faster.",
        feedback: "Good outcome.",
      },
    ],
  },
];

describe("CategoryPracticeTiles", () => {
  it("renders category practice cards with saved-session context", () => {
    render(
      <CategoryPracticeTiles
        pastSessions={pastSessions}
        onStartQuickPractice={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Pick the muscle you want to train"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Behavioral/i }),
    ).toHaveTextContent(/1 session saved/i);
    expect(
      screen.getByRole("button", { name: /Technical/i }),
    ).toHaveTextContent(/No sessions yet/i);
  });

  it("starts quick practice for the selected category", () => {
    const onStartQuickPractice = vi.fn();
    render(
      <CategoryPracticeTiles
        pastSessions={pastSessions}
        onStartQuickPractice={onStartQuickPractice}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Technical/i }));

    expect(onStartQuickPractice).toHaveBeenCalledWith("technical");
  });
});
