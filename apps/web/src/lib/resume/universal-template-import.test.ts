import { describe, expect, it } from "vitest";
import {
  analyzeUniversalTemplateImport,
  inferResumeSemanticIR,
  semanticIRToTailoredResume,
} from "@/lib/resume/universal-template-import";
import type { SourceDocumentIR } from "@/lib/resume/template-migration";

describe("universal template import analysis", () => {
  it("detects generic sections, repeatable groups, and style signals", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "general-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Alex Rivera", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "alex@example.com", { fontSizePt: 9 }),
        styledBlock("b3", "EXPERIENCE", {
          fontSizePt: 11,
          bold: true,
          color: "#7253a3",
        }),
        tableRow("b4", ["Role", "Company", "2024 - Present"]),
        tableRow("b5", ["Built reusable document tooling"]),
        styledBlock("b6", "PROJECTS", {
          fontSizePt: 11,
          bold: true,
          color: "#7253a3",
        }),
        tableRow("b7", ["Project", "TypeScript | PDF"]),
        styledBlock("b8", "EDUCATION", {
          fontSizePt: 11,
          bold: true,
          color: "#7253a3",
        }),
        tableRow("b9", ["University", "BASc", "2026"]),
      ],
    };

    const analysis = analyzeUniversalTemplateImport(source);

    expect(analysis.readiness).not.toBe("low");
    expect(analysis.sections.map((section) => section.type)).toEqual([
      "experience",
      "projects",
      "education",
    ]);
    expect(analysis.repeatableSections).toEqual([
      "experience",
      "projects",
      "education",
    ]);
    expect(analysis.styleSignals.map((signal) => signal.role)).toEqual(
      expect.arrayContaining(["name", "sectionHeading", "body", "metadata"]),
    );
    expect(analysis.scores.semanticCoverage).toBeGreaterThanOrEqual(0.7);
    expect(analysis.scores.layoutResilience).toBeGreaterThanOrEqual(0.8);
  });

  it("keeps weak sources in review or low status with actionable warnings", () => {
    const source: SourceDocumentIR = {
      sourceType: "pdf",
      filename: "weak.pdf",
      pages: [{ id: "page-1", number: 1 }],
      rawText: "Only some text",
      diagnostics: ["PDF text extraction fell back to raw readable strings."],
      blocks: [
        {
          id: "b1",
          pageId: "page-1",
          type: "paragraph",
          text: "Only some text",
        },
      ],
    };

    const analysis = analyzeUniversalTemplateImport(source);

    expect(analysis.readiness).toBe("low");
    expect(analysis.warnings).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Low semantic coverage/i),
        expect.stringMatching(/Low style coverage/i),
      ]),
    );
  });

  it("infers a reusable semantic tree before mapping to TailoredResume", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "table-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Morgan Lee", { fontSizePt: 22, bold: true }),
        styledBlock("b2", "morgan@example.com | github.com/morgan", {
          fontSizePt: 9,
        }),
        styledBlock("b3", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b4", [
          "Product Designer",
          "Northstar Studio",
          "2023 - Present",
        ]),
        bulletRow("b5", "Built a reusable design system for hiring documents"),
        bulletRow(
          "b6",
          "Reduced template QA time with reviewable import reports",
        ),
        styledBlock("b7", "PROJECTS", { fontSizePt: 11, bold: true }),
        tableRow("b8", ["Portfolio System", "React | TypeScript"]),
        bulletRow("b9", "Created configurable project cards and bullet groups"),
      ],
    };

    const semantic = inferResumeSemanticIR(source);
    const resume = semanticIRToTailoredResume(semantic);

    expect(semantic.contact).toMatchObject({
      name: "Morgan Lee",
      email: "morgan@example.com",
      github: "github.com/morgan",
    });
    expect(semantic.sections).toHaveLength(2);
    expect(semantic.sections[0]).toMatchObject({
      type: "experience",
      items: [
        expect.objectContaining({
          primary: "Product Designer",
          secondary: "Northstar Studio",
          dateRange: "2023 - Present",
          bullets: [
            "Built a reusable design system for hiring documents",
            "Reduced template QA time with reviewable import reports",
          ],
        }),
      ],
    });
    expect(resume.experiences[0]).toMatchObject({
      title: "Product Designer",
      company: "Northstar Studio",
      dates: "2023 - Present",
      highlights: [
        "Built a reusable design system for hiring documents",
        "Reduced template QA time with reviewable import reports",
      ],
    });
    expect(resume.projects?.[0]).toMatchObject({
      name: "Portfolio System",
      description: "React - TypeScript",
      highlights: ["Created configurable project cards and bullet groups"],
    });
  });
});

function styledBlock(
  id: string,
  text: string,
  style: NonNullable<SourceDocumentIR["blocks"][number]["style"]>,
): SourceDocumentIR["blocks"][number] {
  return {
    id,
    pageId: "page-1",
    type: text === text.toUpperCase() ? "heading" : "paragraph",
    text,
    style,
  };
}

function tableRow(
  id: string,
  cells: string[],
): SourceDocumentIR["blocks"][number] {
  return {
    id,
    pageId: "page-1",
    type: "table-row",
    text: cells.join(" | "),
    cells,
    cellMetadata: cells.map((text, index) => ({
      text,
      alignment: index === cells.length - 1 ? "right" : "left",
      blocks: [
        {
          id: `${id}-cell-${index + 1}`,
          type: "paragraph",
          text,
          runs: [{ text }],
        },
      ],
    })),
  };
}

function bulletRow(
  id: string,
  text: string,
): SourceDocumentIR["blocks"][number] {
  return {
    id,
    pageId: "page-1",
    type: "table-row",
    text,
    cells: [text],
    cellMetadata: [
      {
        text,
        blocks: [
          {
            id: `${id}-cell-1`,
            type: "list-item",
            text,
            runs: [{ text }],
          },
        ],
      },
    ],
  };
}
