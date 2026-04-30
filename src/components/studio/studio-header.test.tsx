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

    const trigger = screen.getByRole("button", {
      name: /select resume template/i,
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveClass("min-w-[15rem]");
    expect(
      within(trigger).getByTestId("template-thumbnail-modern"),
    ).toHaveClass("h-20", "w-14");
    expect(trigger).toHaveTextContent("Contemporary design");
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

  it("uses the design-system radius on each active document mode tab", () => {
    const { rerender } = renderStudioHeader();

    expect(screen.getByRole("button", { name: "Resume" })).toHaveClass(
      "rounded-md",
    );

    rerender(
      <StudioHeader
        {...createStudioHeaderProps({ documentMode: "cover_letter" })}
      />,
    );

    expect(screen.getByRole("button", { name: "Cover Letter" })).toHaveClass(
      "rounded-md",
    );
  });

  it("shows the resume score badge with a breakdown tooltip", () => {
    renderStudioHeader({
      resumeScore: {
        overall: 82,
        breakdown: {
          completeness: 90,
          keywordDensity: 75,
          length: 100,
          actionVerbs: 80,
          quantifiedAchievements: 60,
        },
        stats: {
          actionVerbCount: 6,
          matchedKeywordCount: 9,
          quantifiedAchievementCount: 3,
          totalKeywordCount: 12,
          wordCount: 510,
        },
      },
    });

    expect(screen.getByText("Resume score 82")).toBeInTheDocument();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Score breakdown");
    expect(tooltip).toHaveTextContent("Completeness");
    expect(tooltip).toHaveTextContent("90");
    expect(tooltip).toHaveTextContent("9/12 keywords matched");
    expect(tooltip).toHaveClass("group-hover:block");
  });

  it("opens a grid picker with thumbnails for every template", () => {
    renderStudioHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /select resume template/i }),
    );

    const picker = screen.getByRole("listbox", { name: /resume templates/i });
    expect(within(picker).getAllByRole("option")).toHaveLength(
      TEMPLATES.length,
    );
    expect(
      within(picker).getByTestId("template-thumbnail-classic"),
    ).toHaveClass("h-36");
    expect(
      within(picker).getByTestId("template-thumbnail-two-column"),
    ).toBeInTheDocument();
    expect(
      within(picker).getByRole("option", { name: /classic/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("shows template descriptions and enlarges thumbnails on hover in the grid", () => {
    renderStudioHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /select resume template/i }),
    );

    const picker = screen.getByRole("listbox", { name: /resume templates/i });
    const modernOption = within(picker).getByRole("option", {
      name: /modern/i,
    });

    expect(modernOption).toHaveTextContent(
      "Contemporary design with subtle accent colors",
    );
    expect(
      within(modernOption).getByTestId("template-thumbnail-modern"),
    ).toHaveClass("group-hover:h-56", "group-focus-visible:h-56");
  });

  it("keeps the enlarged template picker inside the viewport", () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });

    renderStudioHeader();

    const trigger = screen.getByRole("button", {
      name: /select resume template/i,
    });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: 128,
      height: 96,
      left: 700,
      right: 940,
      top: 32,
      width: 240,
      x: 700,
      y: 32,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    expect(
      screen.getByRole("listbox", { name: /resume templates/i }),
    ).toHaveStyle({
      left: "48px",
      top: "136px",
      width: "736px",
      maxHeight: "648px",
    });

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalInnerHeight,
    });
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
