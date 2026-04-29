import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@/lib/resume/templates";
import { createEditorBodyHtml, createPrintableEditorHtml } from "./document-html";
import type { TipTapJSONContent } from "./types";

describe("createEditorBodyHtml", () => {
  it("serializes TipTap resume content to editable resume HTML", () => {
    const content: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Summary" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Product engineer" }],
            },
          ],
        },
      ],
    };

    const html = createEditorBodyHtml(content);

    expect(html).toContain('data-type="resume-section"');
    expect(html).toContain('data-section-title="Summary"');
    expect(html).toContain("Product engineer");
  });
});

describe("createPrintableEditorHtml", () => {
  it("wraps editor body HTML in printable template CSS", () => {
    const template = TEMPLATES.find((item) => item.id === "classic")!;
    const html = createPrintableEditorHtml(
      "<p>Resume body</p>",
      template.styles,
      "Jane <Resume>"
    );

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>Jane &lt;Resume&gt;</title>");
    expect(html).toContain(template.styles.accentColor);
    expect(html).toContain("@media print");
    expect(html).toContain(".resume-section-drag-handle");
    expect(html).toContain("<p>Resume body</p>");
  });
});
