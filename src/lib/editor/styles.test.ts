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
});
