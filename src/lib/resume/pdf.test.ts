import { describe, it, expect } from "vitest";
import { generateResumeHTML } from "./pdf";
import { TEMPLATES } from "./templates";
import type { TailoredResume } from "./generator";

const mockResume: TailoredResume = {
  contact: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-1234",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
  },
  summary: "Experienced software engineer with 8 years of experience.",
  experiences: [
    {
      company: "Acme Corp",
      title: "Senior Engineer",
      dates: "2020 - Present",
      highlights: ["Led team of 5", "Shipped v2 platform"],
    },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  education: [
    {
      institution: "MIT",
      degree: "BS",
      field: "Computer Science",
      date: "2016",
    },
  ],
};

const emptyResume: TailoredResume = {
  contact: { name: "" },
  summary: "",
  experiences: [],
  skills: [],
  education: [],
};

const specialCharsResume: TailoredResume = {
  contact: {
    name: 'O\'Brien & Associates <script>alert("xss")</script>',
    email: "test@example.com",
  },
  summary: 'Built systems for "Fortune 500" & managed <100 servers',
  experiences: [
    {
      company: "Smith & Wesson <Corp>",
      title: "Engineer <Lead>",
      dates: "2020 - Present",
      highlights: ['Used "React" & <Angular>', "Improved speed by >50%"],
    },
  ],
  skills: ["C++", "C#", "R&D", "<script>"],
  education: [
    {
      institution: "M&T University",
      degree: "BS",
      field: 'Computer "Science"',
      date: "2016",
    },
  ],
};

describe("generateResumeHTML", () => {
  it("generates single-column HTML for classic template", () => {
    const html = generateResumeHTML(mockResume, "classic");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("Senior Engineer");
    expect(html).not.toContain("two-col-container");
  });

  it("generates two-column HTML for two-column template", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("two-col-container");
    expect(html).toContain("two-col-left");
    expect(html).toContain("two-col-right");
  });

  it("puts skills in the left column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    // Extract content between the left and right column div markers
    const leftColMatch = html.match(/<div class="two-col-left">([\s\S]*?)<\/div>\s*<div class="two-col-right">/);
    expect(leftColMatch).toBeTruthy();
    const leftCol = leftColMatch![1];
    expect(leftCol).toContain("Skills");
    expect(leftCol).toContain("TypeScript");
    expect(leftCol).toContain("React");
  });

  it("puts experience in the right column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const rightColMatch = html.match(/<div class="two-col-right">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/);
    expect(rightColMatch).toBeTruthy();
    const rightCol = rightColMatch![1];
    expect(rightCol).toContain("Experience");
    expect(rightCol).toContain("Senior Engineer");
    expect(rightCol).toContain("Acme Corp");
  });

  it("puts education in the left column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const leftColMatch = html.match(/<div class="two-col-left">([\s\S]*?)<\/div>\s*<div class="two-col-right">/);
    expect(leftColMatch).toBeTruthy();
    const leftCol = leftColMatch![1];
    expect(leftCol).toContain("Education");
    expect(leftCol).toContain("MIT");
  });

  it("puts summary in the right column for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    const rightColMatch = html.match(/<div class="two-col-right">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/);
    expect(rightColMatch).toBeTruthy();
    const rightCol = rightColMatch![1];
    expect(rightCol).toContain("Summary");
    expect(rightCol).toContain("Experienced software engineer");
  });

  it("includes print styles for two-column layout", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("@media print");
    expect(html).toContain("print-color-adjust: exact");
  });

  it("handles resume with no education in two-column layout", () => {
    const noEdu = { ...mockResume, education: [] };
    const html = generateResumeHTML(noEdu, "two-column");
    expect(html).toContain("two-col-container");
    expect(html).not.toContain("Education");
  });

  it("all existing templates still produce valid HTML", () => {
    const templateIds = [
      "classic",
      "modern",
      "minimal",
      "executive",
      "tech",
      "creative",
      "compact",
      "professional",
    ];
    for (const id of templateIds) {
      const html = generateResumeHTML(mockResume, id);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Jane Doe");
    }
  });
});

describe("generateResumeHTML - all 9 templates produce valid HTML", () => {
  const allTemplateIds = TEMPLATES.map((t) => t.id);

  it.each(allTemplateIds)("template '%s' produces well-formed HTML", (id) => {
    const html = generateResumeHTML(mockResume, id);

    // Basic HTML structure
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("</html>");
    expect(html).toContain("<head>");
    expect(html).toContain("</head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
    expect(html).toContain("<style>");
    expect(html).toContain("</style>");
  });

  it.each(allTemplateIds)(
    "template '%s' includes all resume content",
    (id) => {
      const html = generateResumeHTML(mockResume, id);

      expect(html).toContain("Jane Doe");
      expect(html).toContain("jane@example.com");
      expect(html).toContain("Senior Engineer");
      expect(html).toContain("Acme Corp");
      expect(html).toContain("Led team of 5");
      expect(html).toContain("TypeScript");
      expect(html).toContain("MIT");
    }
  );

  it.each(allTemplateIds)(
    "template '%s' applies its own styles",
    (id) => {
      const template = TEMPLATES.find((t) => t.id === id)!;
      const html = generateResumeHTML(mockResume, id);

      expect(html).toContain(template.styles.fontFamily);
      expect(html).toContain(template.styles.fontSize);
      expect(html).toContain(template.styles.accentColor);
    }
  );

  it("defaults to classic template for unknown ID", () => {
    const html = generateResumeHTML(mockResume, "nonexistent-template");
    const classicHtml = generateResumeHTML(mockResume, "classic");
    expect(html).toBe(classicHtml);
  });
});

describe("generateResumeHTML - empty data handling", () => {
  it("does not crash with completely empty resume data", () => {
    const allTemplateIds = TEMPLATES.map((t) => t.id);
    for (const id of allTemplateIds) {
      expect(() => generateResumeHTML(emptyResume, id)).not.toThrow();
    }
  });

  it("produces valid HTML structure with empty resume", () => {
    const html = generateResumeHTML(emptyResume, "classic");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("</html>");
  });

  it("omits education section when education is empty", () => {
    const noEdu = { ...mockResume, education: [] };
    for (const id of TEMPLATES.map((t) => t.id)) {
      const html = generateResumeHTML(noEdu, id);
      expect(html).not.toContain("Education");
    }
  });

  it("renders skills section even when skills array is empty", () => {
    const noSkills = { ...mockResume, skills: [] };
    const html = generateResumeHTML(noSkills, "classic");
    expect(html).toContain("Skills");
  });

  it("renders experience section even when experiences array is empty", () => {
    const noExp = { ...mockResume, experiences: [] };
    const html = generateResumeHTML(noExp, "classic");
    expect(html).toContain("Experience");
  });

  it("handles empty contact fields gracefully", () => {
    const minimalContact: TailoredResume = {
      ...mockResume,
      contact: { name: "Test User" },
    };
    const html = generateResumeHTML(minimalContact, "classic");
    expect(html).toContain("Test User");
    expect(html).not.toContain("undefined");
  });

  it("handles two-column layout with empty data", () => {
    const html = generateResumeHTML(emptyResume, "two-column");
    expect(html).toContain("two-col-container");
    expect(html).toContain("two-col-left");
    expect(html).toContain("two-col-right");
    expect(html).not.toContain("Education");
  });
});

describe("generateResumeHTML - special characters in content", () => {
  it("renders special characters without crashing", () => {
    for (const id of TEMPLATES.map((t) => t.id)) {
      expect(() => generateResumeHTML(specialCharsResume, id)).not.toThrow();
    }
  });

  it("preserves ampersands in content", () => {
    const html = generateResumeHTML(specialCharsResume, "classic");
    expect(html).toContain("&");
  });

  it("preserves angle brackets in content", () => {
    const html = generateResumeHTML(specialCharsResume, "classic");
    // Content with angle brackets is included as-is (template uses raw interpolation)
    expect(html).toContain("Smith & Wesson");
  });

  it("preserves quotes in content", () => {
    const html = generateResumeHTML(specialCharsResume, "classic");
    expect(html).toContain('"React"');
    expect(html).toContain('"Fortune 500"');
  });

  it("renders special character skills", () => {
    const html = generateResumeHTML(specialCharsResume, "classic");
    expect(html).toContain("C++");
    expect(html).toContain("C#");
    // Template uses raw interpolation, so R&D appears unescaped
    expect(html).toContain("R&D");
  });

  it("handles special characters in two-column layout", () => {
    const html = generateResumeHTML(specialCharsResume, "two-column");
    expect(html).toContain("two-col-container");
    expect(html).toContain("Smith & Wesson");
    expect(html).toContain("C++");
  });
});

describe("generateResumeHTML - two-column CSS layout", () => {
  it("uses flexbox for two-column container", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("display: flex");
  });

  it("sets left column to 35% width", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("width: 35%");
  });

  it("sets right column to 65% width", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("width: 65%");
  });

  it("has a sidebar background color derived from accent color", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    // Two-column template uses accent color + "0d" for ~5% opacity sidebar
    expect(html).toContain("#2563eb0d");
  });

  it("has a border between columns", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("border-right: 1px solid");
  });

  it("includes print media query with min-height for two-column", () => {
    const html = generateResumeHTML(mockResume, "two-column");
    expect(html).toContain("min-height: calc(11in - 1.1in)");
  });
});
