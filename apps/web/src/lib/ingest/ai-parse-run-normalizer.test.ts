import { describe, expect, it } from "vitest";
import type { DocumentSourceMap } from "./types";
import { normalizeAiSourceCitedParseResult } from "./ai-parse-run-normalizer";

const sourceMap: DocumentSourceMap = {
  pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001", "p1-l002"] }],
  rawText:
    "Jake Ryan | jake@example.com\nEngineer | Acme | Austin, TX | Jan 2020 - Present",
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Jake Ryan | jake@example.com",
      tokenIds: ["p1-l001-t001"],
      bbox: { page: 1, x0: 10, y0: 20, x1: 240, y1: 34 },
      tokens: [
        {
          id: "p1-l001-t001",
          page: 1,
          lineId: "p1-l001",
          text: "Jake",
          bbox: { page: 1, x0: 10, y0: 20, x1: 44, y1: 34 },
        },
      ],
    },
    {
      id: "p1-l002",
      page: 1,
      text: "Engineer | Acme | Austin, TX | Jan 2020 - Present",
      tokenIds: ["p1-l002-t001"],
      bbox: { page: 1, x0: 10, y0: 42, x1: 360, y1: 56 },
      tokens: [
        {
          id: "p1-l002-t001",
          page: 1,
          lineId: "p1-l002",
          text: "Engineer",
          bbox: { page: 1, x0: 10, y0: 42, x1: 80, y1: 56 },
        },
      ],
    },
  ],
};

describe("normalizeAiSourceCitedParseResult", () => {
  it("converts cited AI JSON into parser-v2 structured output", () => {
    const structured = normalizeAiSourceCitedParseResult(
      {
        raw: {
          contact: {
            name: "Jake Ryan",
            email: "jake@example.com",
            sourceSpanIds: ["p1-l001"],
          },
          experiences: [
            {
              company: "Acme",
              title: "Engineer",
              location: "Austin, TX",
              startDate: "Jan 2020",
              endDate: "Present",
              current: true,
              description: "Engineer at Acme",
              highlights: [
                {
                  text: "Engineer at Acme",
                  sourceSpanIds: ["p1-l002"],
                },
              ],
              skills: ["TypeScript"],
              sourceSpanIds: ["p1-l002"],
            },
          ],
          skills: [
            {
              name: "TypeScript",
              category: "technical",
              sourceSpanIds: ["p1-l002"],
            },
          ],
        },
        validation: {
          missingSourceIds: [],
          unsupportedValues: [],
          fieldSourceQualities: {
            contact: "exact",
            "experiences.0": "exact",
            "experiences.0.highlights.0": "exact",
            "skills.0": "exact",
          },
          warnings: [],
        },
      },
      sourceMap,
    );

    expect(structured.profile.contact).toMatchObject({
      name: "Jake Ryan",
      email: "jake@example.com",
      sourceSpanIds: ["p1-l001"],
      sourceQuality: "exact",
    });
    expect(structured.profile.experiences[0]).toMatchObject({
      company: "Acme",
      title: "Engineer",
      sourceSpanIds: ["p1-l002"],
      sourceQuality: "exact",
      highlights: [
        {
          text: "Engineer at Acme",
          sourceSpanIds: ["p1-l002"],
          sourceQuality: "exact",
        },
      ],
    });
    expect(structured.profile.skills[0]).toMatchObject({
      name: "TypeScript",
      category: "technical",
      sourceQuality: "exact",
    });
    expect(structured.ai.raw).toMatchObject({
      contact: { name: "Jake Ryan" },
    });
  });

  it("downgrades missing source IDs while keeping the raw AI diagnostics", () => {
    const structured = normalizeAiSourceCitedParseResult(
      {
        raw: {
          projects: [
            {
              name: "Parser",
              description: "Source cited parser",
              sourceSpanIds: ["missing-line"],
            },
          ],
        },
        validation: {
          missingSourceIds: [
            { path: "projects.0", sourceSpanIds: ["missing-line"] },
          ],
          unsupportedValues: [],
          fieldSourceQualities: {
            "projects.0": "missing",
          },
          warnings: [
            {
              code: "missing_source_id",
              path: "projects.0",
              message: "Missing source IDs: missing-line",
              sourceSpanIds: ["missing-line"],
            },
          ],
        },
      },
      sourceMap,
    );

    expect(structured.confidence).toBe(0.5);
    expect(structured.profile.projects[0]).toMatchObject({
      name: "Parser",
      sourceSpanIds: ["missing-line"],
      sourceQuality: "missing",
    });
    expect(structured.warnings).toEqual([
      "projects.0: Missing source IDs: missing-line",
    ]);
    expect(structured.ai.validation.missingSourceIds).toEqual([
      { path: "projects.0", sourceSpanIds: ["missing-line"] },
    ]);
  });
});
