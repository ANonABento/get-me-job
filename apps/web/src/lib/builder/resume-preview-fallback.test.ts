import { describe, expect, it } from "vitest";
import type { BankEntry } from "@/types";
import { generateResumePreviewFallbackHTML } from "./resume-preview-fallback";

function makeEntry(
  category: BankEntry["category"],
  content: Record<string, unknown>,
  id = "entry-1",
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

describe("generateResumePreviewFallbackHTML", () => {
  it("returns an empty string when there are no selected entries", () => {
    expect(generateResumePreviewFallbackHTML([], "classic")).toBe("");
  });

  it("renders selected bank entries with the selected template", () => {
    const html = generateResumePreviewFallbackHTML(
      [
        makeEntry("experience", {
          title: "Frontend Engineer",
          company: "Acme",
          highlights: ["Built accessible UI"],
        }),
        makeEntry("skill", { name: "TypeScript" }, "entry-2"),
      ],
      "classic",
    );

    expect(html).toContain("Your Name");
    expect(html).toContain("Frontend Engineer");
    expect(html).toContain("Acme");
    expect(html).toContain("Built accessible UI");
    expect(html).toContain("TypeScript");
  });

  it("uses a resolved custom template when provided", () => {
    const html = generateResumePreviewFallbackHTML(
      [makeEntry("skill", { name: "TypeScript" })],
      "custom-template",
      {
        id: "custom-template",
        name: "Custom",
        description: "Imported",
        styles: {
          fontFamily: "Arial, sans-serif",
          fontSize: "11pt",
          headerSize: "20pt",
          sectionHeaderSize: "12pt",
          lineHeight: "1.4",
          accentColor: "#123456",
          layout: "single-column",
          headerStyle: "left",
          bulletStyle: "disc",
          sectionDivider: "line",
        },
      },
    );

    expect(html).toContain("#123456");
  });
});
