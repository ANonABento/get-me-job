import { describe, expect, it } from "vitest";

import type { SourceDocumentIR } from "@/lib/resume/template-migration";
import { verifyReusableTemplateRender } from "./template-visual-verification";

describe("template visual verification", () => {
  it("counts source lines as covered when reusable render splits table cells into semantic fields", async () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "table-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: [
        "Alex Rivera",
        "Senior Platform Engineer | Northstar Labs | Jan 2022 - Present | Toronto, ON",
        "Languages: TypeScript | Python | SQL",
      ].join("\n"),
      blocks: [
        {
          id: "block-1",
          pageId: "page-1",
          type: "paragraph",
          text: "Alex Rivera",
        },
        {
          id: "block-2",
          pageId: "page-1",
          type: "table-row",
          text: "Senior Platform Engineer | Northstar Labs | Jan 2022 - Present | Toronto, ON",
          cells: [
            "Senior Platform Engineer",
            "Northstar Labs",
            "Jan 2022 - Present",
            "Toronto, ON",
          ],
        },
        {
          id: "block-3",
          pageId: "page-1",
          type: "table-row",
          text: "Languages: TypeScript | Python | SQL",
          cells: ["Languages: TypeScript", "Python", "SQL"],
        },
      ],
      diagnostics: [],
    };
    const html = `
      <article class="resume-template" style="width:816px;min-height:1056px">
        <h1>Alex Rivera</h1>
        <section class="rt-section">
          <h2>Experience</h2>
          <div class="rt-entry">
            <div class="rt-entry-head">
              <strong>Senior Platform Engineer</strong>
              <span>Northstar Labs</span>
              <time>Jan 2022 - Present</time>
              <span>Toronto, ON</span>
            </div>
          </div>
        </section>
        <section class="rt-section">
          <h2>Skills</h2>
          <div class="rt-entry">
            <span>Languages: TypeScript</span>
            <span>Python</span>
            <span>SQL</span>
          </div>
        </section>
      </article>
    `;

    const report = await verifyReusableTemplateRender({ html, source });

    expect(report.render.sourceLineCoverage).toBe(1);
    expect(report.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "low-source-text-coverage" }),
      ]),
    );
  });

  it("does not count sub-pixel page-height rounding as page overflow", async () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "a4-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 595.3, heightPt: 841.9 }],
      rawText: "Alex Rivera",
      blocks: [
        {
          id: "block-1",
          pageId: "page-1",
          type: "paragraph",
          text: "Alex Rivera",
        },
      ],
      diagnostics: [],
    };
    const html = `
      <article class="resume-template" style="width:595.3pt;min-height:841.9pt;padding:0">
        <h1>Alex Rivera</h1>
      </article>
    `;

    const report = await verifyReusableTemplateRender({ html, source });

    expect(report.render.estimatedPages).toBe(1);
    expect(report.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "page-overflow" }),
      ]),
    );
  });
});
