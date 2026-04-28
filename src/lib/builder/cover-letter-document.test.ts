import { describe, expect, it } from "vitest";
import {
  COVER_LETTER_TEMPLATES,
  composeCoverLetterContent,
  coverLetterContentToDocument,
  createBlankCoverLetterDocument,
  generateCoverLetterHTML,
  getCoverLetterTemplate,
  splitCoverLetterParagraphs,
} from "./cover-letter-document";

describe("getCoverLetterTemplate", () => {
  it("returns a matching template", () => {
    expect(getCoverLetterTemplate("modern").name).toBe("Modern");
  });

  it("falls back to the default template", () => {
    expect(getCoverLetterTemplate("missing")).toBe(COVER_LETTER_TEMPLATES[0]);
  });

  it("includes cover-letter specific template choices", () => {
    expect(COVER_LETTER_TEMPLATES.map((template) => template.id)).toEqual([
      "formal",
      "modern",
      "creative",
    ]);
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

describe("coverLetterContentToDocument", () => {
  it("returns an empty structured document for blank content", () => {
    expect(coverLetterContentToDocument("  ")).toEqual(
      createBlankCoverLetterDocument()
    );
  });

  it("maps generated paragraphs into opening, body, and closing sections", () => {
    expect(
      coverLetterContentToDocument(
        "Dear team,\n\nI match the role.\n\nI built revenue tools.\n\nSincerely,\nJane"
      )
    ).toEqual({
      opening: "Dear team,",
      body: "I match the role.\n\nI built revenue tools.",
      closing: "Sincerely, Jane",
    });
  });
});

describe("composeCoverLetterContent", () => {
  it("joins non-empty structured sections with paragraph breaks", () => {
    expect(
      composeCoverLetterContent({
        opening: "Dear team,",
        body: "I match the role.",
        closing: "Sincerely,\nJane",
      })
    ).toBe("Dear team,\n\nI match the role.\n\nSincerely,\nJane");
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
      templateId: "creative",
    });

    expect(html).toContain("font-family: Avenir, Montserrat, Arial, sans-serif");
    expect(html).toContain("border-bottom: 2px solid #be123c");
    expect(html).toContain("max-width: 7.25in");
  });
});
