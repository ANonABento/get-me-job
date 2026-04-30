import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { COVER_LETTER_TEMPLATES } from "@/lib/builder/cover-letter-document";
import { TEMPLATES } from "@/lib/resume/template-data";
import { StudioHeader } from "./studio-header";

function createStudioHeaderProps(
  props: Partial<ComponentProps<typeof StudioHeader>> = {},
): ComponentProps<typeof StudioHeader> {
  return {
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
    ...props,
  };
}

function renderStudioHeader(
  props: Partial<ComponentProps<typeof StudioHeader>> = {},
) {
  return render(<StudioHeader {...createStudioHeaderProps(props)} />);
}

describe("StudioHeader", () => {
  it("shows the selected template as a thumbnail trigger", () => {
    renderStudioHeader({ templateId: "modern" });

    expect(
      screen.getByRole("button", { name: /select resume template/i }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("template-thumbnail-modern")).toBeInTheDocument();
  });

  it("falls back to the classic template when the selected id is missing", () => {
    renderStudioHeader({ templateId: "missing-template" });

    expect(
      screen.getByRole("button", { name: /select resume template/i }),
    ).toHaveTextContent("Classic");
    expect(
      screen.getByTestId("template-thumbnail-classic"),
    ).toBeInTheDocument();
  });

  it("uses theme variables on the document mode tabs", () => {
    const { rerender } = renderStudioHeader();

    const resumeTab = screen.getByRole("button", { name: "Resume" });
    expect(resumeTab.className).toContain("rounded-[var(--radius)]");
    expect(resumeTab.className).toContain("shadow-[var(--shadow-button)]");

    rerender(
      <StudioHeader
        {...createStudioHeaderProps({ documentMode: "cover_letter" })}
      />,
    );

    const coverLetterTab = screen.getByRole("button", { name: "Cover Letter" });
    expect(coverLetterTab.className).toContain("rounded-[var(--radius)]");
    expect(coverLetterTab.className).toContain("shadow-[var(--shadow-button)]");
  });

  it("uses theme variables on the save status badge", () => {
    const { rerender } = renderStudioHeader();

    expect(screen.getByText("Saved").className).toContain(
      "rounded-[var(--radius)]",
    );
    expect(screen.getByText("Saved").className).toContain(
      "border-[length:var(--border-width)]",
    );

    rerender(
      <StudioHeader {...createStudioHeaderProps({ draftIsSaved: false })} />,
    );

    expect(screen.getByText("Unsaved").className).toContain(
      "rounded-[var(--radius)]",
    );
    expect(screen.getByText("Unsaved").className).toContain(
      "border-[length:var(--border-width)]",
    );
  });

  it("opens a grid picker with thumbnails for every template", () => {
    renderStudioHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /select resume template/i }),
    );

    const picker = screen.getByRole("listbox", { name: /resume templates/i });
    expect(picker.className).toContain("rounded-[var(--radius)]");
    expect(picker.className).toContain("border-[length:var(--border-width)]");
    expect(picker.className).toContain("shadow-[var(--shadow-elevated)]");
    expect(within(picker).getAllByRole("option")).toHaveLength(
      TEMPLATES.length,
    );
    expect(
      within(picker).getByTestId("template-thumbnail-classic"),
    ).toBeInTheDocument();
    expect(
      within(picker).getByTestId("template-thumbnail-two-column"),
    ).toBeInTheDocument();
    expect(
      within(picker).getByRole("option", { name: /classic/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("uses cover letter templates in cover letter mode", () => {
    renderStudioHeader({
      documentMode: "cover_letter",
      templateId: "formal",
    });

    expect(
      screen.getByRole("button", { name: /select cover letter template/i }),
    ).toHaveTextContent("Formal");

    fireEvent.click(
      screen.getByRole("button", { name: /select cover letter template/i }),
    );

    const picker = screen.getByRole("listbox", {
      name: /cover letter templates/i,
    });
    expect(within(picker).getAllByRole("option")).toHaveLength(
      COVER_LETTER_TEMPLATES.length,
    );
    expect(
      within(picker).getByTestId("template-thumbnail-formal"),
    ).toBeInTheDocument();
    expect(
      within(picker).queryByTestId("template-thumbnail-classic"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy cover letter html/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download cover letter pdf/i }),
    ).toBeInTheDocument();
  });

  it("selects a template from the thumbnail grid and closes the picker", () => {
    const onTemplateSelect = vi.fn();
    renderStudioHeader({ onTemplateSelect });

    fireEvent.click(
      screen.getByRole("button", { name: /select resume template/i }),
    );
    fireEvent.click(screen.getByRole("option", { name: /modern/i }));

    expect(onTemplateSelect).toHaveBeenCalledWith("modern");
    expect(
      screen.queryByRole("listbox", { name: /resume templates/i }),
    ).not.toBeInTheDocument();
  });

  it("uses cover letter templates and labels in cover letter mode", () => {
    renderStudioHeader({ documentMode: "cover_letter", templateId: "modern" });

    expect(
      screen.getByRole("button", { name: /select cover letter template/i }),
    ).toHaveTextContent("Modern");

    fireEvent.click(
      screen.getByRole("button", { name: /select cover letter template/i }),
    );

    const picker = screen.getByRole("listbox", {
      name: /cover letter templates/i,
    });
    expect(within(picker).getAllByRole("option")).toHaveLength(
      COVER_LETTER_TEMPLATES.length,
    );
    expect(
      within(picker).getByTestId("template-thumbnail-formal"),
    ).toBeInTheDocument();
    expect(
      within(picker).queryByTestId("template-thumbnail-classic"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy cover letter html/i }),
    ).toBeInTheDocument();
  });

  it("closes the template grid on Escape", () => {
    renderStudioHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /select resume template/i }),
    );
    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("listbox", { name: /resume templates/i }),
    ).not.toBeInTheDocument();
  });
});
