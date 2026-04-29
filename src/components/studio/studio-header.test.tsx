import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { TEMPLATES } from "@/lib/resume/template-data";
import { StudioHeader } from "./studio-header";

function renderStudioHeader(
  props: Partial<ComponentProps<typeof StudioHeader>> = {}
) {
  const defaultProps: ComponentProps<typeof StudioHeader> = {
    documentMode: "resume",
    draftIsSaved: true,
    templateId: "classic",
    canCopyHtml: true,
    canDownloadPdf: true,
    isExporting: false,
    onDocumentModeChange: vi.fn(),
    onTemplateSelect: vi.fn(),
    onCopyHtml: vi.fn(),
    onDownloadPdf: vi.fn(),
  };

  return render(<StudioHeader {...defaultProps} {...props} />);
}

describe("StudioHeader", () => {
  it("shows the selected template as a thumbnail trigger", () => {
    renderStudioHeader({ templateId: "modern" });

    expect(screen.getByRole("button", { name: /select resume template/i }))
      .toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("template-thumbnail-modern")).toBeInTheDocument();
  });

  it("falls back to the classic template when the selected id is missing", () => {
    renderStudioHeader({ templateId: "missing-template" });

    expect(screen.getByRole("button", { name: /select resume template/i }))
      .toHaveTextContent("Classic");
    expect(screen.getByTestId("template-thumbnail-classic")).toBeInTheDocument();
  });

  it("opens a grid picker with thumbnails for every template", () => {
    renderStudioHeader();

    fireEvent.click(screen.getByRole("button", { name: /select resume template/i }));

    const picker = screen.getByRole("listbox", { name: /resume templates/i });
    expect(within(picker).getAllByRole("option")).toHaveLength(TEMPLATES.length);
    expect(within(picker).getByTestId("template-thumbnail-classic")).toBeInTheDocument();
    expect(within(picker).getByTestId("template-thumbnail-two-column")).toBeInTheDocument();
    expect(within(picker).getByRole("option", { name: /classic/i }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("selects a template from the thumbnail grid and closes the picker", () => {
    const onTemplateSelect = vi.fn();
    renderStudioHeader({ onTemplateSelect });

    fireEvent.click(screen.getByRole("button", { name: /select resume template/i }));
    fireEvent.click(screen.getByRole("option", { name: /modern/i }));

    expect(onTemplateSelect).toHaveBeenCalledWith("modern");
    expect(screen.queryByRole("listbox", { name: /resume templates/i })).not.toBeInTheDocument();
  });

  it("closes the template grid on Escape", () => {
    renderStudioHeader();

    fireEvent.click(screen.getByRole("button", { name: /select resume template/i }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("listbox", { name: /resume templates/i })).not.toBeInTheDocument();
  });
});
