import { describe, expect, it } from "vitest";
import {
  coverLetterHtmlToText,
  coverLetterTextToTipTapDocument,
  createBlankCoverLetterTipTapDocument,
  isBlankCoverLetterTipTapDocument,
} from "./cover-letter-tiptap";

describe("createBlankCoverLetterTipTapDocument", () => {
  it("creates an editable empty cover letter document", () => {
    expect(createBlankCoverLetterTipTapDocument()).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
  });
});

describe("coverLetterTextToTipTapDocument", () => {
  it("converts generated cover letter paragraphs to TipTap content", () => {
    expect(
      coverLetterTextToTipTapDocument(
        "Dear Hiring Team,\n\nI built accessible workflows.\n\nSincerely,\nJane",
      ),
    ).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear Hiring Team," }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "I built accessible workflows." }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Sincerely, Jane" }],
        },
      ],
    });
  });

  it("falls back to a blank document for empty text", () => {
    expect(coverLetterTextToTipTapDocument(" \n ")).toEqual(
      createBlankCoverLetterTipTapDocument(),
    );
  });
});

describe("coverLetterHtmlToText", () => {
  it("returns paragraph-separated plain text from cover letter HTML", () => {
    expect(
      coverLetterHtmlToText(
        "<p>Dear Acme,</p><p>I built reliable systems.</p><p>I would love to talk.</p>",
      ),
    ).toBe(
      "Dear Acme,\n\nI built reliable systems.\n\nI would love to talk.",
    );
  });

  it("preserves single line breaks from <br> tags", () => {
    expect(coverLetterHtmlToText("<p>Line one<br>Line two</p>")).toBe(
      "Line one\nLine two",
    );
  });

  it("decodes common HTML entities and trims output", () => {
    expect(
      coverLetterHtmlToText(
        "  <p>Acme &amp; Beta &quot;leaders&quot;</p><p>I&#39;m excited</p>  ",
      ),
    ).toBe('Acme & Beta "leaders"\n\nI\'m excited');
  });

  it("round-trips through coverLetterTextToTipTapDocument preserving paragraphs", () => {
    const html =
      "<p>Dear Acme,</p><p>I built reliable systems.</p><p>I would love to talk.</p>";
    const text = coverLetterHtmlToText(html);
    const document = coverLetterTextToTipTapDocument(text);

    expect(document.content).toHaveLength(3);
  });

  it("returns an empty string for empty input", () => {
    expect(coverLetterHtmlToText("")).toBe("");
  });
});

describe("isBlankCoverLetterTipTapDocument", () => {
  it("detects blank documents and documents with visible text", () => {
    expect(
      isBlankCoverLetterTipTapDocument(createBlankCoverLetterTipTapDocument()),
    ).toBe(true);
    expect(
      isBlankCoverLetterTipTapDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "  " }],
          },
        ],
      }),
    ).toBe(true);
    expect(
      isBlankCoverLetterTipTapDocument(
        coverLetterTextToTipTapDocument("Dear Hiring Team,"),
      ),
    ).toBe(false);
  });
});
