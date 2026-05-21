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

  it("uses hyperlink targets as semantic contact evidence when link labels are generic", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "linked-labels.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Avery Stone", { fontSizePt: 22, bold: true }),
        linkBlock("b2", "GitHub", "https://github.com/avery-stone", "#2563EB"),
        linkBlock(
          "b3",
          "LinkedIn",
          "https://linkedin.com/in/avery-stone",
          "#2563EB",
        ),
        styledBlock("b4", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b5", ["Engineer", "Signal Works", "2024 - Present"]),
      ],
    };

    const semantic = inferResumeSemanticIR(source);

    expect(semantic.contact).toMatchObject({
      name: "Avery Stone",
      github: "https://github.com/avery-stone",
      linkedin: "https://linkedin.com/in/avery-stone",
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
          style: {
            fontFamily: "Aptos, sans-serif",
            fontSizePt: 10.5,
            bold: true,
            color: "#222222",
          },
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
        linkBlock("b6", "Portfolio", "https://example.com", "#2563EB"),
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
    expect(tokens.typography.entryTitle).toMatchObject({
      fontFamily: "Aptos, sans-serif",
      fontSizePt: 10.5,
      fontWeight: "700",
    });
    expect(tokens.color.accent).toMatchObject({ value: "#0f766e" });
    expect(tokens.color.link).toMatchObject({
      value: "#2563EB",
      evidenceRefs: ["b6"],
    });
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
    expect(tokens.typography.sectionHeading?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: expect.objectContaining({
            fontFamily: "Aptos, sans-serif",
            fontSizePt: 11,
          }),
        }),
      ]),
    );
    expect(tokens.typography.entryTitle?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: expect.objectContaining({
            fontFamily: "Aptos, sans-serif",
          }),
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
    expect(tokens.layout.headerMode?.candidates).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: "split" })]),
    );
    expect(tokens.layout.dateAlignment?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "right-column" }),
        expect.objectContaining({ value: "below" }),
      ]),
    );
  });

  it("does not reuse name typography as body text for DOCX table resumes", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "table-style-clusters.docx",
      pages: [
        {
          id: "page-1",
          number: 1,
          widthPt: 595.3,
          heightPt: 841.9,
          margins: {
            top: "72pt",
            right: "72pt",
            bottom: "72pt",
            left: "72pt",
          },
        },
      ],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Alex Rivera", {
          fontSizePt: 28,
          styleId: "Title",
        }),
        styledBlock("b2", "alex@example.com | Toronto, ON", {}),
        styledBlock("b3", "EXPERIENCE", {
          fontSizePt: 16,
          color: "#2E74B5",
          styleId: "Heading1",
        }),
        {
          ...tableRow("b4", [
            "Senior Platform Engineer",
            "Northstar Labs",
            "Jan 2022 - Present",
            "Toronto, ON",
          ]),
          cellMetadata: [
            "Senior Platform Engineer",
            "Northstar Labs",
            "Jan 2022 - Present",
            "Toronto, ON",
          ].map((text, index) => ({
            text,
            alignment: index >= 2 ? "right" : "left",
            blocks: [
              {
                id: `b4-cell-${index + 1}`,
                type: "paragraph",
                text,
                style: { bold: false },
                runs: [{ text, style: { bold: false } }],
              },
            ],
          })),
        },
        styledBlock(
          "b5",
          "Built release tooling with typed React workflows",
          {},
        ),
      ],
    };

    const semantic = inferResumeSemanticIR(source);
    const tokens = inferImportedTemplateStyleTokens(source);
    const template = buildReusableResumeTemplateIR(semantic, tokens);
    const html = renderReusableResumeTemplateHTML(semantic, template);

    expect(tokens.typography.name?.fontSizePt).toBe(28);
    expect(tokens.typography.body?.evidenceRefs).not.toContain("b1");
    expect(tokens.typography.body?.fontSizePt).not.toBe(28);
    expect(tokens.typography.entryTitle?.fontSizePt).not.toBe(28);
    expect(tokens.color.body?.value).toBe("#111111");
    expect(tokens.color.accent?.value).toBe("#2E74B5");
    expect(html).toContain("body { margin: 0");
    expect(html).toContain("font-size: 10pt");
    expect(html).not.toContain(
      ".rt-entry-head strong { font-family: Arial, sans-serif; font-size: 28pt",
    );
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
    expect(template.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "HeaderBlock",
          components: expect.arrayContaining([
            expect.objectContaining({ kind: "ContactLine" }),
          ]),
        }),
        expect.objectContaining({
          kind: "Section",
          components: expect.arrayContaining([
            expect.objectContaining({
              kind: "EntryList",
              itemComponent: expect.objectContaining({
                components: expect.arrayContaining([
                  expect.objectContaining({ kind: "EntryHeader" }),
                  expect.objectContaining({ kind: "MetaLine" }),
                  expect.objectContaining({ kind: "BulletList" }),
                ]),
              }),
            }),
          ]),
        }),
      ]),
    );
    expect(template.sectionOrder).toEqual(["experience"]);
    expect(html).toContain("Taylor Kim");
    expect(html).toContain("Staff Engineer");
    expect(html).toContain("Orbit Labs");
    expect(html).toContain("Created a configurable resume renderer");
    expect(html).toContain("color: #7c3aed");
  });

  it("models skills as a reusable SkillList component", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "skills-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Jordan Patel", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "SKILLS", { fontSizePt: 11, bold: true }),
        styledBlock("b3", "TypeScript, React, PostgreSQL", {
          fontSizePt: 10,
        }),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
    );
    const skillsComponent = template.components.find(
      (component) => component.kind === "Section",
    );
    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate" },
        summary: "",
        experiences: [],
        projects: [],
        skills: ["Go", "Kubernetes", "AWS"],
        education: [],
      },
      template,
    );

    expect(skillsComponent).toMatchObject({
      kind: "Section",
      sectionType: "skills",
      components: expect.arrayContaining([
        expect.objectContaining({ kind: "SkillList" }),
      ]),
    });
    expect(html).toContain('class="rt-skills rt-skills-comma"');
    expect(html).toContain("<span>Go</span>");
    expect(html).toContain("<span>Kubernetes</span>");
    expect(html).toContain("<span>AWS</span>");
    expect(html).not.toContain('<section class="rt-entry">');
  });

  it("models education as a reusable EducationRow component", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "education-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Jordan Patel", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EDUCATION", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Source University", "BS CS", "2020"]),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
    );
    const educationComponent = template.components.find(
      (component) => component.kind === "Section",
    );
    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate" },
        summary: "",
        experiences: [],
        projects: [],
        skills: [],
        education: [
          {
            institution: "Runtime University",
            degree: "BS",
            field: "Computer Science",
            date: "2026",
          },
        ],
      },
      template,
    );

    expect(educationComponent).toMatchObject({
      kind: "Section",
      sectionType: "education",
      components: expect.arrayContaining([
        expect.objectContaining({ kind: "EducationRow" }),
      ]),
    });
    expect(html).toContain('class="rt-education-row"');
    expect(html).toContain("Runtime University");
    expect(html).toContain("BS — Computer Science");
    expect(html).toContain("<time>2026</time>");
    expect(html).not.toContain('<section class="rt-entry">');
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

  it("ignores DOCX vertical-merge continuation labels during semantic grouping", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "vertical-merge-experience.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Morgan Lee", { fontSizePt: 22, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Backend Engineer", "Acme", "2022 - Present"]),
        {
          ...tableRow("b4", ["Backend Engineer", "Built resilient APIs"]),
          cellMetadata: [
            {
              text: "Backend Engineer",
              verticalMerge: "continue",
              blocks: [
                {
                  id: "b4-cell-1",
                  type: "paragraph",
                  text: "Backend Engineer",
                  runs: [{ text: "Backend Engineer" }],
                },
              ],
            },
            {
              text: "Built resilient APIs",
              blocks: [
                {
                  id: "b4-cell-2",
                  type: "paragraph",
                  text: "Built resilient APIs",
                  runs: [{ text: "Built resilient APIs" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const semantic = inferResumeSemanticIR(source);
    const experience = semantic.sections.find(
      (section) => section.type === "experience",
    );

    expect(experience?.items).toHaveLength(1);
    expect(experience?.items[0]).toMatchObject({
      primary: "Backend Engineer",
      secondary: "Acme",
      dateRange: "2022 - Present",
      bullets: ["Built resilient APIs"],
    });
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

  it("renders saved layout tokens as reusable template classes", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "layout-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Role", "Company", "2024"]),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
    );
    template.tokens.layout.headerMode = {
      value: "stacked",
      confidence: 1,
      evidenceRefs: [],
    };
    template.tokens.layout.dateAlignment = {
      value: "below",
      confidence: 1,
      evidenceRefs: [],
    };
    template.tokens.layout.sectionTitlePlacement = {
      value: "left-rail",
      confidence: 1,
      evidenceRefs: [],
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
            highlights: [],
          },
        ],
        projects: [],
        skills: [],
        education: [],
      },
      template,
    );

    expect(html).toContain("rt-header-stacked");
    expect(html).toContain("rt-date-below");
    expect(html).toContain("rt-section-title-left-rail");
  });

  it("renders entry title typography through reusable template styles", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "entry-title-template.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        {
          ...tableRow("b3", ["Role", "Company", "2024"]),
          style: {
            fontFamily: "Georgia, serif",
            fontSizePt: 12,
            bold: true,
            color: "#334155",
          },
        },
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
            highlights: [],
          },
        ],
        projects: [],
        skills: [],
        education: [],
      },
      template,
    );

    expect(html).toContain(
      ".rt-entry-head strong { font-family: Georgia, serif; font-size: 12pt;",
    );
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

  it("infers paragraph achievement rendering from non-list source evidence", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "paragraph-achievements.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Analyst", "Source Co", "2024"]),
        tableRow("b4", ["Maintained narrative achievement text."]),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
      source,
    );

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

    expect(html).toContain("Maintained paragraph-style achievements.");
    expect(html).toContain("rt-entry-lines");
    expect(html).not.toContain("<ul>");
  });

  it("infers reusable list marker style from source evidence", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "numbered-achievements.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        styledBlock("b2", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b3", ["Analyst", "Source Co", "2024"]),
        bulletRow("b4", "First numbered achievement.", "decimal"),
        bulletRow("b5", "Second numbered achievement.", "decimal"),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
      source,
    );
    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: { name: "New Candidate", email: "new@example.com" },
        summary: "",
        experiences: [
          {
            title: "Operations Analyst",
            company: "Delta Systems",
            dates: "2026 - Present",
            highlights: ["Maintained numbered achievement styling."],
          },
        ],
        projects: [],
        skills: [],
        education: [],
      },
      template,
    );

    expect(
      template.components
        .find((component) => component.kind === "Section")
        ?.components.find((component) => component.kind === "EntryList")
        ?.itemComponent.bulletMarker,
    ).toBe("decimal");
    expect(html).toContain('class="rt-list-decimal"');
    expect(html).toContain("list-style-type: decimal");
  });

  it("renders reusable contact links with inferred link color", () => {
    const source: SourceDocumentIR = {
      sourceType: "docx",
      filename: "linked-contact.docx",
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      rawText: "",
      diagnostics: [],
      blocks: [
        styledBlock("b1", "Template Owner", { fontSizePt: 24, bold: true }),
        linkBlock(
          "b2",
          "github.com/template-owner",
          "https://github.com/template-owner",
          "#2563EB",
        ),
        styledBlock("b3", "EXPERIENCE", { fontSizePt: 11, bold: true }),
        tableRow("b4", ["Analyst", "Source Co", "2024"]),
        bulletRow("b5", "Built source-backed link rendering."),
      ],
    };
    const semantic = inferResumeSemanticIR(source);
    const template = buildReusableResumeTemplateIR(
      semantic,
      inferImportedTemplateStyleTokens(source),
      source,
    );
    const html = renderTailoredResumeWithReusableTemplate(
      {
        contact: {
          name: "New Candidate",
          email: "new@example.com",
          github: "github.com/new-candidate",
          linkedin: "linkedin.com/in/new-candidate",
        },
        summary: "",
        experiences: [
          {
            title: "Operations Analyst",
            company: "Delta Systems",
            dates: "2026 - Present",
            highlights: ["Rendered contact links."],
          },
        ],
        projects: [],
        skills: [],
        education: [],
      },
      template,
    );

    expect(template.tokens.color.link?.value).toBe("#2563EB");
    expect(html).toContain('href="mailto:new@example.com"');
    expect(html).toContain('href="https://github.com/new-candidate"');
    expect(html).toContain('href="https://linkedin.com/in/new-candidate"');
    expect(html).toContain(".rt-contact a { color: #2563EB;");
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
  listMarker: "disc" | "decimal" | "dash" | "none" = "disc",
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
            listMarker,
            runs: [{ text }],
          },
        ],
      },
    ],
  };
}

function linkBlock(
  id: string,
  text: string,
  href: string,
  color: string,
): SourceDocumentIR["blocks"][number] {
  return {
    id,
    pageId: "page-1",
    type: "link",
    text,
    href,
    style: { color },
    runs: [{ text, href, style: { color } }],
  };
}
