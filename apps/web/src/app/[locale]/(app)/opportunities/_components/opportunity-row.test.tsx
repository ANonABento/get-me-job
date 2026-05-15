import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mapStatusToStage, OpportunityRow } from "./opportunity-row";
import type { Opportunity } from "../utils";

const BASE_OPPORTUNITY: Opportunity = {
  id: "opp-test",
  type: "job",
  title: "Staff Frontend Engineer",
  company: "Linear",
  source: "linkedin",
  city: "Remote",
  remoteType: "remote",
  summary: "Build the editorial product surface.",
  techStack: ["TypeScript", "React"],
  salaryMin: 180000,
  salaryMax: 220000,
  salaryCurrency: "USD",
  status: "applied",
  scrapedAt: "2026-05-01T10:00:00.000Z",
  tags: ["growth"],
  createdAt: "2026-05-01T10:00:00.000Z",
  updatedAt: "2026-05-01T10:00:00.000Z",
};

describe("mapStatusToStage", () => {
  it("maps legacy statuses onto editorial stages", () => {
    expect(mapStatusToStage("saved")).toBe("saved");
    expect(mapStatusToStage("pending")).toBe("saved");
    expect(mapStatusToStage("applied")).toBe("applied");
    expect(mapStatusToStage("interviewing")).toBe("interview");
    expect(mapStatusToStage("offer")).toBe("offer");
    expect(mapStatusToStage("rejected")).toBe("rejected");
    expect(mapStatusToStage("expired")).toBe("rejected");
    expect(mapStatusToStage("dismissed")).toBe("rejected");
  });
});

describe("OpportunityRow", () => {
  it("renders the company, role, and meta details", () => {
    render(<OpportunityRow opportunity={BASE_OPPORTUNITY} onOpen={vi.fn()} />);

    expect(screen.getByText("Linear")).toBeInTheDocument();
    expect(screen.getByText("Staff Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Remote/)).toBeInTheDocument();
    expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
  });

  it("invokes onOpen when the row is clicked", () => {
    const onOpen = vi.fn();
    render(<OpportunityRow opportunity={BASE_OPPORTUNITY} onOpen={onOpen} />);

    fireEvent.click(screen.getByTestId("opportunity-row"));
    expect(onOpen).toHaveBeenCalledWith(BASE_OPPORTUNITY);
  });

  it("invokes onOpen via keyboard (Enter)", () => {
    const onOpen = vi.fn();
    render(<OpportunityRow opportunity={BASE_OPPORTUNITY} onOpen={onOpen} />);

    fireEvent.keyDown(screen.getByTestId("opportunity-row"), { key: "Enter" });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders an archive button only when onArchive is provided", () => {
    const onArchive = vi.fn();
    const { rerender } = render(
      <OpportunityRow opportunity={BASE_OPPORTUNITY} onOpen={vi.fn()} />,
    );
    expect(
      screen.queryByRole("button", { name: /Archive/i }),
    ).not.toBeInTheDocument();

    rerender(
      <OpportunityRow
        opportunity={BASE_OPPORTUNITY}
        onOpen={vi.fn()}
        onArchive={onArchive}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Archive Staff Frontend Engineer/i }),
    );
    expect(onArchive).toHaveBeenCalledWith(BASE_OPPORTUNITY);
  });

  it("does not bubble the open click when the Open button is pressed", () => {
    const onOpen = vi.fn();
    render(<OpportunityRow opportunity={BASE_OPPORTUNITY} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: /Open details for/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
