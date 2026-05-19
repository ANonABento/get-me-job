import { describe, expect, it } from "vitest";
import {
  generateResumeHTMLV2,
  generateResumeLatexV2,
} from "@/lib/resume/template-v2-renderer";
import type { TailoredResume } from "@/lib/resume/generator";
import type { DocumentTemplateV2 } from "@/lib/resume/template-v2";

describe("DocumentTemplateV2 renderer", () => {
  it("renders generic section blocks through slot children", () => {
    const html = generateResumeHTMLV2(sampleResume, {
      ...sampleTemplate,
      regions: [
        sampleTemplate.regions[0],
        {
          id: "region-main",
          role: "main",
          flow: "block",
          blocks: [
            {
              id: "custom-profile-section",
              type: "section",
              text: "Profile",
              children: ["slot-summary"],
            },
          ],
        },
      ],
    });

    expect(html).toContain("Profile");
    expect(html).toContain("Builds reusable document templates.");
  });

  it("uses typography fallbacks for sparse V2 templates", () => {
    const html = generateResumeHTMLV2(sampleResume, {
      ...sampleTemplate,
      tokens: {},
    });

    expect(html).toContain("Jane Rivera");
    expect(html).toContain("Inter, Arial, sans-serif");
  });

  it("honors per-section spacing, divider, and bullet formatting", () => {
    const html = generateResumeHTMLV2(
      {
        ...sampleResume,
        experiences: [
          {
            title: "Engineer",
            company: "Acme",
            dates: "2024 - Present",
            highlights: ["Built migration templates."],
          },
        ],
      },
      {
        ...sampleTemplate,
        regions: [
          sampleTemplate.regions[0],
          {
            id: "region-main",
            role: "main",
            flow: "block",
            blocks: [
              {
                id: "section-experience",
                type: "section",
                text: "Experience",
                repeat: "experiences",
                children: [],
                style: {
                  marginBottom: "24px",
                  headingMarginBottom: "10px",
                  divider: "none",
                  bulletStyle: "dash",
                },
              },
            ],
          },
        ],
      },
    );

    expect(html).toContain("divider-none bullet-dash");
    expect(html).toContain("margin-bottom: 24px");
    expect(html).toContain("margin-bottom: 10px");
    expect(html).toContain(".section.bullet-dash li::before");
  });

  it("renders skills grids with source table column widths", () => {
    const html = generateResumeHTMLV2(
      {
        ...sampleResume,
        skills: ["TypeScript", "PDF import", "LaTeX"],
      },
      {
        ...sampleTemplate,
        regions: [
          sampleTemplate.regions[0],
          {
            id: "region-main",
            role: "main",
            flow: "block",
            blocks: [
              {
                id: "section-skills",
                type: "section",
                text: "Skills",
                children: ["slot-skills"],
                columns: 3,
                columnWidthsPt: [120, 180, 90],
              },
            ],
          },
        ],
      },
    );

    expect(html).toContain("grid-template-columns: 120pt 180pt 90pt");
  });

  it("exports a V2-aware LaTeX document", () => {
    const latex = generateResumeLatexV2(
      {
        ...sampleResume,
        experiences: [
          {
            title: "Engineer",
            company: "Acme",
            dates: "2024 - Present",
            highlights: ["Built migrated exports."],
          },
        ],
      },
      sampleTemplate,
    );

    expect(latex).toContain("\\documentclass[letterpaper,10pt]{article}");
    expect(latex).toContain("\\resumesection{Experience}");
    expect(latex).toContain("Jane Rivera");
    expect(latex).toContain("\\item Built migrated exports.");
  });
});

const sampleResume: TailoredResume = {
  contact: { name: "Jane Rivera", email: "jane@example.com" },
  summary: "Builds reusable document templates.",
  experiences: [],
  skills: [],
  education: [],
};

const sampleTemplate: DocumentTemplateV2 = {
  schemaVersion: 2,
  id: "template-1",
  name: "Template",
  page: {
    size: "letter",
    margins: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  },
  tokens: {
    name: { fontFamily: "Inter", fontSize: "20pt", lineHeight: "1.1" },
    heading: { fontFamily: "Inter", fontSize: "11pt", lineHeight: "1.2" },
    body: { fontFamily: "Inter", fontSize: "10pt", lineHeight: "1.4" },
    "body-strong": {
      fontFamily: "Inter",
      fontSize: "10pt",
      lineHeight: "1.4",
      fontWeight: "700",
    },
    meta: { fontFamily: "Inter", fontSize: "9pt", lineHeight: "1.4" },
  },
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
      blocks: [],
    },
  ],
  slots: [
    {
      id: "slot-summary",
      path: "summary",
      role: "text",
      label: "Summary",
      sourceBlockIds: [],
    },
  ],
  diagnostics: [],
};
