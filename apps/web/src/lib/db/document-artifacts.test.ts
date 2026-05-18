import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./legacy", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: vi.fn(() => "artifact-generated"),
}));

import db from "./legacy";
import {
  getLatestDocumentArtifact,
  listDocumentArtifacts,
  saveDocumentArtifact,
} from "./document-artifacts";
import type { DocumentSourceMap } from "@/lib/ingest/types";

const sourceMap: DocumentSourceMap = {
  pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001"] }],
  rawText: "Jake Ryan",
  lines: [
    {
      id: "p1-l001",
      page: 1,
      text: "Jake Ryan",
      tokenIds: ["p1-l001-t001"],
      bbox: { page: 1, x0: 10, y0: 20, x1: 100, y1: 32 },
      tokens: [
        {
          id: "p1-l001-t001",
          page: 1,
          lineId: "p1-l001",
          text: "Jake Ryan",
          bbox: { page: 1, x0: 10, y0: 20, x1: 100, y1: 32 },
        },
      ],
    },
  ],
};

function artifactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "artifact-1",
    document_id: "doc-1",
    user_id: "user-1",
    extractor_version: "pdf-source-map-v1",
    status: "ready",
    failure_reason: null,
    raw_text: sourceMap.rawText,
    normalized_text: "Jake Ryan",
    pages_json: JSON.stringify([
      { ...sourceMap.pages[0], lines: sourceMap.lines },
    ]),
    links_json: JSON.stringify([{ url: "https://example.com", page: 1 }]),
    ocr_used: 0,
    created_at: "2026-05-18T10:00:00.000Z",
    ...overrides,
  };
}

describe("document artifact db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a source map artifact with pages and lines", () => {
    const run = vi.fn();
    (db.prepare as Mock).mockReturnValue({ run });

    const artifact = saveDocumentArtifact({
      documentId: "doc-1",
      userId: "user-1",
      sourceMap,
      links: [{ url: "https://example.com", page: 1 }],
      createdAt: "2026-05-18T10:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      id: "artifact-generated",
      documentId: "doc-1",
      userId: "user-1",
      status: "ready",
      rawText: "Jake Ryan",
      normalizedText: "Jake Ryan",
      sourceMap,
    });
    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO document_artifacts"),
    );
    expect(run).toHaveBeenLastCalledWith(
      "artifact-generated",
      "doc-1",
      "user-1",
      "pdf-source-map-v1",
      "ready",
      null,
      "Jake Ryan",
      "Jake Ryan",
      JSON.stringify([{ ...sourceMap.pages[0], lines: sourceMap.lines }]),
      JSON.stringify([{ url: "https://example.com", page: 1 }]),
      0,
      "2026-05-18T10:00:00.000Z",
    );
  });

  it("loads the latest artifact and reconstructs the source map", () => {
    const get = vi.fn().mockReturnValue(artifactRow());
    (db.prepare as Mock).mockReturnValue({ run: vi.fn(), get });

    expect(getLatestDocumentArtifact("doc-1", "user-1")).toMatchObject({
      id: "artifact-1",
      documentId: "doc-1",
      userId: "user-1",
      sourceMap,
      links: [{ url: "https://example.com", page: 1 }],
    });
    expect(get).toHaveBeenLastCalledWith("doc-1", "user-1");
  });

  it("lists artifacts newest first", () => {
    const all = vi
      .fn()
      .mockReturnValue([
        artifactRow({ id: "artifact-2" }),
        artifactRow({ id: "artifact-1" }),
      ]);
    (db.prepare as Mock).mockReturnValue({ run: vi.fn(), all });

    expect(
      listDocumentArtifacts("doc-1", "user-1").map((row) => row.id),
    ).toEqual(["artifact-2", "artifact-1"]);
    expect(all).toHaveBeenLastCalledWith("doc-1", "user-1");
  });
});
