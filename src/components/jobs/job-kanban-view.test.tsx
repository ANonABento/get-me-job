import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";
import { JobKanbanView } from "./job-kanban-view";

const baseJob: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  description: "Build product experiences",
  requirements: [],
  responsibilities: [],
  keywords: [
    "React",
    "TypeScript",
    "Design Systems",
    "Accessibility",
    "Testing",
  ],
  status: "saved",
  salary: "$120k - $150k",
  location: "Remote",
  deadline: "2026-05-10",
  createdAt: "2026-04-29T00:00:00.000Z",
};

function createDataTransfer(): DataTransfer {
  const data = new Map<string, string>();

  return {
    effectAllowed: "all",
    dropEffect: "none",
    setData: vi.fn((format: string, value: string) => {
      data.set(format, value);
    }),
    getData: vi.fn((format: string) => data.get(format) ?? ""),
  } as unknown as DataTransfer;
}

describe("JobKanbanView", () => {
  it("renders expected columns and card details", () => {
    render(<JobKanbanView jobs={[baseJob]} onStatusChange={vi.fn()} />);

    const pendingColumn = screen.getByLabelText("Pending jobs");
    expect(pendingColumn).toBeInTheDocument();
    expect(pendingColumn.className).toContain("rounded-[var(--radius)]");
    expect(pendingColumn.className).toContain(
      "border-[length:var(--border-width)]",
    );
    expect(pendingColumn.className).toContain(
      "[backdrop-filter:var(--backdrop-blur)]",
    );
    expect(screen.getByLabelText("Saved jobs")).toBeInTheDocument();
    expect(screen.getByLabelText("Applied jobs")).toBeInTheDocument();
    expect(screen.getByLabelText("Interviewing jobs")).toBeInTheDocument();
    expect(screen.getByLabelText("Offered jobs")).toBeInTheDocument();
    expect(screen.getByLabelText("Rejected jobs")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Due May 10")).toBeInTheDocument();
    expect(screen.getByText("$120k - $150k")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();

    const card = screen.getByText("Frontend Engineer").closest("article");
    expect(card?.className).toContain("shadow-[var(--shadow-card)]");
  });

  it("calls onStatusChange when a card is dropped into another column", () => {
    const onStatusChange = vi.fn();
    render(<JobKanbanView jobs={[baseJob]} onStatusChange={onStatusChange} />);
    const card = screen.getByText("Frontend Engineer").closest("article");
    const appliedColumn = screen.getByLabelText("Applied jobs");
    const dataTransfer = createDataTransfer();

    expect(card).not.toBeNull();

    fireEvent.dragStart(card!, { dataTransfer });
    fireEvent.drop(appliedColumn, { dataTransfer });

    expect(onStatusChange).toHaveBeenCalledWith("job-1", "applied");
  });

  it("does not call onStatusChange when dropped into the current column", () => {
    const onStatusChange = vi.fn();
    render(<JobKanbanView jobs={[baseJob]} onStatusChange={onStatusChange} />);
    const card = screen.getByText("Frontend Engineer").closest("article");
    const savedColumn = screen.getByLabelText("Saved jobs");
    const dataTransfer = createDataTransfer();

    expect(card).not.toBeNull();

    fireEvent.dragStart(card!, { dataTransfer });
    fireEvent.drop(savedColumn, { dataTransfer });

    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
