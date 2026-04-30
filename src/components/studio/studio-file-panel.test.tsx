import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioFilePanel } from "./studio-file-panel";
import type { StudioDocument } from "./studio-documents";

const documents: StudioDocument[] = [
  { id: "resume", name: "Resume", mode: "resume" },
  { id: "cover-letter", name: "Cover Letter", mode: "cover_letter" },
];

describe("StudioFilePanel", () => {
  it("uses theme variable classes for file row chrome", () => {
    render(
      <StudioFilePanel
        documents={documents}
        activeDocumentId="resume"
        onCreate={vi.fn()}
        onSelect={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const fileRow = screen.getByRole("button", {
      name: "Resume",
    }).parentElement;
    expect(fileRow?.className).toContain("rounded-[var(--radius)]");
  });
});
