import { describe, expect, it } from "vitest";
import type { DocumentSourceMap, ParsedResumeV2Result } from "./types";
import { createParserV2SourceRefs } from "./diagnostics";

const sourceMap: DocumentSourceMap = {
  pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001", "p1-l002"] }],
  rawText: "Jake Ryan\nEngineer at Acme",
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Jake Ryan",
      tokenIds: [],
      tokens: [],
      bbox: { page: 1, x0: 10, y0: 10, x1: 80, y1: 24 },
    },
    {
      id: "p1-l002",
      page: 1,
      text: "Engineer at Acme",
      tokenIds: [],
      tokens: [],
      bbox: { page: 1, x0: 10, y0: 32, x1: 140, y1: 46 },
    },
  ],
};

const parsed: ParsedResumeV2Result = {
  confidence: 0.9,
  rawText: sourceMap.rawText,
  sectionsDetected: ["experience"],
  warnings: [],
  profile: {
    contact: {
      name: "Jake Ryan",
      confidence: 1,
      sourceSpanIds: ["p1-l001"],
      sourceQuality: "exact",
    },
    rawText: sourceMap.rawText,
    education: [],
    skills: [],
    projects: [],
    experiences: [
      {
        id: "exp-1",
        company: "Acme",
        title: "Engineer",
        startDate: "",
        current: false,
        description: "Engineer at Acme",
        skills: [],
        sourceSpanIds: ["p1-l002"],
        sourceQuality: "exact",
        highlights: [
          {
            text: "Engineer at Acme",
            sourceSpanIds: ["p1-l002"],
            sourceQuality: "exact",
          },
        ],
      },
    ],
  },
};

describe("createParserV2SourceRefs", () => {
  it("returns source refs for roots and child bullets with cited source text", () => {
    const refs = createParserV2SourceRefs(sourceMap, parsed);

    expect(refs).toEqual([
      {
        componentId: "contact",
        category: "contact",
        sourceSpanIds: ["p1-l001"],
        sourceQuality: "exact",
        sourceText: ["Jake Ryan"],
      },
      {
        componentId: "exp-1",
        category: "experience",
        sourceSpanIds: ["p1-l002"],
        sourceQuality: "exact",
        sourceText: ["Engineer at Acme"],
      },
      {
        componentId: "exp-1:highlight:0",
        category: "bullet",
        parentId: "exp-1",
        sourceSpanIds: ["p1-l002"],
        sourceQuality: "exact",
        sourceText: ["Engineer at Acme"],
      },
    ]);
  });
});
