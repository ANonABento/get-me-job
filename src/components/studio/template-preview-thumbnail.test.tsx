import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@/lib/resume/template-data";
import {
  getTemplateThumbnailTraits,
  TemplatePreviewThumbnail,
} from "./template-preview-thumbnail";

describe("getTemplateThumbnailTraits", () => {
  it("maps centered line-divider templates to thumbnail traits", () => {
    const traits = getTemplateThumbnailTraits(TEMPLATES[0].styles);

    expect(traits).toMatchObject({
      accentColor: "#333333",
      headerAlignmentClass: "items-center text-center",
      sectionRuleClass: "border-b",
      bulletLabel: "•",
      isTwoColumn: false,
    });
  });

  it("maps two-column dash templates to thumbnail traits", () => {
    const modern = TEMPLATES.find((template) => template.id === "modern");
    const twoColumn = TEMPLATES.find((template) => template.id === "two-column");

    expect(modern).toBeDefined();
    expect(twoColumn).toBeDefined();
    expect(getTemplateThumbnailTraits(modern!.styles).bulletLabel).toBe("-");
    expect(getTemplateThumbnailTraits(twoColumn!.styles).isTwoColumn).toBe(true);
  });
});

describe("TemplatePreviewThumbnail", () => {
  it("renders an accessible-hidden miniature resume for a template", () => {
    render(<TemplatePreviewThumbnail template={TEMPLATES[1]} />);

    const thumbnail = screen.getByTestId("template-thumbnail-modern");
    expect(thumbnail).toHaveAttribute("aria-hidden", "true");
    expect(thumbnail).toHaveStyle({ fontFamily: "'Inter', 'Segoe UI', sans-serif" });
    expect(within(thumbnail).getByText("Alex Morgan")).toBeInTheDocument();
    expect(within(thumbnail).getByText("Experience")).toBeInTheDocument();
  });
});
