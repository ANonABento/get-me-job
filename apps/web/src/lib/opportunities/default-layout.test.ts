import { describe, expect, it } from "vitest";
import { CHUNK_KEYS } from "./layout-chunks";
import { layoutPreferenceSchema } from "./layout-chunks";
import {
  DEFAULT_DESKTOP_LAYOUT,
  DEFAULT_LAYOUT,
  DEFAULT_MOBILE_LAYOUT,
  getEffectiveLayout,
  getEnabledBySection,
} from "./default-layout";

describe("DEFAULT_LAYOUT", () => {
  it("includes every chunk key exactly once per device", () => {
    for (const device of [DEFAULT_DESKTOP_LAYOUT, DEFAULT_MOBILE_LAYOUT]) {
      const all = [
        ...device.header,
        ...device.meta,
        ...device.body,
        ...device.actions,
        ...device.disabled,
      ];
      expect(new Set(all).size).toBe(CHUNK_KEYS.length);
      expect(all).toHaveLength(CHUNK_KEYS.length);
    }
  });

  it("passes layoutPreferenceSchema validation", () => {
    expect(layoutPreferenceSchema.safeParse(DEFAULT_LAYOUT).success).toBe(true);
  });
});

describe("getEffectiveLayout", () => {
  it("returns DEFAULT_LAYOUT when stored is null", () => {
    expect(getEffectiveLayout(null)).toEqual(DEFAULT_LAYOUT);
  });

  it("preserves a user's stored ordering", () => {
    const custom = {
      desktop: {
        ...DEFAULT_DESKTOP_LAYOUT,
        header: [
          "title",
          "company",
          "status-pill",
          "remote-badge",
          "source-badge",
        ] as never,
      },
      mobile: DEFAULT_MOBILE_LAYOUT,
    };
    const result = getEffectiveLayout(custom);
    expect(result.desktop.header[0]).toBe("title");
    expect(result.desktop.header[1]).toBe("company");
  });

  it("injects newly-known chunks into disabled when stored predates them", () => {
    // Simulate a stored layout that doesn't yet know about a chunk.
    const partial = {
      desktop: {
        header: [
          "company",
          "title",
          "status-pill",
          "remote-badge",
          "source-badge",
        ],
        meta: ["applicants", "openings", "work-term", "level"],
        body: ["location", "salary", "deadline", "tags", "summary"],
        actions: [
          "dismiss",
          "apply",
          "save",
          "google-company",
          "open-original",
        ],
        disabled: [],
        // Missing: "applicant-ratio"
      },
      mobile: DEFAULT_MOBILE_LAYOUT,
    };
    const result = getEffectiveLayout(partial as never);
    expect(result.desktop.disabled).toContain("applicant-ratio");
  });

  it("drops unknown legacy keys silently", () => {
    const withGhost = {
      desktop: {
        ...DEFAULT_DESKTOP_LAYOUT,
        header: [...DEFAULT_DESKTOP_LAYOUT.header, "ghost-chunk"] as never,
      },
      mobile: DEFAULT_MOBILE_LAYOUT,
    };
    const result = getEffectiveLayout(withGhost);
    expect(result.desktop.header).not.toContain("ghost-chunk");
  });
});

describe("getEnabledBySection", () => {
  it("filters disabled chunks out of each section", () => {
    const layout = {
      ...DEFAULT_DESKTOP_LAYOUT,
      // Disable a header chunk by name without touching the array order.
      disabled: ["company" as never, ...DEFAULT_DESKTOP_LAYOUT.disabled],
    };
    const enabled = getEnabledBySection(layout);
    expect(enabled.header).not.toContain("company");
    // Other chunks preserved.
    expect(enabled.header).toContain("title");
  });
});
