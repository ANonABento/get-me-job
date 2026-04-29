import { describe, expect, it } from "vitest";
import { applyThemeTokens, themeTokensToCssVariables } from "./apply";
import { getTheme } from "./registry";

describe("theme token application", () => {
  it("maps token fields to CSS custom properties", () => {
    const variables = themeTokensToCssVariables(getTheme("neon").dark);

    expect(variables["--background"]).toBe("240 44% 7%");
    expect(variables["--card-foreground"]).toBe("240 100% 94%");
    expect(variables["--shadow-button"]).toBe("0 0 12px rgba(0,212,255,0.3)");
    expect(variables["--glow-color"]).toBe("rgba(0,212,255,0.3)");
    expect(variables["--spacing-4"]).toBe("1rem");
  });

  it("writes variables to the provided root element", () => {
    const root = document.createElement("html");

    applyThemeTokens(getTheme("earth").light, root);

    expect(root.dataset.themePreset).toBe("earth");
    expect(root.style.getPropertyValue("--primary")).toBe("26 57% 49%");
    expect(root.style.getPropertyValue("--radius")).toBe("0.875rem");
    expect(root.style.getPropertyValue("--font-family")).toContain("Aptos");
  });

  it("does nothing when no root is available", () => {
    expect(() => applyThemeTokens(getTheme("default").light, null)).not.toThrow();
  });
});
