import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { deflateRawSync } from "zlib";
import {
  applyLayoutHints,
  applySourceStyleHints,
  createTemplateMigrationDraft,
  createDocumentTemplateV3FromSourceIR,
  extractSourceDocumentIR,
  inferPdfTableRows,
  mapSourceIRToResume,
} from "@/lib/resume/template-migration";
import {
  assessTemplateMigrationFidelity,
  assessVisualTemplateFidelity,
} from "@/lib/resume/template-migration-fidelity";
import type { DocumentTemplateV2 } from "@/lib/resume/template-v2";
import type { DocumentTemplateV3 } from "@/lib/resume/template-v3";

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
          <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900"/>
          </w:sectPr>
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

    expect(source.pages[0]).toMatchObject({
      widthPt: 612,
      heightPt: 792,
      margins: {
        top: "36pt",
        right: "45pt",
        bottom: "36pt",
        left: "45pt",
      },
    });
    expect(
      createDocumentTemplateV3FromSourceIR("template-v3", "DOCX Page", source)
        .page.margins,
    ).toEqual({
      top: "36pt",
      right: "45pt",
      bottom: "36pt",
      left: "45pt",
    });
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

  it("normalizes duplicated DOCX table grids and keeps only prototype repeat rows", () => {
    const source = {
      sourceType: "docx" as const,
      filename: "master-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText:
        "EXPERIENCE\nEngineer | 2024\nBuilt imports\nDesigner | 2023\nBuilt previews",
      diagnostics: [],
      blocks: [
        {
          id: "block-1",
          pageId: "page-1",
          type: "table-row" as const,
          text: "EXPERIENCE",
          cells: ["EXPERIENCE"],
          tableMetadata: {
            id: "table-1",
            widthPt: 540,
            columns: [360, 180, 360, 180],
          },
          cellMetadata: [{ text: "EXPERIENCE", gridSpan: 2 }],
        },
        {
          id: "block-2",
          pageId: "page-1",
          type: "table-row" as const,
          text: "Engineer | 2024",
          cells: ["Engineer", "2024"],
          tableMetadata: {
            id: "table-1",
            widthPt: 540,
            columns: [360, 180, 360, 180],
          },
          cellMetadata: [
            { text: "Engineer", widthPt: 360 },
            { text: "2024", widthPt: 180 },
          ],
        },
        {
          id: "block-3",
          pageId: "page-1",
          type: "table-row" as const,
          text: "Built imports",
          cells: ["Built imports"],
          tableMetadata: {
            id: "table-1",
            widthPt: 540,
            columns: [360, 180, 360, 180],
          },
          cellMetadata: [
            {
              text: "Built imports",
              widthPt: 540,
              blocks: [
                {
                  id: "cell-block-1",
                  type: "list-item" as const,
                  text: "Built imports",
                  runs: [{ text: "Built imports" }],
                },
              ],
            },
          ],
        },
        {
          id: "block-4",
          pageId: "page-1",
          type: "table-row" as const,
          text: "Designer | 2023",
          cells: ["Designer", "2023"],
          tableMetadata: {
            id: "table-1",
            widthPt: 540,
            columns: [360, 180, 360, 180],
          },
          cellMetadata: [
            { text: "Designer", widthPt: 360 },
            { text: "2023", widthPt: 180 },
          ],
        },
        {
          id: "block-5",
          pageId: "page-1",
          type: "table-row" as const,
          text: "Built previews",
          cells: ["Built previews"],
          tableMetadata: {
            id: "table-1",
            widthPt: 540,
            columns: [360, 180, 360, 180],
          },
          cellMetadata: [
            {
              text: "Built previews",
              widthPt: 540,
              blocks: [
                {
                  id: "cell-block-2",
                  type: "list-item" as const,
                  text: "Built previews",
                  runs: [{ text: "Built previews" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "DOCX Repeat",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(table && table.kind === "table" ? table.columns : []).toEqual([
      { widthPt: 360 },
      { widthPt: 180 },
    ]);
    expect(
      table && table.kind === "table" ? table.rows.map((row) => row.id) : [],
    ).toEqual(["row-block-1", "row-block-2", "row-block-3"]);
    expect(templateV3.repeatGroups).toEqual([
      expect.objectContaining({
        collection: "experiences",
        nodeIds: ["row-block-2", "row-block-3"],
      }),
    ]);
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

  it("preserves simple LaTeX tabular alignment and rules in V3 tables", async () => {
    const tex = String.raw`
      \documentclass[letterpaper]{article}
      \begin{document}
      \begin{tabular}{|l|r|}
      \hline
      Project & 2024 \\
      Migration UI & Toronto \\
      \end{tabular}
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "resume.tex",
      "tex",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "LaTeX Table",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(source.blocks[0]).toMatchObject({
      type: "table-row",
      cells: ["Project", "2024"],
      tableMetadata: expect.objectContaining({ id: "latex-table-1" }),
      rowMetadata: expect.objectContaining({
        borders: expect.objectContaining({
          top: expect.objectContaining({ widthPt: 0.4 }),
        }),
      }),
      cellMetadata: [
        expect.objectContaining({
          alignment: "left",
          borders: expect.objectContaining({
            left: expect.objectContaining({ style: "solid" }),
            right: expect.objectContaining({ style: "solid" }),
          }),
        }),
        expect.objectContaining({
          alignment: "right",
          borders: expect.objectContaining({
            right: expect.objectContaining({ style: "solid" }),
          }),
        }),
      ],
    });
    expect(table).toMatchObject({
      kind: "table",
      id: "latex-table-1",
    });
    expect(
      table && table.kind === "table" ? table.rows[0] : null,
    ).toMatchObject({
      borders: expect.objectContaining({
        top: expect.objectContaining({ widthPt: 0.4 }),
      }),
      cells: [
        expect.objectContaining({ textAlign: "left" }),
        expect.objectContaining({ textAlign: "right" }),
      ],
    });
  });

  it("preserves LaTeX paragraph column widths in V3 tables", async () => {
    const tex = String.raw`
      \documentclass{article}
      \begin{document}
      \begin{tabular}{p{2in}r}
      Summary text & 2026 \\
      \end{tabular}
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "paragraph-column.tex",
      "tex",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Paragraph Column",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(source.blocks[0]).toMatchObject({
      type: "table-row",
      cells: ["Summary text", "2026"],
      cellMetadata: [
        expect.objectContaining({ widthPt: 144, alignment: "left" }),
        expect.objectContaining({ alignment: "right" }),
      ],
    });
    expect(table).toMatchObject({
      kind: "table",
      rows: [
        expect.objectContaining({
          cells: [
            expect.objectContaining({ widthPt: 144, textAlign: "left" }),
            expect.objectContaining({ textAlign: "right" }),
          ],
        }),
      ],
    });
    expect(table && table.kind === "table" ? table.columns : []).toEqual([
      expect.objectContaining({ widthPt: 144 }),
      {},
    ]);
  });

  it("preserves LaTeX geometry margins and tabularx multicolumn spans in V3 tables", async () => {
    const tex = String.raw`
      \documentclass[letterpaper]{article}
      \usepackage[top=0.5in,left=0.7in,right=0.6in,bottom=0.8in]{geometry}
      \begin{document}
      \begin{tabularx}{6in}{|l|r|}
      \hline
      \multicolumn{2}{|c|}{PROJECTS} \\
      Slothing & 2026 \\
      \end{tabularx}
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "tabularx.tex",
      "tex",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Tabularx",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(source.pages[0]?.margins).toEqual({
      top: "36pt",
      right: "43.2pt",
      bottom: "57.6pt",
      left: "50.4pt",
    });
    expect(source.blocks[0]).toMatchObject({
      type: "table-row",
      tableMetadata: expect.objectContaining({
        id: "latex-table-1",
        widthPt: 432,
      }),
      cells: ["PROJECTS"],
      cellMetadata: [
        expect.objectContaining({
          gridSpan: 2,
          alignment: "center",
          borders: expect.objectContaining({
            left: expect.objectContaining({ style: "solid" }),
            right: expect.objectContaining({ style: "solid" }),
          }),
        }),
      ],
    });
    expect(table).toMatchObject({
      kind: "table",
      box: { widthPt: 432 },
      rows: [
        expect.objectContaining({
          cells: [
            expect.objectContaining({
              colSpan: 2,
              textAlign: "center",
            }),
          ],
        }),
        expect.objectContaining({
          cells: [
            expect.objectContaining({ textAlign: "left" }),
            expect.objectContaining({ textAlign: "right" }),
          ],
        }),
      ],
    });
    expect(templateV3.page.margins).toEqual({
      top: "36pt",
      right: "43.2pt",
      bottom: "57.6pt",
      left: "50.4pt",
    });
  });

  it("preserves LaTeX row and cell colors as V3 fills", async () => {
    const tex = String.raw`
      \documentclass{article}
      \usepackage[table]{xcolor}
      \begin{document}
      \begin{tabular}{ll}
      \rowcolor{EFEFEF} Section & Detail \\
      Project & \cellcolor{yellow} Highlight \\
      \end{tabular}
      \end{document}
    `;

    const source = await extractSourceDocumentIR(
      Buffer.from(tex),
      "colored-table.tex",
      "tex",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Colored Table",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(source.blocks[0]).toMatchObject({
      type: "table-row",
      cells: ["Section", "Detail"],
      rowMetadata: expect.objectContaining({
        fill: { color: "#EFEFEF" },
      }),
    });
    expect(source.blocks[1]).toMatchObject({
      type: "table-row",
      cells: ["Project", "Highlight"],
      cellMetadata: [
        expect.objectContaining({ text: "Project" }),
        expect.objectContaining({
          text: "Highlight",
          fill: { color: "#FFFF00" },
        }),
      ],
    });
    expect(table).toMatchObject({
      kind: "table",
      rows: [
        expect.objectContaining({
          fill: { color: "#EFEFEF" },
        }),
        expect.objectContaining({
          cells: [
            expect.objectContaining({
              sourceRef: expect.objectContaining({ text: "Project" }),
            }),
            expect.objectContaining({ fill: { color: "#FFFF00" } }),
          ],
        }),
      ],
    });
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
        slotCoverage: expect.any(Number),
      }),
    });
    expect(draft.fidelity.score).toBeGreaterThan(50);
  });

  it("creates a V3 visual template draft with DOCX table cells as first-class nodes", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:tbl>
            <w:tblPr>
              <w:tblW w:w="6600"/>
              <w:jc w:val="center"/>
              <w:tblCellMar><w:top w:w="80"/><w:left w:w="100"/><w:bottom w:w="80"/><w:right w:w="100"/></w:tblCellMar>
              <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:color="94A3B8"/>
                <w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/>
              </w:tblBorders>
              <w:shd w:fill="F8FAFC"/>
            </w:tblPr>
            <w:tblGrid>
              <w:gridCol w:w="4200"/>
              <w:gridCol w:w="2400"/>
            </w:tblGrid>
            <w:tr>
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="4200"/>
                  <w:shd w:fill="E5E7EB"/>
                  <w:tcMar><w:left w:w="120"/><w:right w:w="120"/></w:tcMar>
                  <w:tcBorders><w:bottom w:val="single" w:sz="8" w:color="111827"/></w:tcBorders>
                </w:tcPr>
                <w:p><w:r><w:t>Jane Rivera</w:t></w:r></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr><w:tcW w:w="2400"/></w:tcPr>
                <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>jane@example.com</w:t></w:r></w:p>
              </w:tc>
            </w:tr>
            <w:tr>
              <w:trPr>
                <w:trHeight w:val="360"/>
                <w:trBorders><w:bottom w:val="dashed" w:sz="4" w:color="CBD5E1"/></w:trBorders>
                <w:shd w:fill="FFFFFF"/>
              </w:trPr>
              <w:tc>
                <w:tcPr><w:tcW w:w="6600"/><w:gridSpan w:val="2"/></w:tcPr>
                <w:p>
                  <w:pPr><w:spacing w:line="288" w:lineRule="auto"/></w:pPr>
                  <w:hyperlink r:id="rId1"><w:r><w:rPr><w:i/><w:color w:val="2563EB"/></w:rPr><w:t>Portfolio</w:t></w:r></w:hyperlink>
                </w:p>
                <w:p>
                  <w:pPr>
                    <w:numPr><w:numId w:val="1"/></w:numPr>
                    <w:spacing w:line="216" w:lineRule="auto"/>
                  </w:pPr>
                  <w:r><w:rPr><w:i/></w:rPr><w:t>Preserved bullet spacing inside a table cell.</w:t></w:r>
                </w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({
        "word/document.xml": xml,
        "word/_rels/document.xml.rels": `
          <Relationships>
            <Relationship Id="rId1" Target="https://example.com/portfolio"/>
          </Relationships>
        `,
      }),
      "table-resume.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Table Resume",
      source,
    );

    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );
    expect(source.blocks[1]?.cellMetadata?.[0]?.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "link",
          text: "Portfolio",
          href: "https://example.com/portfolio",
          runs: [
            expect.objectContaining({
              text: "Portfolio",
              href: "https://example.com/portfolio",
              style: expect.objectContaining({
                color: "#2563EB",
                italic: true,
                lineHeight: "1.2",
              }),
            }),
          ],
        }),
        expect.objectContaining({
          type: "list-item",
          text: "Preserved bullet spacing inside a table cell.",
          listMarker: "disc",
          style: expect.objectContaining({
            italic: true,
            lineHeight: "0.9",
          }),
        }),
      ]),
    );
    expect(table).toMatchObject({
      kind: "table",
      id: "table-1",
      box: { widthPt: 330 },
      alignment: "center",
      columns: [{ widthPt: 210 }, { widthPt: 120 }],
      borders: expect.objectContaining({
        top: expect.objectContaining({
          widthPt: 0.5,
          color: "#94A3B8",
          style: "solid",
        }),
        insideH: expect.objectContaining({
          color: "#CBD5E1",
          style: "solid",
        }),
      }),
      cellDefaults: expect.objectContaining({
        padding: {
          top: "4pt",
          right: "5pt",
          bottom: "4pt",
          left: "5pt",
        },
        fill: { color: "#F8FAFC" },
      }),
      rows: [
        {
          cells: [
            expect.objectContaining({
              widthPt: 210,
              fill: { color: "#E5E7EB" },
              padding: expect.objectContaining({
                left: "6pt",
                right: "6pt",
              }),
              borders: expect.objectContaining({
                bottom: expect.objectContaining({
                  widthPt: 1,
                  color: "#111827",
                  style: "solid",
                }),
              }),
            }),
            expect.objectContaining({
              widthPt: 120,
              textAlign: "right",
            }),
          ],
        },
        {
          heightPt: 18,
          fill: { color: "#FFFFFF" },
          borders: expect.objectContaining({
            bottom: expect.objectContaining({
              widthPt: 0.5,
              color: "#CBD5E1",
              style: "dashed",
            }),
          }),
          cells: [
            expect.objectContaining({
              colSpan: 2,
              nodes: expect.arrayContaining([
                expect.objectContaining({
                  kind: "text",
                  text: "Portfolio",
                  href: "https://example.com/portfolio",
                  style: expect.objectContaining({
                    color: "#2563EB",
                    fontStyle: "italic",
                    lineHeight: "1.2",
                  }),
                }),
                expect.objectContaining({
                  kind: "list",
                  items: ["Preserved bullet spacing inside a table cell."],
                  marker: "disc",
                  style: expect.objectContaining({
                    fontStyle: "italic",
                    lineHeight: "0.9",
                  }),
                }),
              ]),
            }),
          ],
        },
      ],
    });
    expect(templateV3.slots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "contact.email" }),
      ]),
    );
  });

  it("preserves DOCX numbered list markers inside V3 table cells", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:tbl>
            <w:tblGrid><w:gridCol w:w="6000"/></w:tblGrid>
            <w:tr>
              <w:tc>
                <w:p>
                  <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="42"/></w:numPr></w:pPr>
                  <w:r><w:t>First quantified impact.</w:t></w:r>
                </w:p>
                <w:p>
                  <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="42"/></w:numPr></w:pPr>
                  <w:r><w:t>Second quantified impact.</w:t></w:r>
                </w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({
        "word/document.xml": xml,
        "word/numbering.xml": `
          <w:numbering>
            <w:abstractNum w:abstractNumId="7">
              <w:lvl w:ilvl="0"><w:numFmt w:val="decimal"/></w:lvl>
            </w:abstractNum>
            <w:num w:numId="42"><w:abstractNumId w:val="7"/></w:num>
          </w:numbering>
        `,
      }),
      "numbered-list.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Numbered List",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );
    const listNode =
      table && table.kind === "table"
        ? table.rows[0]?.cells[0]?.nodes.find((node) => node.kind === "list")
        : null;

    expect(source.blocks[0]?.cellMetadata?.[0]?.blocks).toEqual([
      expect.objectContaining({
        type: "list-item",
        text: "First quantified impact.",
        listMarker: "decimal",
      }),
      expect.objectContaining({
        type: "list-item",
        text: "Second quantified impact.",
        listMarker: "decimal",
      }),
    ]);
    expect(listNode).toMatchObject({
      kind: "list",
      marker: "decimal",
      items: ["First quantified impact.", "Second quantified impact."],
    });
  });

  it("preserves DOCX document order and separate table boundaries in V3 nodes", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>SUMMARY</w:t></w:r></w:p>
          <w:tbl>
            <w:tblGrid><w:gridCol w:w="3000"/></w:tblGrid>
            <w:tr><w:tc><w:p><w:r><w:t>First table cell</w:t></w:r></w:p></w:tc></w:tr>
          </w:tbl>
          <w:p><w:r><w:t>Between tables note</w:t></w:r></w:p>
          <w:tbl>
            <w:tblGrid><w:gridCol w:w="1800"/><w:gridCol w:w="1800"/></w:tblGrid>
            <w:tr>
              <w:tc><w:p><w:r><w:t>Second table left</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:r><w:t>Second table right</w:t></w:r></w:p></w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({ "word/document.xml": xml }),
      "ordered-tables.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Ordered Tables",
      source,
    );
    const nodes = templateV3.regions[0]?.nodes ?? [];

    expect(nodes.map((node) => node.kind)).toEqual([
      "section",
      "table",
      "text",
      "table",
    ]);
    expect(
      nodes.filter((node) => node.kind === "table").map((node) => node.id),
    ).toEqual(["table-1", "table-2"]);
    expect(nodes[2]).toEqual(
      expect.objectContaining({
        kind: "text",
        text: "Between tables note",
      }),
    );
  });

  it("preserves nested DOCX tables as V3 tables inside cells", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:tbl>
            <w:tblGrid><w:gridCol w:w="7200"/></w:tblGrid>
            <w:tr>
              <w:tc>
                <w:tcPr><w:tcW w:w="7200"/></w:tcPr>
                <w:p><w:r><w:t>PROJECTS</w:t></w:r></w:p>
                <w:tbl>
                  <w:tblPr>
                    <w:tblBorders>
                      <w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/>
                    </w:tblBorders>
                  </w:tblPr>
                  <w:tblGrid><w:gridCol w:w="4800"/><w:gridCol w:w="2400"/></w:tblGrid>
                  <w:tr>
                    <w:tc><w:p><w:r><w:t>Visual Import</w:t></w:r></w:p></w:tc>
                    <w:tc><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>2026</w:t></w:r></w:p></w:tc>
                  </w:tr>
                </w:tbl>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({ "word/document.xml": xml }),
      "nested-table.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Nested Table",
      source,
    );
    const nodes = templateV3.regions[0]?.nodes ?? [];
    const outerTable = nodes.find((node) => node.kind === "table");
    const nestedTable =
      outerTable && outerTable.kind === "table"
        ? outerTable.rows[0]?.cells[0]?.nodes.find(
            (node) => node.kind === "table",
          )
        : null;

    expect(nodes.filter((node) => node.kind === "table")).toHaveLength(1);
    expect(source.blocks).toHaveLength(1);
    expect(source.blocks[0]?.cellMetadata?.[0]?.nestedTables?.[0]).toEqual([
      expect.objectContaining({
        type: "table-row",
        cells: ["Visual Import", "2026"],
        cellMetadata: [
          expect.objectContaining({ widthPt: 240 }),
          expect.objectContaining({ widthPt: 120, alignment: "right" }),
        ],
      }),
    ]);
    expect(nestedTable).toMatchObject({
      kind: "table",
      columns: [{ widthPt: 240 }, { widthPt: 120 }],
      borders: expect.objectContaining({
        insideV: expect.objectContaining({ color: "#CCCCCC" }),
      }),
      rows: [
        expect.objectContaining({
          cells: [
            expect.objectContaining({
              nodes: [
                expect.objectContaining({
                  kind: "text",
                  text: "Visual Import",
                }),
              ],
            }),
            expect.objectContaining({ textAlign: "right" }),
          ],
        }),
      ],
    });
  });

  it("maps DOCX vertical cell merges to V3 row spans", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:tbl>
            <w:tblGrid>
              <w:gridCol w:w="2400"/>
              <w:gridCol w:w="3600"/>
            </w:tblGrid>
            <w:tr>
              <w:tc>
                <w:tcPr><w:vMerge w:val="restart"/><w:tcW w:w="2400"/></w:tcPr>
                <w:p><w:r><w:t>Contact</w:t></w:r></w:p>
              </w:tc>
              <w:tc><w:p><w:r><w:t>jane@example.com</w:t></w:r></w:p></w:tc>
            </w:tr>
            <w:tr>
              <w:tc>
                <w:tcPr><w:vMerge/><w:tcW w:w="2400"/></w:tcPr>
                <w:p><w:r><w:t>Contact</w:t></w:r></w:p>
              </w:tc>
              <w:tc><w:p><w:r><w:t>+1 (416) 847-1928</w:t></w:r></w:p></w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({ "word/document.xml": xml }),
      "vertical-merge.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Vertical Merge",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(source.blocks[0]?.cellMetadata?.[0]?.verticalMerge).toBe("restart");
    expect(source.blocks[1]?.cellMetadata?.[0]?.verticalMerge).toBe("continue");
    expect(table).toMatchObject({
      kind: "table",
      rows: [
        {
          cells: [
            expect.objectContaining({ rowSpan: 2 }),
            expect.objectContaining({
              sourceRef: expect.objectContaining({ text: "jane@example.com" }),
            }),
          ],
        },
        {
          cells: [
            expect.objectContaining({
              sourceRef: expect.objectContaining({
                text: "+1 (416) 847-1928",
              }),
            }),
          ],
        },
      ],
    });
    expect(
      table && table.kind === "table" ? table.rows[1].cells : [],
    ).toHaveLength(1);
  });

  it("infers V3 repeat groups from DOCX table section rows", async () => {
    const xml = `
      <w:document>
        <w:body>
          <w:tbl>
            <w:tblGrid>
              <w:gridCol w:w="4800"/>
              <w:gridCol w:w="1800"/>
            </w:tblGrid>
            <w:tr>
              <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>EXPERIENCE</w:t></w:r></w:p></w:tc>
            </w:tr>
            <w:tr>
              <w:tc><w:p><w:r><w:t>Senior Product Engineer</w:t></w:r></w:p></w:tc>
              <w:tc><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>2023 - Present</w:t></w:r></w:p></w:tc>
            </w:tr>
            <w:tr>
              <w:tc>
                <w:tcPr><w:gridSpan w:val="2"/></w:tcPr>
                <w:p><w:pPr><w:numPr><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>Built reusable table import.</w:t></w:r></w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
        </w:body>
      </w:document>
    `;

    const source = await extractSourceDocumentIR(
      buildStoredZip({ "word/document.xml": xml }),
      "experience-table.docx",
      "docx",
    );
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Experience Table",
      source,
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(templateV3.slots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "experiences[].title" }),
        expect.objectContaining({ path: "experiences[].dates" }),
        expect.objectContaining({ path: "experiences[].highlights[]" }),
      ]),
    );
    expect(templateV3.repeatGroups).toEqual([
      expect.objectContaining({
        id: "repeat-experiences",
        collection: "experiences",
        nodeIds: ["row-block-2", "row-block-3"],
      }),
    ]);
    expect(table).toMatchObject({
      kind: "table",
      rows: [
        expect.objectContaining({ role: "section-header" }),
        expect.objectContaining({ repeatGroupId: "repeat-experiences" }),
        expect.objectContaining({ repeatGroupId: "repeat-experiences" }),
      ],
    });
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

  it("infers V3 table rows from repeated aligned PDF text geometry", () => {
    const { blocks, inferredTableCount } = inferPdfTableRows([
      {
        id: "heading",
        pageId: "page-1",
        type: "heading",
        text: "EXPERIENCE",
        bbox: { xPt: 72, yPt: 80, widthPt: 90, heightPt: 12 },
      },
      {
        id: "title-1",
        pageId: "page-1",
        type: "paragraph",
        text: "Staff Engineer",
        bbox: { xPt: 72, yPt: 112, widthPt: 150, heightPt: 10 },
      },
      {
        id: "date-1",
        pageId: "page-1",
        type: "paragraph",
        text: "2023 - Present",
        bbox: { xPt: 430, yPt: 112, widthPt: 82, heightPt: 10 },
      },
      {
        id: "title-2",
        pageId: "page-1",
        type: "paragraph",
        text: "Frontend Engineer",
        bbox: { xPt: 73, yPt: 132, widthPt: 150, heightPt: 10 },
      },
      {
        id: "date-2",
        pageId: "page-1",
        type: "paragraph",
        text: "2020 - 2023",
        bbox: { xPt: 431, yPt: 132, widthPt: 82, heightPt: 10 },
      },
    ]);
    const templateV3 = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "PDF Table",
      {
        sourceType: "pdf",
        filename: "aligned.pdf",
        pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
        blocks,
        rawText: blocks.map((block) => block.text).join("\n"),
        diagnostics: [],
      },
    );
    const table = templateV3.regions[0]?.nodes.find(
      (node) => node.kind === "table",
    );

    expect(inferredTableCount).toBe(1);
    expect(blocks.map((block) => block.type)).toEqual([
      "heading",
      "table-row",
      "table-row",
    ]);
    expect(blocks[1]).toMatchObject({
      text: "Staff Engineer | 2023 - Present",
      cellMetadata: [
        expect.objectContaining({ text: "Staff Engineer", widthPt: 150 }),
        expect.objectContaining({
          text: "2023 - Present",
          alignment: "right",
        }),
      ],
    });
    expect(table).toMatchObject({
      kind: "table",
      id: "pdf-table-1",
      rows: [
        expect.objectContaining({
          cells: [
            expect.objectContaining({ textAlign: "left" }),
            expect.objectContaining({ textAlign: "right" }),
          ],
        }),
      ],
    });
    expect(table && table.kind === "table" ? table.rows : []).toHaveLength(1);
    expect(templateV3.repeatGroups).toEqual([
      expect.objectContaining({
        collection: "experiences",
        nodeIds: ["row-block-2"],
        sourceRefs: expect.arrayContaining([
          expect.objectContaining({
            text: "Frontend Engineer | 2020 - 2023",
          }),
        ]),
      }),
    ]);
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

  it("scores V3 visual fidelity from page, table, cell, slot, and repeat-group preservation", () => {
    const source = {
      sourceType: "docx" as const,
      filename: "resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        {
          id: "name",
          pageId: "page-1",
          type: "heading" as const,
          text: "Jane Rivera",
          slotHint: "contact.name" as const,
        },
        {
          id: "email",
          pageId: "page-1",
          type: "paragraph" as const,
          text: "jane@example.com",
          slotHint: "contact.email" as const,
        },
        {
          id: "experience-heading",
          pageId: "page-1",
          type: "heading" as const,
          text: "EXPERIENCE",
        },
        {
          id: "table-1",
          pageId: "page-1",
          type: "table-row" as const,
          text: "Senior Engineer | 2024",
          cellMetadata: [
            { text: "Senior Engineer", widthPt: 280 },
            { text: "2024", widthPt: 120 },
          ],
        },
      ],
    };
    const template = createDocumentTemplateV3FromSourceIR(
      "template-v3",
      "Visual",
      source,
    );

    const fidelity = assessVisualTemplateFidelity(source, template);

    expect(fidelity.status).toMatch(/ready|review/);
    expect(fidelity.metrics).toMatchObject({
      tablesDetected: 1,
      sourceCells: 2,
      cellsPreserved: 2,
      slotsMapped: expect.any(Number),
    });
    expect(fidelity.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "tables_detected", passed: true }),
        expect.objectContaining({ id: "cell_geometry_detected", passed: true }),
      ]),
    );
  });

  it("marks V3 visual fidelity low when layout structure is not renderable", () => {
    const source = {
      sourceType: "pdf" as const,
      filename: "scan.pdf",
      pages: [],
      blocks: [
        {
          id: "raw",
          pageId: "page-1",
          type: "paragraph" as const,
          text: "Jane Rivera",
        },
      ],
      rawText: "Jane Rivera",
      diagnostics: [],
    };
    const template: DocumentTemplateV3 = {
      schemaVersion: 3,
      id: "template-v3",
      name: "Broken visual template",
      source: { filename: "scan.pdf", type: "pdf" },
      page: {
        size: "letter",
        widthPt: 0,
        heightPt: 0,
        margins: { top: "0pt", right: "0pt", bottom: "0pt", left: "0pt" },
      },
      tokens: {},
      regions: [],
      slots: [],
      repeatGroups: [],
      diagnostics: [],
    };

    const fidelity = assessVisualTemplateFidelity(source, template);

    expect(fidelity.status).toBe("low");
    expect(fidelity.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "preview_renderable", passed: false }),
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
