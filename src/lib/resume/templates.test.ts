import { describe, it, expect } from "vitest";
import {
  COVER_LETTER_TEMPLATES,
  TEMPLATES,
  generateTemplateCSS,
  getCoverLetterTemplate,
  getDefaultTemplateIdForDocumentMode,
  getTemplate,
  getTemplateForDocumentMode,
  getTemplatesForDocumentMode,
} from "./templates";

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

describe("COVER_LETTER_TEMPLATES", () => {
  it("includes cover-letter specific templates", () => {
    expect(COVER_LETTER_TEMPLATES.map((template) => template.id)).toEqual([
      "formal",
      "modern",
      "creative",
      "minimal",
    ]);
  });

  it("uses letter layout with larger line height", () => {
    for (const template of COVER_LETTER_TEMPLATES) {
      expect(template.styles.layout).toBe("letter");
      expect(Number(template.styles.lineHeight)).toBeGreaterThanOrEqual(1.6);
      expect(template.styles.bodyMaxWidth).toMatch(/in$/);
    }
  });
});

describe("getCoverLetterTemplate", () => {
  it("returns a matching cover letter template by id", () => {
    expect(getCoverLetterTemplate("modern").name).toBe("Modern");
  });

  it("falls back to formal for unknown ids", () => {
    expect(getCoverLetterTemplate("missing").id).toBe("formal");
  });
});

describe("document mode template helpers", () => {
  it("keeps resume and cover letter template sets separate", () => {
    expect(getTemplatesForDocumentMode("resume")).toBe(TEMPLATES);
    expect(getTemplatesForDocumentMode("cover_letter")).toBe(COVER_LETTER_TEMPLATES);
    expect(getTemplateForDocumentMode("resume", "modern").styles.layout).toBe(
      "single-column"
    );
    expect(getTemplateForDocumentMode("cover_letter", "modern").styles.layout)
      .toBe("letter");
  });

  it("returns mode-specific default template ids", () => {
    expect(getDefaultTemplateIdForDocumentMode("resume")).toBe("classic");
    expect(getDefaultTemplateIdForDocumentMode("cover_letter")).toBe("formal");
  });
});

describe("getTemplate - style correctness", () => {
  it.each(TEMPLATES.map((t) => t.id))(
    "template '%s' returns matching styles",
    (id) => {
      const template = getTemplate(id);
      expect(template.id).toBe(id);
      expect(template.styles).toBeDefined();
      expect(template.styles.fontFamily).toBeTruthy();
      expect(template.styles.fontSize).toBeTruthy();
      expect(template.styles.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(["single-column", "two-column"]).toContain(template.styles.layout);
      expect(["centered", "left", "minimal"]).toContain(
        template.styles.headerStyle
      );
      expect(["disc", "dash", "arrow", "none"]).toContain(
        template.styles.bulletStyle
      );
      expect(["line", "space", "none"]).toContain(
        template.styles.sectionDivider
      );
    }
  );

  it("only the two-column template has two-column layout", () => {
    const twoColTemplates = TEMPLATES.filter(
      (t) => t.styles.layout === "two-column"
    );
    expect(twoColTemplates).toHaveLength(1);
    expect(twoColTemplates[0].id).toBe("two-column");
  });
});

describe("generateTemplateCSS", () => {
  it("generates valid CSS for two-column template styles", () => {
    const twoCol = getTemplate("two-column");
    const css = generateTemplateCSS(twoCol.styles);
    expect(css).toContain("font-family:");
    expect(css).toContain("font-size: 10pt");
  });

  it("generates disc bullet style as list-style-type disc", () => {
    const classic = getTemplate("classic");
    const css = generateTemplateCSS(classic.styles);
    expect(css).toContain("list-style-type: disc");
  });

  it("generates dash bullet as ::before pseudo-element", () => {
    const modern = getTemplate("modern");
    const css = generateTemplateCSS(modern.styles);
    expect(css).toContain('content: "-  "');
    expect(css).toContain("list-style-type: none");
  });

  it("generates arrow bullet as ::before pseudo-element", () => {
    const executive = getTemplate("executive");
    const css = generateTemplateCSS(executive.styles);
    expect(css).toContain('content: "→ "');
    expect(css).toContain("list-style-type: none");
  });

  it("generates none bullet style without pseudo-elements", () => {
    const minimal = getTemplate("minimal");
    const css = generateTemplateCSS(minimal.styles);
    expect(css).toContain("list-style-type: none");
    expect(css).not.toContain("::before");
  });

  it("generates section border for line divider", () => {
    const classic = getTemplate("classic");
    const css = generateTemplateCSS(classic.styles);
    expect(css).toContain("border-bottom:");
  });

  it("omits section border for space divider", () => {
    const modern = getTemplate("modern");
    const css = generateTemplateCSS(modern.styles);
    expect(css).not.toContain("border-bottom:");
  });

  it("applies centered header alignment", () => {
    const classic = getTemplate("classic");
    const css = generateTemplateCSS(classic.styles);
    expect(css).toContain("text-align: center");
  });

  it("omits text-align for non-centered header", () => {
    const modern = getTemplate("modern");
    const css = generateTemplateCSS(modern.styles);
    expect(css).not.toContain("text-align: center");
  });
});
