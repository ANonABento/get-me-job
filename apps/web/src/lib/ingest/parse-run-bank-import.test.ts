import { describe, expect, it } from "vitest";
import type { DocumentParseRun } from "@/lib/db/document-parse-runs";
import type { DocumentSourceMap, ParsedResumeV2Result } from "./types";
import {
  buildParseRunBankEntries,
  buildParseRunReviewEntries,
} from "./parse-run-bank-import";

const sourceMap: DocumentSourceMap = {
  pages: [
    { page: 1, width: 612, height: 792, lineIds: ["p1-l001", "p1-l002"] },
  ],
  rawText: "Engineer | Jan 2020 - Present\nAcme | Austin, TX",
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Engineer | Jan 2020 - Present",
      tokenIds: ["p1-l001-t001"],
      bbox: { page: 1, x0: 10, y0: 20, x1: 220, y1: 34 },
      tokens: [
        {
          id: "p1-l001-t001",
          page: 1,
          lineId: "p1-l001",
          text: "Engineer",
          bbox: { page: 1, x0: 10, y0: 20, x1: 80, y1: 34 },
        },
      ],
    },
    {
      id: "p1-l002",
      page: 1,
      text: "Acme | Austin, TX",
      tokenIds: ["p1-l002-t001"],
      bbox: { page: 1, x0: 10, y0: 40, x1: 160, y1: 54 },
      tokens: [
        {
          id: "p1-l002-t001",
          page: 1,
          lineId: "p1-l002",
          text: "Acme",
          bbox: { page: 1, x0: 10, y0: 40, x1: 52, y1: 54 },
        },
      ],
    },
  ],
};

const structured: ParsedResumeV2Result = {
  confidence: 0.75,
  rawText: sourceMap.rawText,
  sectionsDetected: ["experience"],
  warnings: [],
  profile: {
    contact: {
      name: "Ada Lovelace",
      confidence: 1,
      sourceSpanIds: [],
      sourceQuality: "missing",
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
        location: "Austin, TX",
        startDate: "Jan 2020",
        endDate: "Present",
        current: true,
        description: "Built parser",
        skills: [],
        sourceSpanIds: ["p1-l001", "p1-l002"],
        sourceQuality: "exact",
        highlights: [
          {
            text: "Built parser",
            sourceSpanIds: ["p1-l002"],
            sourceQuality: "exact",
          },
        ],
      },
    ],
  },
};

const parseRun: DocumentParseRun = {
  id: "run-1",
  documentId: "doc-1",
  artifactId: "artifact-1",
  userId: "user-1",
  mode: "basic",
  parserVersion: "resume-v2-basic-v1",
  status: "ready",
  confidence: 0.75,
  warnings: [],
  structured,
  createdAt: "2026-05-18T10:00:00.000Z",
};

describe("buildParseRunBankEntries", () => {
  it("builds bank entries with parser-v2 source refs and bboxes", () => {
    const entries = buildParseRunBankEntries({ parseRun, sourceMap });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: "exp-1",
      category: "experience",
      sourceDocumentId: "doc-1",
      sourceArtifactId: "artifact-1",
      sourceParseRunId: "run-1",
      sourceSpanIds: ["p1-l001", "p1-l002"],
      sourceQuality: "exact",
      sourcePage: 1,
      sourceBbox: [
        [1, 10, 20, 220, 34],
        [1, 10, 40, 160, 54],
      ],
      matchMethod: "parser-v2",
    });
    expect(entries[0].content.sourceRef).toEqual({
      documentId: "doc-1",
      artifactId: "artifact-1",
      parseRunId: "run-1",
      sourceSpanIds: ["p1-l001", "p1-l002"],
      sourceQuality: "exact",
    });
    expect(entries[1]).toMatchObject({
      id: "exp-1:highlight:0",
      category: "bullet",
      parentId: "exp-1",
      sourceSpanIds: ["p1-l002"],
    });
  });

  it("filters by accepted component ids and keeps children when a parent is accepted", () => {
    const entries = buildParseRunBankEntries({
      parseRun,
      sourceMap,
      acceptedComponentIds: ["exp-1"],
    });

    expect(entries.map((entry) => entry.id)).toEqual([
      "exp-1",
      "exp-1:highlight:0",
    ]);
  });

  it("returns no entries when the reviewed accepted component list is empty", () => {
    expect(
      buildParseRunBankEntries({
        parseRun,
        sourceMap,
        acceptedComponentIds: [],
      }),
    ).toEqual([]);
  });

  it("applies reviewed edits without overwriting source refs", () => {
    const entries = buildParseRunBankEntries({
      parseRun,
      sourceMap,
      acceptedComponentIds: ["exp-1"],
      edits: { "exp-1": { company: "Acme Corp" } },
    });

    expect(entries[0].content).toMatchObject({
      company: "Acme Corp",
      sourceRef: {
        parseRunId: "run-1",
      },
    });
  });

  it("returns no entries for unsupported structured payloads", () => {
    expect(
      buildParseRunBankEntries({
        parseRun: { ...parseRun, structured: { ok: true } },
        sourceMap,
      }),
    ).toEqual([]);
  });

  it("materializes parser-v2 entries for review without committing them", () => {
    const entries = buildParseRunReviewEntries({ parseRun, sourceMap });

    expect(entries[0]).toMatchObject({
      id: "exp-1",
      userId: "user-1",
      category: "experience",
      sourceDocumentId: "doc-1",
      sourceArtifactId: "artifact-1",
      sourceParseRunId: "run-1",
      sourceSpanIds: ["p1-l001", "p1-l002"],
      sourceQuality: "exact",
      matchMethod: "parser-v2",
      confidenceScore: 0.9,
      createdAt: "2026-05-18T10:00:00.000Z",
    });
  });
});
