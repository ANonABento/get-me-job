import { describe, expect, it } from "vitest";
import {
  buildAiSourceCitedResumePrompt,
  validateAiSourceCitations,
} from "./ai-source-cited-parser";
import type { DocumentSourceMap } from "./types";

const sourceMap: DocumentSourceMap = {
  pages: [
    { page: 1, width: 612, height: 792, lineIds: ["p1-l001", "p1-l002"] },
  ],
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Ada Lovelace ada@example.com London, UK",
      tokenIds: [],
      tokens: [],
      bbox: { page: 1, x0: 0, y0: 0, x1: 300, y1: 14 },
    },
    {
      id: "p1-l002",
      page: 1,
      text: "Analytical Engines | Programmer | 1842 - Present",
      tokenIds: [],
      tokens: [],
      bbox: { page: 1, x0: 0, y0: 18, x1: 300, y1: 32 },
    },
  ],
  rawText:
    "Ada Lovelace ada@example.com London, UK\nAnalytical Engines | Programmer | 1842 - Present",
};

describe("ai source-cited parser helpers", () => {
  it("builds a prompt with annotated source IDs and citation requirements", () => {
    const prompt = buildAiSourceCitedResumePrompt(sourceMap);

    expect(prompt).toContain("[p1-l001] Ada Lovelace");
    expect(prompt).toContain("[p1-l002] Analytical Engines");
    expect(prompt).toContain("sourceSpanIds");
    expect(prompt).toContain("Use only the line IDs shown below");
  });

  it("validates exact source citations", () => {
    const result = validateAiSourceCitations(sourceMap, {
      contact: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        sourceSpanIds: ["p1-l001"],
      },
      experiences: [
        {
          company: "Analytical Engines",
          title: "Programmer",
          startDate: "1842",
          endDate: "Present",
          sourceSpanIds: ["p1-l002"],
        },
      ],
    });

    expect(result.fieldSourceQualities.contact).toBe("exact");
    expect(result.fieldSourceQualities["experiences.0"]).toBe("exact");
    expect(result.warnings).toEqual([]);
  });

  it("downgrades missing source IDs and reports unsupported values", () => {
    const result = validateAiSourceCitations(sourceMap, {
      contact: {
        name: "Ada Lovelace",
        email: "invented@example.com",
        sourceSpanIds: ["p1-l001", "missing-line"],
      },
      experiences: [
        {
          company: "Other Company",
          title: "Programmer",
          sourceSpanIds: ["p1-l002"],
        },
      ],
    });

    expect(result.fieldSourceQualities.contact).toBe("partial");
    expect(result.missingSourceIds).toEqual([
      { path: "contact", sourceSpanIds: ["missing-line"] },
    ]);
    expect(result.unsupportedValues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "contact.email",
          value: "invented@example.com",
        }),
        expect.objectContaining({
          path: "experiences.0.company",
          value: "Other Company",
        }),
      ]),
    );
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(["missing_source_id", "unsupported_value"]),
    );
  });
});
