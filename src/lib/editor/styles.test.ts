import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@/lib/resume/templates";
import { getResumeDocumentStyles, getResumeEditorStyles } from "./styles";

describe("resume editor styles", () => {
  it("generates scoped editor CSS from template styles", () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const css = getResumeEditorStyles(template.styles);

    expect(css).toContain(".resume-editor .ProseMirror");
    expect(css).toContain(template.styles.fontFamily);
    expect(css).toContain(template.styles.accentColor);
    expect(css).toContain("caret-color");
    expect(css).toContain("::selection");
    expect(css).toContain(".resume-section-drag-handle");
    expect(css).toContain("content: attr(data-placeholder)");
    expect(css).not.toContain("@media print");
  });

  it("generates printable two-column document CSS", () => {
    const template = TEMPLATES.find((item) => item.id === "two-column")!;
    const css = getResumeDocumentStyles(template.styles);

    expect(css).toContain("body .two-col-container");
    expect(css).toContain("display: flex");
    expect(css).toContain("@media print");
    expect(css).toContain("print-color-adjust: exact");
  });

  it("applies custom bullet markers to two-column body lists only", () => {
    const template = TEMPLATES.find((item) => item.id === "two-column")!;
    const css = getResumeDocumentStyles({
      ...template.styles,
      bulletStyle: "arrow",
    });

    expect(css).toContain("list-style-type: none");
    expect(css).toContain("body ul:not(.skills-list) li::before");
    expect(css).toContain('content: "\\2192 "');
    expect(css).not.toContain("body .skills-list li::before");
  });
});
