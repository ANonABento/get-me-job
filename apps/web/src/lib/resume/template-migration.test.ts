import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { deflateRawSync } from "zlib";
import {
  applyLayoutHints,
  applySourceStyleHints,
  createTemplateMigrationDraft,
  extractSourceDocumentIR,
  mapSourceIRToResume,
} from "@/lib/resume/template-migration";
import { assessTemplateMigrationFidelity } from "@/lib/resume/template-migration-fidelity";
import type { DocumentTemplateV2 } from "@/lib/resume/template-v2";

describe("template migration source extraction", () => {
  it("extracts DOCX paragraphs, page size, and table cells into source IR", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Jane Rivera</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="2563EB"/></w:rPr><w:t>EXPERIENCE</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:rFonts w:ascii="Aptos"/></w:rPr><w:t>Senior Engineer | Acme | 2024 - Present</w:t></w:r></w:p>
          <w:tbl>
            <w:tr>
              <w:tc><w:tcPr><w:tcW w:w="2400"/></w:tcPr><w:p><w:r><w:t>Skills</w:t></w:r></w:p></w:tc>
              <w:tc><w:tcPr><w:tcW w:w="3600"/></w:tcPr><w:p><w:r><w:t>TypeScript</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:t>PDF import</w:t></w:r></w:p></w:tc>
            </w:tr>
          </w:tbl>
          <w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr>
        </w:body>
      </w:document>
    `;
    const stylesXml = `
      <w:styles>
        <w:style w:type="paragraph" w:styleId="Title">
          <w:rPr>
            <w:rFonts w:ascii="Aptos Display"/>
            <w:sz w:val="40"/>
            <w:b/>
            <w:color w:val="111827"/>
          </w:rPr>
        </w:style>
      </w:styles>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({
        "word/document.xml": xml,
        "word/styles.xml": stylesXml,
      }),
      "resume.docx",
      "docx",
    );

    expect(source.pages[0]).toMatchObject({ widthPt: 612, heightPt: 792 });
    expect(source.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "table-row",
          cells: ["Skills", "TypeScript", "PDF import"],
          cellMetadata: expect.arrayContaining([
            expect.objectContaining({ text: "TypeScript", widthPt: 180 }),
          ]),
        }),
      ]),
    );
    expect(source.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "Jane Rivera",
          style: expect.objectContaining({
            styleId: "Title",
            fontFamily: "Aptos Display, sans-serif",
            fontSizePt: 20,
            bold: true,
            color: "#111827",
          }),
        }),
        expect.objectContaining({
          text: "EXPERIENCE",
          style: expect.objectContaining({
            alignment: "center",
            fontSizePt: 12,
            color: "#2563EB",
          }),
        }),
      ]),
    );
    expect(source.diagnostics).toEqual(
      expect.arrayContaining([expect.stringMatching(/DOCX table geometry/i)]),
    );
  });

  it("reads DOCX XML through central-directory sizes when local headers omit them", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:p><w:r><w:t>Jane Rivera</w:t></w:r></w:p>
          <w:p><w:r><w:t>SKILLS</w:t></w:r></w:p>
          <w:p><w:r><w:t>TypeScript, LaTeX</w:t></w:r></w:p>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildCentralDirectoryZip({ "word/document.xml": xml }),
      "resume.docx",
      "docx",
    );

    expect(source.blocks.map((block) => block.text)).toEqual(
      expect.arrayContaining(["Jane Rivera", "SKILLS", "TypeScript, LaTeX"]),
    );
  });

  it("maps common LaTeX resume macros into semantic resume sections", async () => {
    const tex = String.raw`
      \documentclass[letterpaper]{article}
      \begin{document}
      Jane Rivera
      jane@example.com
      \section{Summary}
      Builds document migration systems.
      \section{Experience}
      \resumeSubheading{Acme}{2024 -- Present}{Senior Engineer}{Toronto, ON}
      \resumeItem{Built PDF and LaTeX template migration.}
      \section{Skills}
      TypeScript, PDF import, LaTeX
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "resume.tex",
      "tex",
    );
    const resume = mapSourceIRToResume(source);

    expect(resume.contact).toMatchObject({
      name: "Jane Rivera",
      email: "jane@example.com",
    });
    expect(resume.summary).toBe("Builds document migration systems.");
    expect(resume.experiences[0]).toMatchObject({
      title: "Senior Engineer",
      company: "Acme",
    });
    expect(resume.experiences[0]?.highlights).toEqual([
      "Built PDF and LaTeX template migration.",
    ]);
    expect(resume.skills).toEqual(["TypeScript", "PDF import", "LaTeX"]);
  });

  it("expands simple custom LaTeX macros before semantic mapping", async () => {
    const tex = String.raw`
      \documentclass{article}
      \newcommand{\jobline}[3]{#1 | #2 | #3}
      \newcommand{\skillrow}[2]{#1, #2}
      \begin{document}
      Jane Rivera
      \section{Experience}
      \jobline{Frontend Engineer}{Acme}{2022 -- 2024}
      \section{Skills}
      \skillrow{TypeScript}{React}
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "resume.tex",
      "tex",
    );
    const resume = mapSourceIRToResume(source);

    expect(resume.experiences[0]).toMatchObject({
      title: "Frontend Engineer",
      company: "Acme",
      dates: "2022 -- 2024",
    });
    expect(resume.skills).toEqual(["TypeScript", "React"]);
  });

  it("creates an end-to-end V2 migration draft from a LaTeX resume buffer", async () => {
    const tex = String.raw`
      \documentclass[letterpaper]{article}
      \usepackage[margin=0.6in]{geometry}
      \begin{document}
      Jane Rivera
      jane@example.com
      \section{Summary}
      Builds migration systems.
      \section{Experience}
      \resumeSubheading{Acme}{2024 -- Present}{Senior Engineer}{Toronto, ON}
      \resumeItem{Built reusable template migration.}
      \section{Skills}
      TypeScript, LaTeX
      \end{document}
    `;

    const draft = await createTemplateMigrationDraft({
      buffer: Buffer.from(tex),
      filename: "resume.tex",
      mimeType: "text/x-tex",
      userId: "user-1",
      llmClient: null,
      now: "2026-05-19T00:00:00.000Z",
    });

    expect(draft).toMatchObject({
      userId: "user-1",
      status: "reviewing",
      sourceFilename: "resume.tex",
      sourceType: "tex",
      resume: {
        contact: { name: "Jane Rivera", email: "jane@example.com" },
        summary: "Builds migration systems.",
      },
      template: {
        schemaVersion: 2,
        source: { filename: "resume.tex", type: "tex" },
      },
    });
    expect(draft.template.slots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "contact.email",
          sourceBlockIds: expect.any(Array),
        }),
        expect.objectContaining({
          path: "skills[]",
          sourceBlockIds: expect.any(Array),
        }),
      ]),
    );
    expect(draft.warnings.length).toBeGreaterThan(0);
    expect(draft.fidelity).toMatchObject({
      status: expect.stringMatching(/ready|review|low/),
      metrics: expect.objectContaining({
        semanticSlotCoverage: expect.any(Number),
      }),
    });
    expect(draft.fidelity.score).toBeGreaterThan(50);
  });

  it("extracts positioned blocks from a real PDF fixture", async () => {
    const buffer = readFileSync(
      path.join(
        process.cwd(),
        "tests/fixtures/personas/mid-engineer/resume.pdf",
      ),
    );

    const source = await extractSourceDocumentIR(buffer, "resume.pdf", "pdf");
    const resume = mapSourceIRToResume(source);

    expect(source.sourceType).toBe("pdf");
    expect(source.pages.length).toBeGreaterThan(0);
    expect(source.pages[0]).toEqual(
      expect.objectContaining({
        widthPt: expect.any(Number),
        heightPt: expect.any(Number),
      }),
    );
    expect(source.blocks.length).toBeGreaterThan(10);
    expect(source.blocks.some((block) => block.bbox)).toBe(true);
    expect(source.rawText.length).toBeGreaterThan(200);
    expect(source.diagnostics).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/PDF text positions were used/i),
      ]),
    );
    expect(resume.contact).toMatchObject({
      name: "Jordan Patel",
      email: "jordan.patel@example.test",
      github: "github.com/jordanpatel",
      linkedin: "linkedin.com/in/jordanpatel",
    });
    expect(resume.experiences[0]).toMatchObject({
      title: "Software Engineer II",
      company: "Brightforge Systems",
    });
    expect(resume.skills).toEqual(
      expect.arrayContaining(["TypeScript", "React", "Node.js", "Playwright"]),
    );
  });

  it("uses PDF source geometry to infer sidebar and main regions", () => {
    const template = sampleSingleColumnTemplate();

    applyLayoutHints(template, {
      sourceType: "pdf",
      filename: "resume.pdf",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        ...[80, 104, 128, 152].map((y, index) => ({
          id: `left-${index}`,
          pageId: "page-1",
          type: "paragraph" as const,
          text: `left ${index}`,
          bbox: { xPt: 48, yPt: y, widthPt: 110, heightPt: 10 },
        })),
        ...[80, 104, 128, 152].map((y, index) => ({
          id: `right-${index}`,
          pageId: "page-1",
          type: "paragraph" as const,
          text: `right ${index}`,
          bbox: { xPt: 300, yPt: y, widthPt: 240, heightPt: 10 },
        })),
      ],
    });

    expect(template.regions.map((region) => region.role)).toEqual([
      "header",
      "sidebar",
      "main",
    ]);
    expect(
      template.regions.find((region) => region.role === "sidebar")?.blocks,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "section-skills" }),
      ]),
    );
    expect(template.diagnostics).toEqual(
      expect.arrayContaining(["source_column_geometry_inferred"]),
    );
  });

  it("preserves source table column widths on reusable V2 blocks", () => {
    const template = sampleSingleColumnTemplate();

    applyLayoutHints(template, {
      sourceType: "docx",
      filename: "resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        {
          id: "table-1",
          pageId: "page-1",
          type: "table-row",
          text: "TypeScript | PDF import | LaTeX",
          cellMetadata: [
            { text: "TypeScript", widthPt: 120 },
            { text: "PDF import", widthPt: 180 },
            { text: "LaTeX", widthPt: 90 },
          ],
        },
      ],
    });

    expect(
      template.regions
        .flatMap((region) => region.blocks)
        .find((block) => block.id === "section-skills"),
    ).toEqual(
      expect.objectContaining({
        columns: 3,
        columnWidthsPt: [120, 180, 90],
      }),
    );

    const fidelity = assessTemplateMigrationFidelity(
      {
        sourceType: "docx",
        filename: "resume.docx",
        pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
        rawText: "",
        diagnostics: [],
        blocks: [
          {
            id: "table-1",
            pageId: "page-1",
            type: "table-row",
            text: "TypeScript | PDF import | LaTeX",
            cellMetadata: [
              { text: "TypeScript", widthPt: 120 },
              { text: "PDF import", widthPt: 180 },
              { text: "LaTeX", widthPt: 90 },
            ],
          },
        ],
      },
      template,
    );
    expect(fidelity.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tables",
          passed: true,
        }),
      ]),
    );
  });

  it("applies source style hints to V2 typography tokens", () => {
    const template = sampleSingleColumnTemplate();
    template.tokens = {
      name: { fontFamily: "Arial", fontSize: "20pt", lineHeight: "1.1" },
      heading: { fontFamily: "Arial", fontSize: "12pt", lineHeight: "1.2" },
      body: { fontFamily: "Arial", fontSize: "10pt", lineHeight: "1.4" },
      "body-strong": {
        fontFamily: "Arial",
        fontSize: "10pt",
        lineHeight: "1.4",
      },
      meta: { fontFamily: "Arial", fontSize: "9pt", lineHeight: "1.4" },
    };

    applySourceStyleHints(template, {
      sourceType: "docx",
      filename: "resume.docx",
      pages: [],
      rawText: "",
      diagnostics: [],
      blocks: [
        {
          id: "name",
          pageId: "page-1",
          type: "heading",
          text: "Jane Rivera",
          style: {
            fontFamily: "Aptos Display, sans-serif",
            fontSizePt: 20,
            bold: true,
            color: "#111827",
          },
        },
        {
          id: "body",
          pageId: "page-1",
          type: "paragraph",
          text: "Builds migration systems.",
          style: {
            fontFamily: "Aptos, sans-serif",
            fontSizePt: 10.5,
            color: "#374151",
          },
        },
      ],
    });

    expect(template.tokens.name).toMatchObject({
      fontFamily: "Aptos Display, sans-serif",
      fontSize: "20pt",
      color: "#111827",
      fontWeight: "700",
    });
    expect(template.tokens.body).toMatchObject({
      fontFamily: "Aptos, sans-serif",
      fontSize: "10.5pt",
      color: "#374151",
    });
  });
});

function buildStoredZip(entries: Record<string, string>): Buffer {
  return Buffer.concat(
    Object.entries(entries).map(([name, content]) => {
      const nameBuffer = Buffer.from(name);
      const contentBuffer = Buffer.from(content);
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(0, 6);
      header.writeUInt16LE(0, 8);
      header.writeUInt32LE(contentBuffer.length, 18);
      header.writeUInt32LE(contentBuffer.length, 22);
      header.writeUInt16LE(nameBuffer.length, 26);
      header.writeUInt16LE(0, 28);
      return Buffer.concat([header, nameBuffer, contentBuffer]);
    }),
  );
}

function buildCentralDirectoryZip(entries: Record<string, string>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const [name, content] of Object.entries(entries)) {
    const nameBuffer = Buffer.from(name);
    const uncompressed = Buffer.from(content);
    const compressed = deflateRawSync(uncompressed);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x08, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt32LE(0, 18);
    localHeader.writeUInt32LE(0, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x08, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(uncompressed.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralParts.push(centralHeader, nameBuffer);

    localOffset += localHeader.length + nameBuffer.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(Object.keys(entries).length, 8);
  eocd.writeUInt16LE(Object.keys(entries).length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(localOffset, 16);

  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

function sampleSingleColumnTemplate(): DocumentTemplateV2 {
  return {
    schemaVersion: 2,
    id: "template-1",
    name: "Template",
    page: {
      size: "letter",
      margins: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    },
    tokens: {},
    regions: [
      {
        id: "region-header",
        role: "header",
        flow: "block",
        blocks: [],
      },
      {
        id: "region-main",
        role: "main",
        flow: "block",
        blocks: [
          {
            id: "section-summary",
            type: "section",
            text: "Summary",
            children: [],
          },
          {
            id: "section-experience",
            type: "section",
            text: "Experience",
            repeat: "experiences",
            children: [],
          },
          {
            id: "section-skills",
            type: "section",
            text: "Skills",
            children: [],
          },
          {
            id: "section-certifications",
            type: "section",
            text: "Certifications",
            children: [],
          },
        ],
      },
    ],
    slots: [],
    diagnostics: [],
  };
}
