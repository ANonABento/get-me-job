import { describe, expect, it } from "vitest";
import {
  applySelectionRewrite,
  buildDocumentRewritePrompt,
  buildSimpleDiff,
  getDocumentSuggestions,
  isDocumentAssistantAction,
  normalizeSelection,
} from "./document-assistant";

describe("document assistant helpers", () => {
  it("recognizes supported assistant actions", () => {
    expect(isDocumentAssistantAction("rewrite")).toBe(true);
    expect(isDocumentAssistantAction("make-concise")).toBe(true);
    expect(isDocumentAssistantAction("unknown")).toBe(false);
  });

  it("normalizes a valid text selection", () => {
    expect(normalizeSelection("Hello world", { start: 6, end: 11 })).toEqual({
      start: 6,
      end: 11,
      text: "world",
    });
  });

  it("returns null for collapsed selections", () => {
    expect(normalizeSelection("Hello", { start: 2, end: 2 })).toBeNull();
  });

  it("applies replacement text to the selected range", () => {
    expect(
      applySelectionRewrite(
        "I built APIs quickly.",
        { start: 8, end: 12 },
        "reliable APIs"
      )
    ).toBe("I built reliable APIs quickly.");
  });

  it("returns a compact before and after diff", () => {
    expect(buildSimpleDiff("old text", "new text")).toEqual([
      { type: "removed", value: "old text" },
      { type: "added", value: "new text" },
    ]);
  });

  it("returns document-aware suggestions when content exists", () => {
    const suggestions = getDocumentSuggestions(
      "I led a migration and improved developer workflows.",
      "We need React, migration, and developer productivity experience."
    );
    expect(suggestions).toContain(
      "Select relevant experience and match JD keywords."
    );
    expect(suggestions).toHaveLength(3);
  });

  it("prompts users to add content when the document is empty", () => {
    expect(getDocumentSuggestions("", "")).toEqual([
      "Generate or paste document content to get assistant suggestions.",
    ]);
  });

  it("builds rewrite prompts with action and job context", () => {
    const prompt = buildDocumentRewritePrompt({
      action: "match-jd-keywords",
      selectedText: "I built a dashboard.",
      documentContent: "I built a dashboard for sales teams.",
      jobDescription: "The role needs analytics dashboard experience.",
    });

    expect(prompt).toContain("Selected text:");
    expect(prompt).toContain("I built a dashboard.");
    expect(prompt).toContain("Job description:");
    expect(prompt).toContain("analytics dashboard");
  });
});
