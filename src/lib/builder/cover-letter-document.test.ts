import { describe, expect, it } from "vitest";
import {
  COVER_LETTER_TEMPLATES,
  generateCoverLetterHTML,
  getCoverLetterTemplate,
  splitCoverLetterParagraphs,
} from "./cover-letter-document";

describe("getCoverLetterTemplate", () => {
  it("returns a matching template", () => {
    expect(getCoverLetterTemplate("modern-letter").name).toBe("Modern Letter");
  });

  it("falls back to the default template", () => {
    expect(getCoverLetterTemplate("missing")).toBe(COVER_LETTER_TEMPLATES[0]);
  });
});

describe("splitCoverLetterParagraphs", () => {
  it("splits paragraphs on blank lines and normalizes soft wraps", () => {
    expect(splitCoverLetterParagraphs("One line\nwrap\n\nSecond")).toEqual([
      "One line wrap",
      "Second",
    ]);
  });
});

describe("generateCoverLetterHTML", () => {
  it("renders escaped cover letter paragraphs", () => {
    const html = generateCoverLetterHTML({
      content: "I built <dashboards>.\n\nI improved A&B.",
      candidateName: "Jane Doe",
      jobTitle: "Engineer",
      company: "Acme",
    });

    expect(html).toContain("<title>Jane Doe - Acme - Cover Letter</title>");
    expect(html).toContain("Engineer at Acme");
    expect(html).toContain("<p>I built &lt;dashboards&gt;.</p>");
    expect(html).toContain("<p>I improved A&amp;B.</p>");
  });

  it("uses template styles in the generated document", () => {
    const html = generateCoverLetterHTML({
      content: "Hello",
      templateId: "executive-letter",
    });

    expect(html).toContain("font-family: Cambria, Georgia, serif");
    expect(html).toContain("border-bottom: 2px solid #0f766e");
  });
});
