import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";
import { JobCard } from "./job-card";

const job: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  description: "Build product experiences",
  requirements: [],
  responsibilities: [],
  keywords: ["React", "TypeScript"],
  status: "saved",
  createdAt: "2026-05-01T00:00:00.000Z",
};

function renderJobCard(overrides = {}) {
  return render(
    <JobCard
      job={job}
      analyzing={false}
      generating={false}
      templates={[
        { id: "classic", name: "Classic", description: "Traditional" },
        { id: "modern", name: "Modern", description: "Modern" },
      ]}
      selectedTemplate="classic"
      expanded={false}
      atsAnalyzing={false}
      onSelectTemplate={vi.fn()}
      onAnalyze={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
      onStatusChange={vi.fn()}
      onToggleExpand={vi.fn()}
      onAtsCheck={vi.fn()}
      onAtsDialogOpen={vi.fn()}
      onCoverLetter={vi.fn()}
      {...overrides}
    />,
  );
}

describe("JobCard", () => {
  it("renders one primary Tailor Resume button and hides secondary actions behind More", () => {
    renderJobCard();

    expect(
      screen.getByRole("button", { name: /Tailor Resume/i }),
    ).toBeInTheDocument();
    const moreButton = screen.getByRole("button", { name: /^More$/i });
    expect(moreButton).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
    expect(
      screen.queryByRole("button", { name: /Analyze Match/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Company Research")).not.toBeInTheDocument();

    fireEvent.click(moreButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Analyze Match/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /ATS Check/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Cover Letter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Company Research/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Resume template")).toBeInTheDocument();
  });

  it("closes the More menu with Escape", () => {
    renderJobCard();

    fireEvent.click(screen.getByRole("button", { name: /^More$/i }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
