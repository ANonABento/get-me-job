import { describe, it, expect } from "vitest";
import {
  escapeLatex,
  calculateMarginForCharsPerLine,
  generateResumeLatex,
  getLatexTemplate,
  LATEX_TEMPLATES,
} from "./latex-generator";
import type { TailoredResume } from "./generator";

const createResume = (overrides: Partial<TailoredResume> = {}): TailoredResume => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  summary: "Experienced software engineer with 5+ years building web applications.",
  skills: ["JavaScript", "React", "Node.js", "TypeScript"],
  experiences: [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      dates: "2020 - 2024",
      highlights: ["Built web applications", "Led team of 3"],
    },
  ],
  education: [
    {
      degree: "B.S.",
      field: "Computer Science",
      institution: "State University",
      date: "2020",
    },
  ],
  ...overrides,
});

describe("escapeLatex", () => {
  it("escapes percentage sign", () => {
    expect(escapeLatex("100% success")).toBe("100\\% success");
  });

  it("escapes ampersand", () => {
    expect(escapeLatex("R&D")).toBe("R\\&D");
  });

  it("escapes dollar sign", () => {
    expect(escapeLatex("$100k")).toBe("\\$100k");
  });

  it("escapes hash", () => {
    expect(escapeLatex("issue #42")).toBe("issue \\#42");
  });

  it("escapes underscore", () => {
    expect(escapeLatex("my_var")).toBe("my\\_var");
  });

  it("escapes curly braces", () => {
    expect(escapeLatex("{text}")).toBe("\\{text\\}");
  });

  it("escapes tilde", () => {
    expect(escapeLatex("~approx")).toBe("\\textasciitilde{}approx");
  });

  it("escapes caret", () => {
    expect(escapeLatex("x^2")).toBe("x\\textasciicircum{}2");
  });

  it("escapes backslash", () => {
    expect(escapeLatex("C:\\path")).toBe("C:\\textbackslash{}path");
  });

  it("handles multiple special characters", () => {
    expect(escapeLatex("$100 & 50%")).toBe("\\$100 \\& 50\\%");
  });

  it("returns empty string for empty input", () => {
    expect(escapeLatex("")).toBe("");
  });

  it("returns empty string for null-like input", () => {
    expect(escapeLatex(null as unknown as string)).toBe("");
    expect(escapeLatex(undefined as unknown as string)).toBe("");
  });

  it("leaves normal text unchanged", () => {
    expect(escapeLatex("Hello World")).toBe("Hello World");
  });
});

describe("calculateMarginForCharsPerLine", () => {
  it("returns a valid margin string", () => {
    const margin = calculateMarginForCharsPerLine(65, 11);
    expect(margin).toMatch(/^\d+\.\d+in$/);
  });

  it("returns larger margins for fewer chars per line", () => {
    const narrow = calculateMarginForCharsPerLine(60, 11);
    const wide = calculateMarginForCharsPerLine(100, 11);
    const narrowVal = parseFloat(narrow);
    const wideVal = parseFloat(wide);
    expect(narrowVal).toBeGreaterThan(wideVal);
  });

  it("clamps to minimum 0.5in", () => {
    const margin = calculateMarginForCharsPerLine(200, 10);
    const val = parseFloat(margin);
    expect(val).toBeGreaterThanOrEqual(0.5);
  });

  it("clamps to maximum 1.5in", () => {
    const margin = calculateMarginForCharsPerLine(20, 12);
    const val = parseFloat(margin);
    expect(val).toBeLessThanOrEqual(1.5);
  });

  it("adjusts for font size", () => {
    const small = calculateMarginForCharsPerLine(100, 10);
    const large = calculateMarginForCharsPerLine(100, 12);
    // Larger font needs more space per char, so margins should be smaller
    expect(parseFloat(large)).toBeLessThan(parseFloat(small));
  });
});

describe("getLatexTemplate", () => {
  it("returns template by id", () => {
    const template = getLatexTemplate("modern");
    expect(template.id).toBe("modern");
    expect(template.name).toBe("Modern");
  });

  it("returns first template for unknown id", () => {
    const template = getLatexTemplate("nonexistent");
    expect(template.id).toBe(LATEX_TEMPLATES[0].id);
  });

  it("has three templates available", () => {
    expect(LATEX_TEMPLATES).toHaveLength(3);
    const ids = LATEX_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("modern");
    expect(ids).toContain("two-column");
    expect(ids).toContain("minimal");
  });
});

describe("generateResumeLatex", () => {
  it("generates valid LaTeX with documentclass", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("\\documentclass");
    expect(latex).toContain("\\begin{document}");
    expect(latex).toContain("\\end{document}");
  });

  it("includes contact information", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("John Doe");
    expect(latex).toContain("john@example.com");
    expect(latex).toContain("555-0123");
  });

  it("includes summary", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("Experienced software engineer");
  });

  it("includes experiences", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("Software Engineer");
    expect(latex).toContain("Tech Corp");
    expect(latex).toContain("Built web applications");
  });

  it("includes skills", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("JavaScript");
    expect(latex).toContain("React");
  });

  it("includes education", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("Computer Science");
    expect(latex).toContain("State University");
  });

  it("escapes special characters in content", () => {
    const resume = createResume({
      summary: "Improved revenue by 50% & reduced costs by $1M",
      skills: ["C#", "R&D"],
    });
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("50\\%");
    expect(latex).toContain("\\&");
    expect(latex).toContain("\\$1M");
    expect(latex).toContain("C\\#");
  });

  it("handles empty education array", () => {
    const resume = createResume({ education: [] });
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("\\begin{document}");
    expect(latex).not.toContain("Education");
  });

  it("respects fontSize option", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume, "modern", { fontSize: 12 });
    expect(latex).toContain("12pt");
  });

  it("respects margin option", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume, "modern", { margin: "1in" });
    expect(latex).toContain("margin=1in");
  });

  it("uses targetCharsPerLine to compute margin", () => {
    const resume = createResume();
    const latex = generateResumeLatex(resume, "modern", { targetCharsPerLine: 65 });
    // Should contain a computed margin, not the default
    expect(latex).toContain("margin=");
  });

  describe("template variants", () => {
    it("generates modern template", () => {
      const resume = createResume();
      const latex = generateResumeLatex(resume, "modern");
      expect(latex).toContain("\\section*{Summary}");
      expect(latex).toContain("\\section*{Experience}");
      expect(latex).toContain("\\section*{Skills}");
    });

    it("generates two-column template", () => {
      const resume = createResume();
      const latex = generateResumeLatex(resume, "two-column");
      expect(latex).toContain("paracol");
      expect(latex).toContain("\\switchcolumn");
    });

    it("generates minimal template", () => {
      const resume = createResume();
      const latex = generateResumeLatex(resume, "minimal");
      expect(latex).toContain("\\hrule");
      expect(latex).not.toContain("\\section*");
    });

    it("falls back to modern for unknown template", () => {
      const resume = createResume();
      const latex = generateResumeLatex(resume, "nonexistent");
      expect(latex).toContain("\\section*{Summary}");
    });
  });

  it("handles missing optional contact fields", () => {
    const resume = createResume({
      contact: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    });
    const latex = generateResumeLatex(resume);
    expect(latex).toContain("Jane Smith");
    expect(latex).toContain("jane@example.com");
    expect(latex).toContain("\\begin{document}");
  });
});
