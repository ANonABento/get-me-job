import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COVER_LETTER_TEMPLATES, TEMPLATES } from "@/lib/resume/template-data";
import type {
  CoverLetterTemplate,
  ResumeTemplate,
} from "@/lib/resume/template-data";
import {
  getTemplateThumbnailTraits,
  TemplatePreviewThumbnail,
} from "./template-preview-thumbnail";

function findTemplate(templateId: string): ResumeTemplate {
  const template = TEMPLATES.find(({ id }) => id === templateId);

  if (!template) {
    throw new Error(`Missing test template: ${templateId}`);
  }

  return template;
}

function findCoverLetterTemplate(templateId: string): CoverLetterTemplate {
  const template = COVER_LETTER_TEMPLATES.find(({ id }) => id === templateId);

  if (!template) {
    throw new Error(`Missing test template: ${templateId}`);
  }

  return template;
}

describe("getTemplateThumbnailTraits", () => {
  it("maps centered line-divider templates to thumbnail traits", () => {
    const traits = getTemplateThumbnailTraits(findTemplate("classic").styles);

    expect(traits).toMatchObject({
      accentColor: "#333333",
      headerAlignmentClass: "items-center text-center",
      sectionRuleClass: "border-b",
      bulletLabel: "\u2022",
      isTwoColumn: false,
    });
  });

  it("maps two-column dash templates to thumbnail traits", () => {
    const modern = findTemplate("modern");
    const executive = findTemplate("executive");
    const twoColumn = findTemplate("two-column");

    expect(getTemplateThumbnailTraits(modern.styles).bulletLabel).toBe("-");
    expect(getTemplateThumbnailTraits(executive.styles).bulletLabel).toBe("\u2192");
    expect(getTemplateThumbnailTraits(twoColumn.styles).isTwoColumn).toBe(true);
  });

  it("maps cover letter templates to letter thumbnail traits", () => {
    const traits = getTemplateThumbnailTraits(
      findCoverLetterTemplate("formal").styles
    );

    expect(traits).toMatchObject({
      accentColor: "#1f2937",
      bulletLabel: "",
      isLetter: true,
      isTwoColumn: false,
    });
  });
});

describe("TemplatePreviewThumbnail", () => {
  it("renders an accessible-hidden miniature resume for a template", () => {
    render(<TemplatePreviewThumbnail template={findTemplate("modern")} />);

    const thumbnail = screen.getByTestId("template-thumbnail-modern");
    expect(thumbnail).toHaveAttribute("aria-hidden", "true");
    expect(thumbnail).toHaveStyle({ fontFamily: "'Inter', 'Segoe UI', sans-serif" });
    expect(within(thumbnail).getByText("Alex Morgan")).toBeInTheDocument();
    expect(within(thumbnail).getByText("Experience")).toBeInTheDocument();
  });

  it("renders a miniature cover letter for a cover letter template", () => {
    render(
      <TemplatePreviewThumbnail template={findCoverLetterTemplate("formal")} />
    );

    const thumbnail = screen.getByTestId("template-thumbnail-formal");
    expect(thumbnail).toHaveAttribute("aria-hidden", "true");
    expect(within(thumbnail).getByText("Alex Morgan")).toBeInTheDocument();
    expect(within(thumbnail).getByText("Dear Hiring Team,")).toBeInTheDocument();
    expect(within(thumbnail).queryByText("Experience")).not.toBeInTheDocument();
  });
});
