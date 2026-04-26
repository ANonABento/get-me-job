import { describe, expect, it } from "vitest";
import type { BankEntry } from "@/types";
import {
  createEditableResumeDocument,
  reorderEditableDocumentSections,
  updateEditableEntryBullet,
  updateEditableEntryField,
  updateEditableSectionTitle,
} from "./editor-document";

const entries: BankEntry[] = [
  {
    id: "exp-1",
    userId: "user-1",
    category: "experience",
    content: {
      title: "Engineer",
      company: "Acme",
      startDate: "2020",
      current: true,
      highlights: ["Built systems"],
    },
    confidenceScore: 1,
    createdAt: "2026-01-01",
  },
  {
    id: "skill-1",
    userId: "user-1",
    category: "skill",
    content: { name: "TypeScript", proficiency: "advanced" },
    confidenceScore: 1,
    createdAt: "2026-01-01",
  },
];

describe("createEditableResumeDocument", () => {
  it("creates ordered editable sections with mapped entry text", () => {
    const document = createEditableResumeDocument(entries, [
      "skill",
      "experience",
      "education",
    ]);

    expect(document.sections.map((section) => section.id)).toEqual([
      "skill",
      "experience",
      "education",
    ]);
    expect(document.sections[0].entries[0]).toMatchObject({
      id: "skill-1",
      heading: "TypeScript",
      meta: "advanced",
    });
    expect(document.sections[1].entries[0]).toMatchObject({
      id: "exp-1",
      heading: "Engineer",
      subtitle: "Acme",
      meta: "2020 - Present",
      bullets: ["Built systems"],
    });
    expect(document.sections[2].entries).toEqual([]);
  });

  it("preserves edited text for existing sections and entries when rebuilt", () => {
    const document = createEditableResumeDocument(entries, [
      "experience",
      "skill",
    ]);
    const edited = updateEditableEntryField(
      updateEditableSectionTitle(document, "experience", "Selected Work"),
      "experience",
      "exp-1",
      "heading",
      "Staff Engineer"
    );

    const rebuilt = createEditableResumeDocument(
      entries,
      ["experience", "skill"],
      edited
    );

    expect(rebuilt.sections[0].title).toBe("Selected Work");
    expect(rebuilt.sections[0].entries[0].heading).toBe("Staff Engineer");
    expect(rebuilt.sections[1].entries[0].heading).toBe("TypeScript");
  });

  it("uses bank text for newly added entries when preserving prior edits", () => {
    const document = createEditableResumeDocument(entries, ["experience"]);
    const edited = updateEditableEntryField(
      document,
      "experience",
      "exp-1",
      "heading",
      "Staff Engineer"
    );

    const rebuilt = createEditableResumeDocument(
      entries,
      ["experience", "skill"],
      edited
    );

    expect(rebuilt.sections[0].entries[0].heading).toBe("Staff Engineer");
    expect(rebuilt.sections[1].entries[0].heading).toBe("TypeScript");
  });
});

describe("editable document updates", () => {
  it("updates section titles immutably", () => {
    const document = createEditableResumeDocument(entries, ["experience"]);
    const result = updateEditableSectionTitle(document, "experience", "Work");

    expect(result.sections[0].title).toBe("Work");
    expect(document.sections[0].title).toBe("Experience");
  });

  it("updates entry fields", () => {
    const document = createEditableResumeDocument(entries, ["experience"]);
    const result = updateEditableEntryField(
      document,
      "experience",
      "exp-1",
      "heading",
      "Staff Engineer"
    );

    expect(result.sections[0].entries[0].heading).toBe("Staff Engineer");
  });

  it("updates bullet text", () => {
    const document = createEditableResumeDocument(entries, ["experience"]);
    const result = updateEditableEntryBullet(
      document,
      "experience",
      "exp-1",
      0,
      "Built reliable systems"
    );

    expect(result.sections[0].entries[0].bullets).toEqual([
      "Built reliable systems",
    ]);
  });

  it("reorders sections", () => {
    const document = createEditableResumeDocument(entries, [
      "experience",
      "skill",
    ]);
    const result = reorderEditableDocumentSections(document, 0, 1);

    expect(result.sections.map((section) => section.id)).toEqual([
      "skill",
      "experience",
    ]);
  });

  it("returns the same document for invalid reorders", () => {
    const document = createEditableResumeDocument(entries, ["experience"]);

    expect(reorderEditableDocumentSections(document, 0, 0)).toBe(document);
    expect(reorderEditableDocumentSections(document, -1, 0)).toBe(document);
  });
});
