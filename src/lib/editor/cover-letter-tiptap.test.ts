import { describe, expect, it } from "vitest";
import {
  coverLetterTextToTipTapDocument,
  createBlankCoverLetterTipTapDocument,
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
