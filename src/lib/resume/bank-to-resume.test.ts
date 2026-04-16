import { describe, it, expect } from "vitest";
import { bankEntriesToResume } from "./bank-to-resume";
import type { BankEntry } from "@/types";

function makeEntry(
  category: BankEntry["category"],
  content: Record<string, unknown>,
  id = "e1"
): BankEntry {
  return {
    id,
    userId: "default",
    category,
    content,
    confidenceScore: 0.9,
    createdAt: "2024-01-01",
  };
}

describe("bankEntriesToResume", () => {
  it("returns empty resume for no entries", () => {
    const result = bankEntriesToResume([]);
    expect(result.experiences).toEqual([]);
    expect(result.skills).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.summary).toBe("");
    expect(result.contact.name).toBe("Your Name");
  });

  it("uses provided contact info", () => {
    const contact = { name: "Jane Doe", email: "jane@example.com" };
    const result = bankEntriesToResume([], contact);
    expect(result.contact.name).toBe("Jane Doe");
    expect(result.contact.email).toBe("jane@example.com");
  });

  it("converts experience entries", () => {
    const entry = makeEntry("experience", {
      company: "Acme Corp",
      title: "Engineer",
      startDate: "2020",
      endDate: "2023",
      highlights: ["Built APIs", "Led team"],
    });
    const result = bankEntriesToResume([entry]);
    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].company).toBe("Acme Corp");
    expect(result.experiences[0].title).toBe("Engineer");
    expect(result.experiences[0].dates).toBe("2020 — 2023");
    expect(result.experiences[0].highlights).toEqual(["Built APIs", "Led team"]);
  });

  it("handles experience with current flag", () => {
    const entry = makeEntry("experience", {
      company: "Acme Corp",
      title: "Engineer",
      startDate: "2020",
      current: true,
    });
    const result = bankEntriesToResume([entry]);
    expect(result.experiences[0].dates).toBe("2020 — Present");
  });

  it("uses description as highlight when no highlights array", () => {
    const entry = makeEntry("experience", {
      company: "Acme Corp",
      title: "Engineer",
      description: "Built the whole thing",
    });
    const result = bankEntriesToResume([entry]);
    expect(result.experiences[0].highlights).toEqual(["Built the whole thing"]);
  });

  it("converts skill entries", () => {
    const entries = [
      makeEntry("skill", { name: "TypeScript" }, "s1"),
      makeEntry("skill", { name: "React" }, "s2"),
    ];
    const result = bankEntriesToResume(entries);
    expect(result.skills).toEqual(["TypeScript", "React"]);
  });

  it("converts education entries", () => {
    const entry = makeEntry("education", {
      institution: "MIT",
      degree: "BS",
      field: "CS",
      endDate: "2020",
    });
    const result = bankEntriesToResume([entry]);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe("MIT");
    expect(result.education[0].degree).toBe("BS");
    expect(result.education[0].field).toBe("CS");
    expect(result.education[0].date).toBe("2020");
  });

  it("falls back to startDate when endDate missing for education", () => {
    const entry = makeEntry("education", {
      institution: "MIT",
      degree: "BS",
      field: "CS",
      startDate: "2016",
    });
    const result = bankEntriesToResume([entry]);
    expect(result.education[0].date).toBe("2016");
  });

  it("converts achievement entries to summary", () => {
    const entry = makeEntry("achievement", {
      description: "Won best employee award",
    });
    const result = bankEntriesToResume([entry]);
    expect(result.summary).toBe("Won best employee award");
  });

  it("converts certification entries to skills", () => {
    const entry = makeEntry("certification", {
      name: "AWS Solutions Architect",
      issuer: "Amazon",
    });
    const result = bankEntriesToResume([entry]);
    expect(result.skills).toContain("AWS Solutions Architect (Amazon)");
  });

  it("converts project entries to experiences", () => {
    const entry = makeEntry("project", {
      name: "Open Source Tool",
      description: "A CLI for developers",
      highlights: ["1000 stars", "Featured on HN"],
    });
    const result = bankEntriesToResume([entry]);
    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].company).toBe("Project");
    expect(result.experiences[0].title).toBe("Open Source Tool");
    expect(result.experiences[0].highlights).toEqual(["1000 stars", "Featured on HN"]);
  });

  it("handles mixed entry types", () => {
    const entries = [
      makeEntry("experience", { company: "A", title: "Dev", startDate: "2020" }, "e1"),
      makeEntry("skill", { name: "Go" }, "s1"),
      makeEntry("education", { institution: "U", degree: "MS", field: "EE" }, "ed1"),
      makeEntry("achievement", { description: "Award winner" }, "a1"),
      makeEntry("certification", { name: "CKA" }, "c1"),
      makeEntry("project", { name: "Proj", highlights: ["Cool"] }, "p1"),
    ];
    const result = bankEntriesToResume(entries);
    expect(result.experiences).toHaveLength(2); // experience + project
    expect(result.skills).toEqual(["Go", "CKA"]);
    expect(result.education).toHaveLength(1);
    expect(result.summary).toBe("Award winner");
  });
});
