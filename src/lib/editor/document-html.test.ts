import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@/lib/resume/templates";
import { createPrintableEditorHtml } from "./document-html";

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
    expect(html).toContain("<p>Resume body</p>");
  });
});
