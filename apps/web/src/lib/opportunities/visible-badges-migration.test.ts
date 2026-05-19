import { describe, expect, it } from "vitest";
import { migrateLayoutFromVisibleBadges } from "./visible-badges-migration";
import { DEFAULT_LAYOUT } from "./default-layout";

describe("migrateLayoutFromVisibleBadges", () => {
  it("returns the stored layout unchanged when one is set", () => {
    const explicit = { ...DEFAULT_LAYOUT };
    const result = migrateLayoutFromVisibleBadges(explicit, [
      "applicants",
      "openings",
    ]);
    expect(result.desktop.disabled).toEqual(explicit.desktop.disabled);
  });

  it("hides chunks whose badge key was removed from visibleBadges", () => {
    // User hid "level" + "source" via the old prefs UI.
    const visible = ["applicants", "openings", "workTerm", "remote"];
    const result = migrateLayoutFromVisibleBadges(null, visible);

    expect(result.desktop.disabled).toContain("level");
    expect(result.desktop.disabled).toContain("source-badge");
    expect(result.mobile.disabled).toContain("level");
    expect(result.mobile.disabled).toContain("source-badge");
    // Other chunks stay enabled.
    expect(result.desktop.disabled).not.toContain("applicants");
  });

  it("returns defaults when visibleBadges is empty or undefined", () => {
    expect(migrateLayoutFromVisibleBadges(null, undefined)).toEqual(
      DEFAULT_LAYOUT,
    );
    expect(migrateLayoutFromVisibleBadges(null, [])).toEqual(DEFAULT_LAYOUT);
  });

  it("keeps a default-shown chunk visible when included in visibleBadges", () => {
    // Pass every badge → no migrations should fire.
    const visible = [
      "applicants",
      "openings",
      "workTerm",
      "level",
      "remote",
      "source",
      "deadline",
      "salary",
    ];
    const result = migrateLayoutFromVisibleBadges(null, visible);
    expect(result).toEqual(DEFAULT_LAYOUT);
  });
});
