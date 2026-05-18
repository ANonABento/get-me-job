import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ClosedSubstateDialog, KanbanBoard } from "./kanban-board";
import type { Opportunity } from "../utils";
import messages from "@/messages/en.json";

const baseOpportunity: Opportunity = {
  id: "opp-1",
  type: "job",
  title: "Member of Technical Staff",
  company: "Anthropic",
  source: "greenhouse",
  city: "San Francisco",
  country: "United States",
  remoteType: "hybrid",
  summary: "Build useful AI systems.",
  requiredSkills: ["TypeScript"],
  techStack: ["TypeScript"],
  deadline: "2026-05-30",
  status: "saved",
  scrapedAt: "2026-05-01T00:00:00.000Z",
  tags: ["ai"],
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

function makeDataTransfer(id: string) {
  return {
    effectAllowed: "",
    dropEffect: "",
    getData: vi.fn(() => id),
    setData: vi.fn(),
  };
}

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("KanbanBoard", () => {
  it("renders widened cards with two-line title clamp and title attribute", () => {
    renderWithIntl(
      <KanbanBoard
        opportunities={[baseOpportunity]}
        visibleLanes={["saved"]}
        onStatusChange={vi.fn()}
        onVisibleLanesChange={vi.fn()}
      />,
    );

    const title = screen.getByRole("heading", {
      name: "Member of Technical Staff",
    });
    expect(title).toHaveClass("line-clamp-2");
    expect(title).toHaveAttribute("title", "Member of Technical Staff");
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
  });

  it("aggregates closed cards with substate badges", () => {
    renderWithIntl(
      <KanbanBoard
        opportunities={[
          { ...baseOpportunity, id: "opp-1", status: "rejected" },
          {
            ...baseOpportunity,
            id: "opp-2",
            title: "Expired Role",
            status: "expired",
          },
          {
            ...baseOpportunity,
            id: "opp-3",
            title: "Dismissed Role",
            status: "dismissed",
          },
        ]}
        visibleLanes={["closed"]}
        onStatusChange={vi.fn()}
        onVisibleLanesChange={vi.fn()}
      />,
    );

    const closedLane = screen.getByRole("region", {
      name: "Closed opportunities",
    });
    expect(within(closedLane).getByText("Rejected")).toBeInTheDocument();
    expect(within(closedLane).getByText("Expired")).toBeInTheDocument();
    expect(within(closedLane).getByText("Dismissed")).toBeInTheDocument();
  });

  it("prompts for a closed substate when dropping into Closed", () => {
    const onStatusChange = vi.fn();
    renderWithIntl(
      <KanbanBoard
        opportunities={[baseOpportunity]}
        visibleLanes={["saved", "closed"]}
        onStatusChange={onStatusChange}
        onVisibleLanesChange={vi.fn()}
      />,
    );

    const card = screen
      .getByText("Member of Technical Staff")
      .closest("article");
    const closedLane = screen.getByRole("region", {
      name: "Closed opportunities",
    });
    const dataTransfer = makeDataTransfer("opp-1");

    fireEvent.dragStart(card!, { dataTransfer });
    fireEvent.drop(closedLane, { dataTransfer });
    fireEvent.click(screen.getByRole("button", { name: "Expired" }));

    expect(onStatusChange).toHaveBeenCalledWith("opp-1", "expired");
  });

  it("defaults the closed prompt to dismissed when closed without a choice", () => {
    const onResolve = vi.fn();
    renderWithIntl(
      <ClosedSubstateDialog
        move={{ opportunityId: "opp-1", title: "Member of Technical Staff" }}
        onResolve={onResolve}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onResolve).toHaveBeenCalledWith("dismissed");
  });

  it("shows hidden lane controls on the board", () => {
    const onVisibleLanesChange = vi.fn();
    renderWithIntl(
      <KanbanBoard
        opportunities={[
          baseOpportunity,
          {
            ...baseOpportunity,
            id: "opp-2",
            title: "Pending Role",
            status: "pending",
          },
        ]}
        visibleLanes={["saved"]}
        onStatusChange={vi.fn()}
        onVisibleLanesChange={onVisibleLanesChange}
      />,
    );

    expect(
      screen.queryByRole("region", { name: "Pending opportunities" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Pending\s+1/i }));

    expect(onVisibleLanesChange).toHaveBeenCalledWith(["pending", "saved"]);
  });

  it("renders only configured visible lanes", () => {
    renderWithIntl(
      <KanbanBoard
        opportunities={[baseOpportunity]}
        visibleLanes={["saved"]}
        onStatusChange={vi.fn()}
        onVisibleLanesChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Saved opportunities" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Pending opportunities" }),
    ).not.toBeInTheDocument();
  });

  it("renders only the visible window for a large lane", () => {
    const opportunities = Array.from({ length: 200 }, (_, index) => ({
      ...baseOpportunity,
      id: `opp-${index}`,
      title: `Saved Role ${index}`,
      status: "saved" as const,
    }));

    renderWithIntl(
      <KanbanBoard
        opportunities={opportunities}
        visibleLanes={["saved"]}
        onStatusChange={vi.fn()}
        onVisibleLanesChange={vi.fn()}
      />,
    );

    const savedLane = screen.getByRole("region", {
      name: "Saved opportunities",
    });

    expect(within(savedLane).getAllByRole("article").length).toBeLessThan(60);
    expect(within(savedLane).getByText("Saved Role 0")).toBeInTheDocument();
    expect(
      within(savedLane).queryByText("Saved Role 199"),
    ).not.toBeInTheDocument();
  });
});
