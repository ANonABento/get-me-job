import { describe, it, expect } from "vitest";
import { TEMPLATES, getTemplate, generateTemplateCSS } from "./templates";

describe("TEMPLATES", () => {
  it("includes the two-column template", () => {
    const twoCol = TEMPLATES.find((t) => t.id === "two-column");
    expect(twoCol).toBeDefined();
    expect(twoCol!.name).toBe("Two Column");
    expect(twoCol!.styles.layout).toBe("two-column");
  });

  it("has 9 templates total", () => {
    expect(TEMPLATES).toHaveLength(9);
  });

  it("all templates have unique IDs", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getTemplate", () => {
  it("returns the two-column template by id", () => {
    const template = getTemplate("two-column");
    expect(template.id).toBe("two-column");
    expect(template.styles.layout).toBe("two-column");
  });

  it("returns classic as fallback for unknown id", () => {
    const template = getTemplate("nonexistent");
    expect(template.id).toBe("classic");
  });
});

describe("generateTemplateCSS", () => {
  it("generates valid CSS for two-column template styles", () => {
    const twoCol = getTemplate("two-column");
    const css = generateTemplateCSS(twoCol.styles);
    expect(css).toContain("font-family:");
    expect(css).toContain("font-size: 10pt");
  });
});
