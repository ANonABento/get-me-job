import { describe, expect, it } from "vitest";
import type { BankEntry } from "@/types";
import {
  buildCoverLetterPreviewContent,
  generateCoverLetterPreviewFallbackHTML,
} from "./cover-letter-preview-fallback";

function makeEntry(
  category: BankEntry["category"],
  content: Record<string, unknown>,
  id = "entry-1"
): BankEntry {
  return {
    id,
    userId: "user-1",
    category,
    content,
    confidenceScore: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildCoverLetterPreviewContent", () => {
  it("turns selected bank entries into letter paragraphs", () => {
    const content = buildCoverLetterPreviewContent([
      makeEntry("experience", {
        title: "Frontend Engineer",
        company: "Acme",
        highlights: ["Built accessible UI"],
      }),
      makeEntry("skill", { name: "TypeScript" }, "entry-2"),
    ]);

    expect(content).toContain("Dear Hiring Team");
    expect(content).toContain("Frontend Engineer at Acme");
    expect(content).toContain("TypeScript");
    expect(content).toContain("Built accessible UI");
    expect(content).toContain("Sincerely");
  });
});

describe("generateCoverLetterPreviewFallbackHTML", () => {
  it("returns an empty string when there are no selected entries", () => {
    expect(generateCoverLetterPreviewFallbackHTML([], "formal")).toBe("");
  });

  it("renders a cover letter HTML document with the selected template", () => {
    const html = generateCoverLetterPreviewFallbackHTML(
      [
        makeEntry("experience", {
          title: "Frontend Engineer",
          company: "Acme",
          highlights: ["Built accessible UI"],
        }),
      ],
      "minimal"
    );

    expect(html).toContain("cover-letter-document");
    expect(html).toContain("Frontend Engineer at Acme");
    expect(html).toContain("Built accessible UI");
    expect(html).toContain("line-height: 1.72");
  });
});
