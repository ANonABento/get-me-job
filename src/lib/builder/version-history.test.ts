import { describe, expect, it, vi } from "vitest";
import type { BuilderDraftState, BuilderVersion } from "./version-history";
import {
  MAX_BUILDER_VERSIONS,
  addBuilderVersion,
  areBuilderStatesEqual,
  createBuilderVersion,
  getBuilderVersionStorageKey,
  getLatestBuilderVersion,
  isBuilderStateSaved,
  parseBuilderDraftState,
  readBuilderVersions,
  writeBuilderVersions,
} from "./version-history";

const draftState: BuilderDraftState = {
  documentMode: "resume",
  selectedIds: ["entry-2", "entry-1"],
  sections: [
    { id: "experience", visible: true },
    { id: "skill", visible: false },
  ],
  templateId: "classic",
  html: "<main>Resume</main>",
  content: {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "Resume" }] }],
  },
};

function version(id: string, savedAt: string): BuilderVersion {
  return {
    id,
    kind: "manual",
    name: id,
    savedAt,
    state: draftState,
  };
}

describe("builder version history", () => {
  it("creates normalized versions with fallback names", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    const result = createBuilderVersion(draftState, {
      kind: "auto",
      name: "",
      savedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(result).toMatchObject({
      id: "auto-2026-01-01T00:00:00.000Z-4fzyo8",
      kind: "auto",
      name: "Auto-save",
      savedAt: "2026-01-01T00:00:00.000Z",
      state: {
        selectedIds: ["entry-1", "entry-2"],
        content: draftState.content,
      },
    });
  });

  it("caps version history and sorts newest first", () => {
    const existing = Array.from({ length: MAX_BUILDER_VERSIONS }, (_, index) =>
      version(
        `v${index}`,
        `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`
      )
    );

    const next = addBuilderVersion(
      existing,
      version("latest", "2026-02-01T00:00:00.000Z")
    );

    expect(next).toHaveLength(MAX_BUILDER_VERSIONS);
    expect(next[0].id).toBe("latest");
    expect(next.some((item) => item.id === "v0")).toBe(false);
  });

  it("parses saved state defensively and fills missing sections", () => {
    const parsed = parseBuilderDraftState({
      documentMode: "resume",
      selectedIds: ["b", 3, "a", "a"],
      sections: [{ id: "skill", visible: false }, { id: "unknown" }],
      templateId: "modern",
      html: "<p>Saved</p>",
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });

    expect(parsed).toEqual({
      documentMode: "resume",
      selectedIds: ["a", "b"],
      sections: expect.arrayContaining([
        { id: "skill", visible: false },
        { id: "experience", visible: true },
      ]),
      templateId: "modern",
      html: "<p>Saved</p>",
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });
  });

  it("parses cover letter draft state with cover letter template fallback", () => {
    const parsed = parseBuilderDraftState({
      documentMode: "cover_letter",
      selectedIds: ["entry-1"],
      sections: [{ id: "experience", visible: true }],
      html: "<p>Cover letter</p>",
    });

    expect(parsed).toMatchObject({
      documentMode: "cover_letter",
      selectedIds: ["entry-1"],
      templateId: "formal",
      html: "<p>Cover letter</p>",
    });
  });

  it("reads only valid versions from storage", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify([
          version("old", "2026-01-01T00:00:00.000Z"),
          { id: "bad", kind: "manual", savedAt: "2026-01-02T00:00:00.000Z" },
          version("invalid-date", "not-a-date"),
          version("new", "2026-01-03T00:00:00.000Z"),
        ])
      ),
    };

    expect(
      readBuilderVersions(storage, "resume").map((item) => item.id)
    ).toEqual(["new", "old"]);
    expect(storage.getItem).toHaveBeenCalledWith(
      getBuilderVersionStorageKey("resume")
    );
  });

  it("returns an empty list when storage reads fail", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("storage unavailable");
      }),
    };

    expect(readBuilderVersions(storage, "resume")).toEqual([]);
  });

  it("writes capped versions to storage", () => {
    const storage = { setItem: vi.fn() };
    const versions = Array.from(
      { length: MAX_BUILDER_VERSIONS + 2 },
      (_, index) =>
        version(
          `v${index}`,
          `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`
        )
    );

    expect(writeBuilderVersions(storage, "resume", versions)).toBe(true);

    const [, raw] = storage.setItem.mock.calls[0];
    expect(JSON.parse(raw)).toHaveLength(MAX_BUILDER_VERSIONS);
  });

  it("reports failed storage writes without throwing", () => {
    const storage = {
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
    };

    expect(
      writeBuilderVersions(storage, "resume", [
        version("v1", "2026-01-01T00:00:00.000Z"),
      ])
    ).toBe(false);
  });

  it("compares normalized draft states", () => {
    expect(
      areBuilderStatesEqual(draftState, {
        ...draftState,
        selectedIds: ["entry-1", "entry-2", "entry-2"],
      })
    ).toBe(true);

    expect(
      areBuilderStatesEqual(draftState, {
        ...draftState,
        templateId: "modern",
      })
    ).toBe(false);
  });

  it("returns the newest version as the latest version", () => {
    const latest = version("latest", "2026-01-03T00:00:00.000Z");

    expect(
      getLatestBuilderVersion([
        latest,
        version("old", "2026-01-01T00:00:00.000Z"),
      ])
    ).toBe(latest);
    expect(getLatestBuilderVersion([])).toBeNull();
  });

  it("reports whether the current draft matches any saved version", () => {
    expect(
      isBuilderStateSaved(
        [
          version("old", "2026-01-01T00:00:00.000Z"),
          {
            ...version("new", "2026-01-02T00:00:00.000Z"),
            state: { ...draftState, templateId: "modern" },
          },
        ],
        { ...draftState, selectedIds: ["entry-1", "entry-2", "entry-2"] }
      )
    ).toBe(true);

    expect(
      isBuilderStateSaved([version("old", "2026-01-01T00:00:00.000Z")], {
        ...draftState,
        content: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Changed" }] },
          ],
        },
      })
    ).toBe(false);
  });
});
