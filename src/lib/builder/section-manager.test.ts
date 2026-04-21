import { describe, it, expect } from "vitest";
import {
  createInitialSections,
  toggleSectionVisibility,
  reorderSections,
  getVisibleSectionIds,
  getMobilePanelClasses,
  DEFAULT_SECTION_ORDER,
  DEFAULT_BUILDER_PANEL,
  BUILDER_PANELS,
} from "./section-manager";
import type { SectionState } from "./section-manager";

describe("createInitialSections", () => {
  it("creates sections from DEFAULT_SECTION_ORDER with all visible", () => {
    const sections = createInitialSections();
    expect(sections).toHaveLength(DEFAULT_SECTION_ORDER.length);
    for (const section of sections) {
      expect(section.visible).toBe(true);
    }
    expect(sections.map((s) => s.id)).toEqual(DEFAULT_SECTION_ORDER);
  });

  it("accepts custom category list", () => {
    const sections = createInitialSections(["skill", "education"]);
    expect(sections).toEqual([
      { id: "skill", visible: true },
      { id: "education", visible: true },
    ]);
  });
});

describe("toggleSectionVisibility", () => {
  it("toggles a visible section to hidden", () => {
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "education", visible: true },
    ];
    const result = toggleSectionVisibility(sections, "experience");
    expect(result[0].visible).toBe(false);
    expect(result[1].visible).toBe(true);
  });

  it("toggles a hidden section to visible", () => {
    const sections: SectionState[] = [
      { id: "experience", visible: false },
      { id: "education", visible: true },
    ];
    const result = toggleSectionVisibility(sections, "experience");
    expect(result[0].visible).toBe(true);
  });

  it("returns a new array (immutable)", () => {
    const sections: SectionState[] = [{ id: "skill", visible: true }];
    const result = toggleSectionVisibility(sections, "skill");
    expect(result).not.toBe(sections);
    expect(result[0]).not.toBe(sections[0]);
  });

  it("does not modify sections without matching id", () => {
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "education", visible: false },
    ];
    const result = toggleSectionVisibility(sections, "skill");
    expect(result).toEqual(sections);
  });
});

describe("reorderSections", () => {
  const sections: SectionState[] = [
    { id: "experience", visible: true },
    { id: "education", visible: true },
    { id: "skill", visible: true },
    { id: "project", visible: false },
  ];

  it("moves a section forward", () => {
    const result = reorderSections(sections, 0, 2);
    expect(result.map((s) => s.id)).toEqual([
      "education",
      "skill",
      "experience",
      "project",
    ]);
  });

  it("moves a section backward", () => {
    const result = reorderSections(sections, 2, 0);
    expect(result.map((s) => s.id)).toEqual([
      "skill",
      "experience",
      "education",
      "project",
    ]);
  });

  it("returns same array for same index", () => {
    const result = reorderSections(sections, 1, 1);
    expect(result).toBe(sections);
  });

  it("returns same array for out-of-bounds fromIndex", () => {
    const result = reorderSections(sections, -1, 2);
    expect(result).toBe(sections);
  });

  it("returns same array for out-of-bounds toIndex", () => {
    const result = reorderSections(sections, 0, 10);
    expect(result).toBe(sections);
  });

  it("preserves visibility state after reorder", () => {
    const result = reorderSections(sections, 3, 0);
    expect(result[0]).toEqual({ id: "project", visible: false });
  });

  it("returns a new array (immutable)", () => {
    const result = reorderSections(sections, 0, 1);
    expect(result).not.toBe(sections);
  });
});

describe("getVisibleSectionIds", () => {
  it("returns only visible section ids", () => {
    const sections: SectionState[] = [
      { id: "experience", visible: true },
      { id: "education", visible: false },
      { id: "skill", visible: true },
    ];
    expect(getVisibleSectionIds(sections)).toEqual(["experience", "skill"]);
  });

  it("preserves order", () => {
    const sections: SectionState[] = [
      { id: "skill", visible: true },
      { id: "experience", visible: true },
    ];
    expect(getVisibleSectionIds(sections)).toEqual(["skill", "experience"]);
  });

  it("returns empty array when all hidden", () => {
    const sections: SectionState[] = [
      { id: "experience", visible: false },
      { id: "education", visible: false },
    ];
    expect(getVisibleSectionIds(sections)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(getVisibleSectionIds([])).toEqual([]);
  });
});

describe("getMobilePanelClasses", () => {
  it("shows the edit panel on mobile and desktop when edit is active", () => {
    expect(getMobilePanelClasses("edit", "edit")).toBe("block md:block");
  });

  it("shows the preview panel on mobile and desktop when preview is active", () => {
    expect(getMobilePanelClasses("preview", "preview")).toBe("block md:block");
  });

  it("hides the preview panel on mobile but shows it on desktop when edit is active", () => {
    expect(getMobilePanelClasses("edit", "preview")).toBe("hidden md:block");
  });

  it("hides the edit panel on mobile but shows it on desktop when preview is active", () => {
    expect(getMobilePanelClasses("preview", "edit")).toBe("hidden md:block");
  });
});

describe("BUILDER_PANELS", () => {
  it("includes both edit and preview", () => {
    expect(BUILDER_PANELS).toEqual(["edit", "preview"]);
  });
});

describe("DEFAULT_BUILDER_PANEL", () => {
  it("defaults to edit so users land on the section list first", () => {
    expect(DEFAULT_BUILDER_PANEL).toBe("edit");
  });
});
