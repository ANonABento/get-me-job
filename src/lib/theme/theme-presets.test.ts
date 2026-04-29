import { describe, expect, it, vi } from "vitest";
import {
  CUSTOM_THEME_STORAGE_KEY,
  THEME_CHANGE_EVENT,
  THEME_PRESET_STORAGE_KEY,
  applyThemePreference,
  buildThemeVariables,
  hexToHslString,
  hslStringToHex,
  notifyThemePreferenceChanged,
  readThemePreference,
  resetThemePreference,
  saveThemePreference,
} from "./theme-presets";

function createStorage(initial: Record<string, string> = {}): Storage {
  const state = new Map(Object.entries(initial));

  return {
    get length() {
      return state.size;
    },
    clear: vi.fn(() => state.clear()),
    getItem: vi.fn((key: string) => state.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(state.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      state.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      state.set(key, value);
    }),
  };
}

describe("theme presets", () => {
  it("converts hex colors to HSL strings", () => {
    expect(hexToHslString("#0ea5e9")).toBe("199 89% 48%");
    expect(hexToHslString("#fff")).toBe("0 0% 100%");
  });

  it("converts HSL strings to hex color input values", () => {
    expect(hslStringToHex("199 89% 48%")).toBe("#0da2e7");
    expect(hslStringToHex("0 0% 100%")).toBe("#ffffff");
  });

  it("builds CSS variables from the editable theme colors", () => {
    const variables = buildThemeVariables({
      primary: "190 86% 38%",
      background: "205 45% 98%",
      card: "0 0% 100%",
    });

    expect(variables["--primary"]).toBe("190 86% 38%");
    expect(variables["--background"]).toBe("205 45% 98%");
    expect(variables["--card"]).toBe("0 0% 100%");
    expect(variables["--ring"]).toBe("190 86% 38%");
    expect(variables["--gradient-primary"]).toContain("linear-gradient");
    expect(variables["--shadow-card"]).toBeTruthy();
    expect(variables["--border-width"]).toBe("1px");
  });

  it("applies complete selected preset variables to the document root", () => {
    const root = document.createElement("html");

    applyThemePreference(root, {
      presetId: "ocean",
      customColors: {
        primary: "1 2% 3%",
        background: "4 5% 6%",
        card: "7 8% 9%",
      },
    });

    expect(root.style.getPropertyValue("--primary")).toBe("190 86% 38%");
    expect(root.style.getPropertyValue("--background")).toBe("205 45% 98%");
    expect(root.style.getPropertyValue("--shadow-card")).toBeTruthy();
    expect(root.dataset.themePreset).toBe("ocean");
  });

  it("applies default token variables for the default preset", () => {
    const root = document.createElement("html");
    root.style.setProperty("--primary", "190 86% 38%");
    root.style.setProperty("--gradient-primary", "linear-gradient(red, blue)");

    applyThemePreference(root, {
      presetId: "default",
      customColors: {
        primary: "1 2% 3%",
        background: "4 5% 6%",
        card: "7 8% 9%",
      },
    });

    expect(root.style.getPropertyValue("--primary")).toBe("258 65% 58%");
    expect(root.style.getPropertyValue("--gradient-primary")).toContain(
      "linear-gradient"
    );
  });

  it("resets applied theme preference metadata and variables", () => {
    const root = document.createElement("html");
    applyThemePreference(root, {
      presetId: "forest",
      customColors: {
        primary: "1 2% 3%",
        background: "4 5% 6%",
        card: "7 8% 9%",
      },
    });

    resetThemePreference(root);

    expect(root.style.getPropertyValue("--primary")).toBe("");
    expect(root.dataset.themePreset).toBeUndefined();
  });

  it("persists and reads theme preferences", () => {
    const storage = createStorage();
    const preference = {
      presetId: "custom" as const,
      customColors: {
        primary: "220 80% 50%",
        background: "210 40% 98%",
        card: "0 0% 100%",
      },
    };

    saveThemePreference(preference, storage);

    expect(storage.setItem).toHaveBeenCalledWith(THEME_PRESET_STORAGE_KEY, "custom");
    expect(storage.setItem).toHaveBeenCalledWith(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(preference.customColors));
    expect(readThemePreference(storage)).toEqual(preference);
  });

  it("falls back to defaults when reading storage throws", () => {
    const storage = createStorage();
    vi.mocked(storage.getItem).mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    expect(readThemePreference(storage)).toEqual({
      presetId: "default",
      customColors: {
        primary: "196 78% 42%",
        background: "210 30% 98%",
        card: "0 0% 100%",
      },
    });
  });

  it("does not throw when saving storage fails", () => {
    const storage = createStorage();
    vi.mocked(storage.setItem).mockImplementation(() => {
      throw new Error("Storage full");
    });

    expect(() =>
      saveThemePreference(
        {
          presetId: "ocean",
          customColors: {
            primary: "196 78% 42%",
            background: "210 30% 98%",
            card: "0 0% 100%",
          },
        },
        storage,
      ),
    ).not.toThrow();
  });

  it("falls back to defaults when stored values are invalid", () => {
    const storage = createStorage({
      [THEME_PRESET_STORAGE_KEY]: "bad-preset",
      [CUSTOM_THEME_STORAGE_KEY]: JSON.stringify({ primary: "not hsl" }),
    });

    expect(readThemePreference(storage)).toEqual({
      presetId: "default",
      customColors: {
        primary: "196 78% 42%",
        background: "210 30% 98%",
        card: "0 0% 100%",
      },
    });
  });

  it("dispatches a theme change event", () => {
    const listener = vi.fn();
    window.addEventListener(THEME_CHANGE_EVENT, listener);

    notifyThemePreferenceChanged();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
  });
});
