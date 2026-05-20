import { describe, expect, it } from "vitest";
import {
  analyzeUniversalTemplateImport,
  inferImportedTemplateStyleTokens,
  inferResumeSemanticIR,
  semanticIRToTailoredResume,
} from "@/lib/resume/universal-template-import";
import {
  buildReusableResumeTemplateIR,
  renderTailoredResumeWithReusableTemplate,
  renderReusableResumeTemplateHTML,
  type ReusableResumeTemplateIR,
} from "@/lib/resume/universal-template-renderer";
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

  it("extracts reusable style tokens without depending on one resume design", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "colored-table-resume.docx",
      pages: [
        {
          id: "page-1",
          number: 1,
          widthPt: 612,
          heightPt: 792,
          margins: {
            top: "36pt",
            right: "42pt",
            bottom: "36pt",
            left: "42pt",
          },
        },
      ],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Riley Chen", {
          fontFamily: "Aptos Display, sans-serif",
          fontSizePt: 24,
          bold: true,
          color: "#222222",
        }),
        styledBlock("b2", "riley@example.com", {
          fontSizePt: 9,
          color: "#444444",
          alignment: "right",
        }),
        styledBlock("b3", "EXPERIENCE", {
          fontFamily: "Aptos, sans-serif",
          fontSizePt: 11,
          bold: true,
          color: "#0f766e",
        }),
        {
          ...tableRow("b4", ["Designer", "Studio", "2024 - Present"]),
          rowMetadata: {
            borders: {
              bottom: {
                widthPt: 0.75,
                color: "#0f766e",
                style: "solid",
              },
            },
          },
        },
        styledBlock("b5", "Built systems", {
          fontFamily: "Aptos, sans-serif",
          fontSizePt: 10,
          color: "#222222",
          lineHeight: "1.2",
        }),
      ],
    };

    const tokens = inferImportedTemplateStyleTokens(source);

    expect(tokens.page).toMatchObject({
      size: "letter",
      widthPt: 612,
      heightPt: 792,
      confidence: 0.9,
    });
    expect(tokens.typography.name).toMatchObject({
      fontFamily: "Aptos Display, sans-serif",
      fontSizePt: 24,
      fontWeight: "700",
    });
    expect(tokens.typography.sectionHeading).toMatchObject({
      color: "#0f766e",
      textTransform: "uppercase",
    });
    expect(tokens.color.accent).toMatchObject({ value: "#0f766e" });
    expect(tokens.color.accent?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "#0f766e" }),
        expect.objectContaining({ value: "#222222" }),
      ]),
    );
    expect(tokens.typography.body?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: expect.objectContaining({ fontFamily: "Aptos, sans-serif" }),
        }),
      ]),
    );
    expect(tokens.rules.sectionDivider).toMatchObject({
      widthPt: 0.75,
      color: "#0f766e",
      style: "solid",
    });
    expect(tokens.rules.sectionDivider?.candidates).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: 0.75 })]),
    );
    expect(tokens.layout.dateAlignment?.value).toBe("right-column");
  });

  it("renders semantic resume data through a reusable component template", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "component-resume.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Taylor Kim", {
          fontSizePt: 24,
          bold: true,
          color: "#111111",
        }),
        styledBlock("b2", "taylor@example.com", { fontSizePt: 9 }),
        styledBlock("b3", "EXPERIENCE", {
          fontSizePt: 11,
          bold: true,
          color: "#7c3aed",
        }),
        tableRow("b4", ["Staff Engineer", "Orbit Labs", "2022 - Present"]),
        bulletRow("b5", "Created a configurable resume renderer"),
        bulletRow("b6", "Added semantic template review artifacts"),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const tokens = inferImportedTemplateStyleTokens(source);
    const template = buildReusableResumeTemplateIR(semantic, tokens);
    const html = renderReusableResumeTemplateHTML(semantic, template);

    expect(template.schemaVersion).toBe(4);
    expect(template.components.map((component) => component.kind)).toEqual([
      "HeaderBlock",
      "Section",
    ]);
    expect(template.sectionOrder).toEqual(["experience"]);
    expect(html).toContain("Taylor Kim");
    expect(html).toContain("Staff Engineer");
    expect(html).toContain("Orbit Labs");
    expect(html).toContain("Created a configurable resume renderer");
    expect(html).toContain("color: #7c3aed");
  });

  it("infers reusable LaTeX style defaults when explicit run styles are absent", () => {
    const source: SourceDocumentIR = {
      sourceType: "tex",
      filename: "plain-latex-resume.tex",
      pages: [
        {
          id: "page-1",
          number: 1,
          widthPt: 612,
          heightPt: 792,
          margins: {
            top: "46.8pt",
            right: "46.8pt",
            bottom: "46.8pt",
            left: "46.8pt",
          },
        },
      ],
      rawText: "",
      diagnostics: ["latex_style_hints_inferred"],
      blocks: [
        { id: "b1", pageId: "page-1", type: "paragraph", text: "Maya Chen" },
        {
          id: "b2",
          pageId: "page-1",
          type: "paragraph",
          text: "maya@example.com | github.com/maya",
        },
        { id: "b3", pageId: "page-1", type: "heading", text: "Experience" },
        {
          id: "b4",
          pageId: "page-1",
          type: "paragraph",
          text: "Engineer | Papertrail Labs | 2023 -- Present",
        },
        {
          id: "b5",
          pageId: "page-1",
          type: "list-item",
          text: "Built migration tooling",
        },
        { id: "b6", pageId: "page-1", type: "heading", text: "Education" },
      ],
    };

    const analysis = analyzeUniversalTemplateImport(source);
    const tokens = inferImportedTemplateStyleTokens(source);

    expect(analysis.scores.styleCoverage).toBeGreaterThanOrEqual(0.8);
    expect(analysis.readiness).not.toBe("low");
    expect(tokens.typography.body).toMatchObject({
      fontFamily: expect.stringContaining("Computer Modern"),
      fontSizePt: 10,
      color: "#111111",
    });
    expect(tokens.typography.sectionHeading).toMatchObject({
      fontWeight: "700",
      color: "#111111",
    });
    expect(tokens.color.accent).toMatchObject({ value: "#111111" });
    expect(tokens.warnings).not.toContain(
      "No reusable body typography token detected.",
    );
    expect(tokens.warnings).not.toContain(
      "No reusable section heading typography token detected.",
    );
  });

  it("recovers implicit skills lists that extraction nests under another section", () => {
    const source: SourceDocumentIR = {
      sourceType: "pdf",
      filename: "implicit-skills.pdf",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Jordan Patel", { fontSizePt: 22, bold: true }),
        styledBlock("b2", "jordan@example.com", { fontSizePt: 9 }),
        styledBlock("b3", "EDUCATION", { fontSizePt: 11, bold: true }),
        tableRow("b4", ["Design University", "BFA Interaction Design", "2018"]),
        styledBlock("b5", "React, TypeScript, Design Systems, Performance", {
          fontSizePt: 9,
        }),
        styledBlock("b6", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b7", ["Product Designer", "Studio", "2022 - Present"]),
        bulletRow("b8", "Designed customer-facing workflow improvements"),
      ],
    };

    const semantic = inferResumeSemanticIR(source);
    const education = semantic.sections.find(
      (section) => section.type === "education",
    );
    const skills = semantic.sections.find(
      (section) => section.type === "skills",
    );

    expect(skills?.items.map((item) => item.primary)).toEqual([
      "React",
      "TypeScript",
      "Design Systems",
      "Performance",
    ]);
    expect(
      education?.items.flatMap((item) => item.bullets).join(" "),
    ).not.toMatch(/React|TypeScript|Design Systems|Performance/);
  });

  it("renders arbitrary tailored resume content through a saved reusable template", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "saved-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Role", "Company", "2024"]),
        bulletRow("b4", "Source-only bullet"),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
    );
    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate", email: "new@example.com" },
        summary: "",
        experiences: [
          {
            title: "Platform Engineer",
            company: "Delta Systems",
            dates: "2026 - Present",
            highlights: ["Replaced template content safely"],
          },
        ],
        projects: [
          {
            name: "Universal Importer",
            description: "TypeScript",
            highlights: ["Rendered project content through components"],
          },
        ],
        skills: ["TypeScript", "PDF"],
        education: [],
      },
      template,
    );

    expect(html).toContain("New Candidate");
    expect(html).toContain("Platform Engineer");
    expect(html).toContain("Replaced template content safely");
    expect(html).toContain("Universal Importer");
    expect(html).not.toContain("Template Owner");
    expect(html).not.toContain("Source-only bullet");
  });

  it("honors reusable section order while appending newly added sections", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "reordered-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Engineer", "Source Co", "2024"]),
        bulletRow("b4", "Source-only bullet"),
        styledBlock("b5", "EDUCATION", { fontSizePt: 11, bold: true }),
        tableRow("b6", ["Template University", "BS CS", "2020"]),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = {
      ...buildReusableResumeTemplateIR(
        semantic,
        inferImportedTemplateStyleTokens(source),
      ),
      sectionOrder: [
        "education",
        "experience",
      ] as ReusableResumeTemplateIR["sectionOrder"],
    };

    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate", email: "new@example.com" },
        summary: "",
        experiences: [
          {
            title: "Platform Engineer",
            company: "Delta Systems",
            dates: "2026 - Present",
            highlights: ["Replaced template content safely"],
          },
        ],
        projects: [
          {
            name: "Universal Importer",
            description: "TypeScript",
            highlights: ["Appended new section safely"],
          },
        ],
        skills: [],
        education: [
          {
            institution: "Runtime University",
            degree: "BS",
            field: "Computer Science",
            date: "2022",
          },
        ],
      },
      template,
    );

    const educationIndex = html.indexOf("EDUCATION");
    const experienceIndex = html.indexOf("EXPERIENCE");
    const projectsIndex = html.indexOf("Projects");

    expect(educationIndex).toBeGreaterThan(-1);
    expect(experienceIndex).toBeGreaterThan(educationIndex);
    expect(projectsIndex).toBeGreaterThan(experienceIndex);
    expect(html).toContain("Runtime University");
    expect(html).toContain("Platform Engineer");
    expect(html).toContain("Universal Importer");
    expect(html).not.toContain("Template Owner");
    expect(html).not.toContain("Source-only bullet");
  });

  it("renders entries according to reusable entry component settings", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "paragraph-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Analyst", "Source Co", "2024"]),
        bulletRow("b4", "Source-only bullet"),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const baseTemplate = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
    );
    const template: ReusableResumeTemplateIR = {
      ...baseTemplate,
      components: baseTemplate.components.map((component) => {
        if (component.kind !== "Section") return component;
        return {
          ...component,
          components: component.components.map((child) =>
            child.kind === "EntryList"
              ? {
                  ...child,
                  itemComponent: {
                    ...child.itemComponent,
                    header: {
                      primary: true,
                      secondary: false,
                      meta: false,
                      dateRange: false,
                    },
                    bulletList: false,
                  },
                }
              : child,
          ),
        };
      }),
    };

    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate", email: "new@example.com" },
        summary: "",
        experiences: [
          {
            title: "Operations Analyst",
            company: "Delta Systems",
            dates: "2026 - Present",
            highlights: ["Maintained paragraph-style achievements."],
          },
        ],
        projects: [],
        skills: [],
        education: [],
      },
      template,
    );

    expect(html).toContain("Operations Analyst");
    expect(html).toContain("Maintained paragraph-style achievements.");
    expect(html).toContain("rt-entry-lines");
    expect(html).not.toContain("<ul>");
    expect(html).not.toContain("Delta Systems");
    expect(html).not.toContain("2026 - Present");
    expect(html).not.toContain("Source-only bullet");
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
