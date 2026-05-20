import { describe, expect, it } from "vitest";

import {
  scoreCase,
  type SuiteCase,
} from "../../scripts/run-visual-template-dogfood-suite";

describe("visual template dogfood suite scorecards", () => {
  it("passes reusable-template gates for a generic fixture match", () => {
    const scorecard = scoreCase(genericSummary(), {
      name: "generic-engineering-resume",
      source: "resume.pdf",
      fixtureClass: "one-page engineering resume",
      expectedSections: ["experience", "education", "skills"],
      expectedStyleTraits: ["single-page", "section-headings", "bullets"],
    });

    expect(scorecard.pass).toBe(true);
    expect(scorecard.gateFailures).toEqual([]);
    expect(scorecard.scores).toMatchObject({
      sectionCoverage: 1,
      styleTraitCoverage: 1,
    });
  });

  it("fails with stage-bucketed gates for weak source and style evidence", () => {
    const item: SuiteCase = {
      name: "generic-table-docx",
      source: "resume.docx",
      fixtureClass: "table-heavy DOCX",
      expectedSections: ["experience", "education", "skills"],
      expectedStyleTraits: ["tables", "cell-borders", "bullets"],
    };
    const summary = {
      ...genericSummary(),
      sourceType: "docx",
      universalAnalysis: {
        scores: {
          semanticCoverage: 0.5,
          styleCoverage: 0.3,
        },
        sourceSignals: [],
        styleSignals: [],
      },
      reports: [
        {
          mode: "source",
          sourcePageCount: 1,
          estimatedPages: 1,
          sourceLineCoverage: 0.28,
          overflowElements: 0,
          repeatedLineCount: 0,
        },
        {
          mode: "stress",
          sourcePageCount: 1,
          estimatedPages: 2,
          sourceLineCoverage: 0.28,
          overflowElements: 2,
          repeatedLineCount: 3,
        },
      ],
    };

    const scorecard = scoreCase(summary, item);

    expect(scorecard.pass).toBe(false);
    expect(scorecard.gateFailures).toEqual(
      expect.arrayContaining([
        "semantic:coverage",
        "style:coverage",
        "style:expected-traits",
        "render:stress-resilience",
        "render:page-overflow",
        "extraction:source-coverage",
      ]),
    );
    expect(scorecard.failureAreas).toEqual(
      expect.arrayContaining(["semantic", "style", "render", "extraction"]),
    );
    expect(scorecard.notes).toEqual(
      expect.arrayContaining([
        "Rendered text covers too little of the normalized source evidence.",
        "Expected visual-family traits were not detected.",
        "Stress render expands beyond the source page count.",
      ]),
    );
  });
});

function genericSummary() {
  return {
    sourceType: "pdf",
    universalAnalysis: {
      scores: {
        semanticCoverage: 0.9,
        styleCoverage: 0.8,
      },
      sourceSignals: [
        {
          id: "structure-evidence",
          detail: "4 table rows and 12 cells are available.",
        },
      ],
      styleSignals: [{ role: "sectionHeading" }],
    },
    semanticResume: {
      contact: { linkedin: "linkedin.com/in/example" },
      sections: [
        {
          type: "experience",
          items: [{ dateRange: "2024 - Present", bullets: ["Built tools."] }],
        },
        { type: "education", items: [{ dateRange: "2020 - 2024" }] },
        { type: "skills", items: [{ primary: "TypeScript" }] },
      ],
    },
    styleTokens: {
      color: { accent: { value: "#2563eb" } },
      spacing: { sectionGapPt: { value: 6 } },
      layout: { columns: { value: 1 } },
    },
    reusableTemplate: {
      sectionOrder: ["experience", "education", "skills"],
      components: [{ kind: "HeaderBlock" }, { kind: "Section" }],
    },
    reports: [
      {
        mode: "source",
        sourcePageCount: 1,
        estimatedPages: 1,
        sourceLineCoverage: 0.75,
        overflowElements: 0,
        repeatedLineCount: 0,
      },
      {
        mode: "stress",
        sourcePageCount: 1,
        estimatedPages: 1,
        sourceLineCoverage: 0.72,
        overflowElements: 0,
        repeatedLineCount: 0,
      },
    ],
  };
}
