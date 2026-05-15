import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionRail } from "./session-rail";
import type { PastSession } from "@/types/interview";
import type { Opportunity } from "@/types/opportunity";

function makeSession(overrides: Partial<PastSession> = {}): PastSession {
  return {
    id: "s-1",
    jobId: "job-1",
    mode: "text",
    status: "completed",
    startedAt: "2026-05-10T12:00:00Z",
    completedAt: "2026-05-10T12:30:00Z",
    questions: [
      { question: "Q1", category: "behavioral" },
      { question: "Q2", category: "behavioral" },
    ],
    answers: [{ id: "a-1", questionIndex: 0, answer: "answer" }],
    ...overrides,
  };
}

const noopOpps: Opportunity[] = [
  // minimal — only fields the rail reads
  {
    id: "job-1",
    company: "Notion",
    title: "Sr Product Designer",
  } as unknown as Opportunity,
];

describe("SessionRail", () => {
  it("renders past practice empty state when no sessions", () => {
    render(
      <SessionRail
        pastSessions={[]}
        opportunities={[]}
        activeSessionId={null}
        onResume={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Past practice/i)).toBeInTheDocument();
    expect(screen.getByText(/will show up here/i)).toBeInTheDocument();
  });

  it("renders a completed session row with company name", () => {
    render(
      <SessionRail
        pastSessions={[makeSession()]}
        opportunities={noopOpps}
        activeSessionId={null}
        onResume={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Notion")).toBeInTheDocument();
    expect(screen.getByText(/Sr Product Designer/)).toBeInTheDocument();
  });

  it("groups in-progress sessions under a separate heading", () => {
    render(
      <SessionRail
        pastSessions={[makeSession({ status: "in_progress", id: "s-active" })]}
        opportunities={noopOpps}
        activeSessionId={null}
        onResume={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/In progress/i)).toBeInTheDocument();
  });

  it("calls onResume when the row body is clicked", () => {
    const onResume = vi.fn();
    render(
      <SessionRail
        pastSessions={[makeSession()]}
        opportunities={noopOpps}
        activeSessionId={null}
        onResume={onResume}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Notion"));
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onResume.mock.calls[0]?.[0]?.id).toBe("s-1");
  });

  it("calls onDelete with the session id when delete is clicked", () => {
    const onDelete = vi.fn();
    render(
      <SessionRail
        pastSessions={[makeSession()]}
        opportunities={noopOpps}
        activeSessionId={null}
        onResume={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Delete session/i));
    expect(onDelete).toHaveBeenCalledWith("s-1");
  });
});
