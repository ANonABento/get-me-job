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
    expect(variables["--glass-border-color"]).toBe(
      "hsl(var(--border) / var(--surface-border-opacity))",
    );
    expect(variables["--glass-background-color"]).toBe(
      "hsl(var(--card) / var(--surface-glass-opacity))",
    );
    expect(variables["--skeleton-highlight-color"]).toBe(
      "hsl(var(--muted-foreground) / 0.1)",
    );
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
    expect(() =>
      applyThemeTokens(getTheme("default").light, null),
    ).not.toThrow();
  });

  it("bloxy: sharp corners, thick borders, and offset shadows", () => {
    const light = themeTokensToCssVariables(getTheme("bloxy").light);
    const dark = themeTokensToCssVariables(getTheme("bloxy").dark);

    expect(light["--radius"]).toBe("0");
    expect(light["--border-width"]).toBe("3px");
    expect(light["--offset-shadow-x"]).toBe("4px");
    expect(light["--offset-shadow-y"]).toBe("4px");
    expect(light["--shadow-card"]).toBe("4px 4px 0 #111");
    expect(light["--shadow-elevated"]).toBe("6px 6px 0 #111");

    expect(dark["--radius"]).toBe("0");
    expect(dark["--border-width"]).toBe("3px");
    expect(dark["--shadow-card"]).toMatch(/^4px 4px 0/);
  });

  it("glass: backdrop-blur and translucent surface opacity", () => {
    const light = themeTokensToCssVariables(getTheme("glass").light);
    const dark = themeTokensToCssVariables(getTheme("glass").dark);

    expect(light["--backdrop-blur"]).toBe("blur(20px)");
    expect(light["--surface-glass-opacity"]).toBe("0.4");
    expect(light["--surface-border-opacity"]).toBe("0.6");
    expect(light["--radius"]).toBe("1rem");

    expect(dark["--backdrop-blur"]).toBe("blur(20px)");
    expect(dark["--surface-glass-opacity"]).toBe("0.08");
  });

  it("neon: glow color variables set for both variants", () => {
    const light = themeTokensToCssVariables(getTheme("neon").light);
    const dark = themeTokensToCssVariables(getTheme("neon").dark);

    expect(light["--glow-color"]).toBe("rgba(0,212,255,0.3)");
    expect(light["--glow-color-secondary"]).toBe("rgba(255,0,102,0.15)");
    expect(light["--glow-primary-opacity"]).toBe("0.3");

    expect(dark["--glow-color"]).toBe("rgba(0,212,255,0.3)");
    expect(dark["--glow-primary-opacity"]).toBe("0.3");
  });

  it("earth: warm rounded corners", () => {
    const light = themeTokensToCssVariables(getTheme("earth").light);
    const dark = themeTokensToCssVariables(getTheme("earth").dark);

    expect(light["--radius"]).toBe("0.875rem");
    expect(dark["--radius"]).toBe("0.875rem");
    expect(light["--font-family"]).toContain("Aptos");
  });

  it("premium: tight letter-spacing and layered shadows for both variants", () => {
    const light = themeTokensToCssVariables(getTheme("premium").light);
    const dark = themeTokensToCssVariables(getTheme("premium").dark);

    expect(light["--letter-spacing"]).toBe("-0.025em");
    expect(dark["--letter-spacing"]).toBe("-0.025em");

    expect(light["--shadow-card"]).toContain("rgba(0,0,0,");
    expect(light["--shadow-elevated"]).toContain("rgba(0,0,0,");

    expect(dark["--shadow-card"]).toContain("rgba(0,0,0,");
    expect(dark["--shadow-elevated"]).toContain("rgba(0,0,0,");
  });

  it("minimal: no shadows, moderate radius", () => {
    const light = themeTokensToCssVariables(getTheme("minimal").light);
    const dark = themeTokensToCssVariables(getTheme("minimal").dark);

    expect(light["--shadow-card"]).toBe("none");
    expect(dark["--shadow-card"]).toBe("none");
    expect(light["--radius"]).toBe("0.5rem");
  });

  it("default: standard radius and no glow", () => {
    const light = themeTokensToCssVariables(getTheme("default").light);

    expect(light["--radius"]).toBe("0.75rem");
    expect(light["--glow-color"]).toBe("transparent");
    expect(light["--backdrop-blur"]).toBe("none");
  });
});
