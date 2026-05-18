import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./legacy", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: vi.fn(() => "parse-run-generated"),
}));

import db from "./legacy";
import {
  getDocumentParseRun,
  listDocumentParseRuns,
  saveDocumentParseRun,
} from "./document-parse-runs";
import type { ParsedResumeV2Result } from "@/lib/ingest/types";

const structured: ParsedResumeV2Result = {
  profile: {
    contact: {
      name: "Jake Ryan",
      confidence: 1,
      sourceSpanIds: ["p1-l001"],
      sourceQuality: "exact",
    },
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    rawText: "Jake Ryan",
  },
  sectionsDetected: [],
  confidence: 0.25,
  rawText: "Jake Ryan",
  warnings: ["No education detected"],
};

function parseRunRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "run-1",
    document_id: "doc-1",
    artifact_id: "artifact-1",
    user_id: "user-1",
    mode: "basic",
    parser_version: "resume-v2-basic-v1",
    status: "ready",
    failure_reason: null,
    confidence: 0.25,
    warnings_json: JSON.stringify([
      {
        code: "low_confidence",
        message: "Low confidence",
        severity: "warning",
      },
    ]),
    structured_json: JSON.stringify(structured),
    created_at: "2026-05-18T10:00:00.000Z",
    ...overrides,
  };
}

describe("document parse run db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a parser run", () => {
    const run = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run });

    const parseRun = saveDocumentParseRun({
      documentId: "doc-1",
      artifactId: "artifact-1",
      userId: "user-1",
      confidence: structured.confidence,
      warnings: [
        {
          code: "low_confidence",
          message: "Low confidence",
          severity: "warning",
        },
      ],
      structured,
      createdAt: "2026-05-18T10:00:00.000Z",
    });

    expect(parseRun).toMatchObject({
      id: "parse-run-generated",
      documentId: "doc-1",
      artifactId: "artifact-1",
      userId: "user-1",
      mode: "basic",
      parserVersion: "resume-v2-basic-v1",
      status: "ready",
      confidence: 0.25,
      structured,
    });
    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO document_parse_runs"),
    );
    expect(run).toHaveBeenLastCalledWith(
      "parse-run-generated",
      "doc-1",
      "artifact-1",
      "user-1",
      "basic",
      "resume-v2-basic-v1",
      "ready",
      null,
      0.25,
      JSON.stringify([
        {
          code: "low_confidence",
          message: "Low confidence",
          severity: "warning",
        },
      ]),
      JSON.stringify(structured),
      "2026-05-18T10:00:00.000Z",
    );
  });

  it("loads a parse run scoped to document and user", () => {
    const get = vi.fn().mockReturnValue(parseRunRow());
    (db.prepare as Mock).mockReturnValue({ run: vi.fn(), get });

    expect(getDocumentParseRun("run-1", "doc-1", "user-1")).toMatchObject({
      id: "run-1",
      documentId: "doc-1",
      artifactId: "artifact-1",
      structured,
    });
    expect(get).toHaveBeenLastCalledWith("run-1", "doc-1", "user-1");
  });

  it("lists parse runs newest first", () => {
    const all = vi
      .fn()
      .mockReturnValue([
        parseRunRow({ id: "run-2" }),
        parseRunRow({ id: "run-1" }),
      ]);
    (db.prepare as Mock).mockReturnValue({ run: vi.fn(), all });

    expect(
      listDocumentParseRuns("doc-1", "user-1").map((row) => row.id),
    ).toEqual(["run-2", "run-1"]);
    expect(all).toHaveBeenLastCalledWith("doc-1", "user-1");
  });
});
