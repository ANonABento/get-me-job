import { describe, expect, it } from "vitest";
import { ALL_THEMES, getTheme, getThemeIds, isThemeId } from "./registry";

describe("theme registry", () => {
  it("registers the seven built-in theme presets in display order", () => {
    expect(getThemeIds()).toEqual([
      "default",
      "bloxy",
      "glass",
      "minimal",
      "neon",
      "earth",
      "premium",
    ]);
    expect(ALL_THEMES).toHaveLength(7);
  });

  it("resolves known theme ids and falls back to default for unknown ids", () => {
    expect(getTheme("premium").name).toBe("Premium");
    expect(getTheme("missing").id).toBe("default");
  });

  it("validates theme ids", () => {
    expect(isThemeId("earth")).toBe(true);
    expect(isThemeId("glassmorphism")).toBe(false);
  });

  it("includes light and dark token variants for every preset", () => {
    for (const theme of ALL_THEMES) {
      expect(theme.light.id).toBe(theme.id);
      expect(theme.dark.id).toBe(theme.id);
      expect(theme.preview.primary).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
