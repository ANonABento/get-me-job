import { describe, expect, it } from "vitest";
import { CHUNK_KEYS } from "./layout-chunks";
import {
  bentoLayoutPreferenceSchema,
  isBentoLayoutPreference,
} from "./bento-layout";
import {
  DEFAULT_BENTO_LAYOUT,
  bentoFromSectionLayout,
  getEffectiveBentoLayout,
  getMobileCellOrder,
} from "./default-bento";

describe("DEFAULT_BENTO_LAYOUT", () => {
  it("includes every chunk exactly once", () => {
    const placed = new Set<string>();
    for (const cell of DEFAULT_BENTO_LAYOUT.desktop.cells) {
      for (const chunk of cell.chunks) {
        expect(placed.has(chunk)).toBe(false);
        placed.add(chunk);
      }
    }
    for (const chunk of DEFAULT_BENTO_LAYOUT.desktop.disabled) {
      expect(placed.has(chunk)).toBe(false);
      placed.add(chunk);
    }
    expect(placed.size).toBe(CHUNK_KEYS.length);
  });

  it("passes schema validation", () => {
    expect(
      bentoLayoutPreferenceSchema.safeParse(DEFAULT_BENTO_LAYOUT).success,
    ).toBe(true);
  });

  it("every cell fits within its device's columns", () => {
    const { columns, cells } = DEFAULT_BENTO_LAYOUT.desktop;
    for (const cell of cells) {
      expect(cell.gridCol + cell.colSpan - 1).toBeLessThanOrEqual(columns);
    }
  });
});

describe("bentoLayoutPreferenceSchema", () => {
  it("rejects a layout missing chunks", () => {
    const bad = {
      ...DEFAULT_BENTO_LAYOUT,
      desktop: {
        ...DEFAULT_BENTO_LAYOUT.desktop,
        disabled: [], // drop the parked chunks → some chunk is now homeless
      },
    };
    expect(bentoLayoutPreferenceSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects duplicate cell IDs", () => {
    const bad = {
      ...DEFAULT_BENTO_LAYOUT,
      desktop: {
        ...DEFAULT_BENTO_LAYOUT.desktop,
        cells: [
          ...DEFAULT_BENTO_LAYOUT.desktop.cells,
          {
            id: "identity",
            chunks: ["title"],
            gridCol: 1,
            gridRow: 99,
            colSpan: 1,
            rowSpan: 1,
          },
        ],
      },
    };
    const result = bentoLayoutPreferenceSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects a cell that exceeds the column count", () => {
    const bad = {
      ...DEFAULT_BENTO_LAYOUT,
      desktop: {
        ...DEFAULT_BENTO_LAYOUT.desktop,
        cells: DEFAULT_BENTO_LAYOUT.desktop.cells.map((cell, i) =>
          i === 0 ? { ...cell, colSpan: 4 } : cell,
        ),
      },
    };
    const result = bentoLayoutPreferenceSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("isBentoLayoutPreference", () => {
  it("returns true for the new bento shape", () => {
    expect(isBentoLayoutPreference(DEFAULT_BENTO_LAYOUT)).toBe(true);
  });

  it("returns false for legacy F.1 section shape", () => {
    expect(
      isBentoLayoutPreference({
        desktop: {
          header: ["company"],
          meta: [],
          body: [],
          actions: [],
          disabled: [],
        },
        mobile: {},
      }),
    ).toBe(false);
  });

  it("returns false for null / non-objects", () => {
    expect(isBentoLayoutPreference(null)).toBe(false);
    expect(isBentoLayoutPreference("string")).toBe(false);
    expect(isBentoLayoutPreference({})).toBe(false);
  });
});

describe("getEffectiveBentoLayout", () => {
  it("returns DEFAULT_BENTO_LAYOUT when stored is null", () => {
    expect(getEffectiveBentoLayout(null)).toEqual(DEFAULT_BENTO_LAYOUT);
  });

  it("migrates a legacy F.1 section layout into bento cells", () => {
    const legacy = {
      desktop: {
        header: ["company", "title", "remote-badge", "source-badge"],
        meta: ["applicants", "openings", "work-term", "level"],
        body: ["location", "salary", "deadline", "tags", "summary"],
        actions: [
          "dismiss",
          "apply",
          "save",
          "google-company",
          "open-original",
        ],
        disabled: ["status-pill", "applicant-ratio"],
      },
      mobile: {
        header: ["company", "title"],
        meta: ["applicants", "work-term"],
        body: ["salary", "deadline", "summary", "tags"],
        actions: ["dismiss", "apply", "save"],
        disabled: [
          "status-pill",
          "remote-badge",
          "source-badge",
          "openings",
          "level",
          "applicant-ratio",
          "location",
          "google-company",
          "open-original",
        ],
      },
    };
    const result = getEffectiveBentoLayout(legacy);
    // Migration produced cells, not header/meta/body/actions arrays.
    expect(result.desktop.cells.length).toBeGreaterThan(0);
    // The status-pill (disabled in legacy) stays in disabled post-migration.
    expect(result.desktop.disabled).toContain("status-pill");
    // Chunks placed in cells match the legacy enabled set.
    const placed = result.desktop.cells.flatMap((cell) => cell.chunks);
    expect(placed).toContain("company");
    expect(placed).toContain("summary");
    expect(placed).toContain("apply");
  });

  it("normalizes a bento layout: drops unknown chunks, parks missing ones", () => {
    const stale = {
      ...DEFAULT_BENTO_LAYOUT,
      desktop: {
        ...DEFAULT_BENTO_LAYOUT.desktop,
        cells: [
          {
            ...DEFAULT_BENTO_LAYOUT.desktop.cells[0],
            chunks: ["company", "ghost-chunk" as never, "title"],
          },
          ...DEFAULT_BENTO_LAYOUT.desktop.cells.slice(1),
        ],
      },
    };
    const result = getEffectiveBentoLayout(stale);
    const firstCellChunks = result.desktop.cells[0].chunks;
    expect(firstCellChunks).toContain("company");
    expect(firstCellChunks).toContain("title");
    expect(firstCellChunks).not.toContain("ghost-chunk");
  });

  it("preserves cell tone + label after normalization", () => {
    const result = bentoFromSectionLayout({
      desktop: {
        header: ["company", "title"],
        meta: ["applicants"],
        body: ["summary"],
        actions: ["dismiss", "apply", "save"],
        disabled: [],
      },
      mobile: {
        header: [],
        meta: [],
        body: [],
        actions: [],
        disabled: [],
      },
    } as never);
    // Identity cell uses the "Role" label from SECTION_LABELS.
    const identityCell = result.desktop.cells.find((c) => c.id === "identity");
    expect(identityCell?.label).toBe("Role");
  });
});

describe("getMobileCellOrder", () => {
  it("orders cells by mobilePriority then declaration order", () => {
    const ordered = getMobileCellOrder(DEFAULT_BENTO_LAYOUT.desktop);
    // First cell in mobile flow should be "identity" per the default
    // priority list.
    expect(ordered[0].id).toBe("identity");
    expect(ordered.map((c) => c.id)).toEqual(
      DEFAULT_BENTO_LAYOUT.desktop.mobilePriority,
    );
  });

  it("appends cells missing from priority list at the end", () => {
    const layout = {
      ...DEFAULT_BENTO_LAYOUT.desktop,
      // Drop "tags" from priority so it has to come from the fallback.
      mobilePriority: DEFAULT_BENTO_LAYOUT.desktop.mobilePriority.filter(
        (id) => id !== "tags",
      ),
    };
    const ordered = getMobileCellOrder(layout);
    expect(ordered.map((c) => c.id)).toContain("tags");
    // Tags should come AFTER all priority-listed cells.
    const tagsIdx = ordered.findIndex((c) => c.id === "tags");
    expect(tagsIdx).toBe(ordered.length - 1);
  });
});
