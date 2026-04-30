import { describe, expect, it, vi } from "vitest";
import type { BuilderVersion } from "./version-history";
import {
  compareBuilderVersionSections,
  findBuilderVersionPair,
  hasBuilderVersionContentChange,
  readAllBuilderVersions,
} from "./version-compare";

const baseVersion: BuilderVersion = {
  id: "version-a",
  kind: "manual",
  name: "Version A",
  savedAt: "2026-04-29T12:00:00.000Z",
  state: {
    documentMode: "resume",
    selectedIds: [],
    sections: [
      { id: "experience", visible: true },
      { id: "skill", visible: true },
      { id: "project", visible: false },
    ],
    templateId: "classic",
    html: "<main>A</main>",
  },
};

function createStorage(items: Record<string, unknown>) {
  const keys = Object.keys(items);

  return {
    get length() {
      return keys.length;
    },
    key: vi.fn((index: number) => keys[index] ?? null),
    getItem: vi.fn((key: string) => JSON.stringify(items[key])),
  };
}

describe("builder version compare", () => {
  it("reads valid builder versions from all version storage keys", () => {
    const storage = createStorage({
      "taida:builder:versions:resume": [baseVersion, { kind: "manual" }],
      "other:key": [{ ...baseVersion, id: "ignored" }],
      "taida:builder:versions:letter": [{ ...baseVersion, id: "version-b" }],
    });

    expect(readAllBuilderVersions(storage)).toEqual([
      {
        documentId: "resume",
        version: expect.objectContaining({ id: "version-a" }),
      },
      {
        documentId: "letter",
        version: expect.objectContaining({ id: "version-b" }),
      },
    ]);
  });

  it("finds a requested before and after version pair", () => {
    const after = { ...baseVersion, id: "version-b" };
    const storage = createStorage({
      "taida:builder:versions:resume": [baseVersion, after],
    });

    expect(findBuilderVersionPair(storage, " version-a ", "version-b")).toEqual(
      {
        before: expect.objectContaining({ id: "version-a" }),
        after: expect.objectContaining({ id: "version-b" }),
        documentId: "resume",
      },
    );
  });

  it("detects added, removed, and reordered visible sections", () => {
    const after: BuilderVersion = {
      ...baseVersion,
      state: {
        ...baseVersion.state,
        sections: [
          { id: "skill", visible: true },
          { id: "project", visible: true },
          { id: "experience", visible: false },
        ],
      },
    };

    expect(compareBuilderVersionSections(baseVersion, after)).toEqual([
      { id: "skill", label: "Skills", type: "changed" },
      { id: "project", label: "Projects", type: "added" },
      { id: "experience", label: "Experience", type: "removed" },
    ]);
  });

  it("reports HTML content changes separately from section visibility changes", () => {
    expect(
      hasBuilderVersionContentChange(baseVersion, {
        ...baseVersion,
        state: { ...baseVersion.state, html: "<main>B</main>" },
      }),
    ).toBe(true);

    expect(hasBuilderVersionContentChange(baseVersion, baseVersion)).toBe(
      false,
    );
  });
});
