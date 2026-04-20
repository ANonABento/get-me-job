import { describe, it, expect } from "vitest";
import { calculateProfileCompleteness } from "./profile-completeness";
import type { Profile } from "@/types";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "test",
    contact: { name: "" },
    summary: undefined,
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    ...overrides,
  };
}

describe("calculateProfileCompleteness", () => {
  it("returns 0% for null profile", () => {
    const result = calculateProfileCompleteness(null);
    expect(result.percentage).toBe(0);
    expect(result.sections).toHaveLength(5);
    expect(result.sections.every((s) => !s.complete)).toBe(true);
    expect(result.nextAction).not.toBeNull();
  });

  it("returns 0% for empty profile", () => {
    const result = calculateProfileCompleteness(makeProfile());
    expect(result.percentage).toBe(0);
  });

  it("marks contact complete when name and email present", () => {
    const result = calculateProfileCompleteness(
      makeProfile({ contact: { name: "John", email: "john@example.com" } })
    );
    const contact = result.sections.find((s) => s.key === "contact");
    expect(contact?.complete).toBe(true);
    expect(result.percentage).toBe(20);
  });

  it("does not mark contact complete with only name", () => {
    const result = calculateProfileCompleteness(
      makeProfile({ contact: { name: "John" } })
    );
    const contact = result.sections.find((s) => s.key === "contact");
    expect(contact?.complete).toBe(false);
  });

  it("marks summary complete when over 20 chars", () => {
    const result = calculateProfileCompleteness(
      makeProfile({ summary: "A professional summary that is long enough to qualify." })
    );
    const summary = result.sections.find((s) => s.key === "summary");
    expect(summary?.complete).toBe(true);
    expect(result.percentage).toBe(15);
  });

  it("does not mark summary complete when too short", () => {
    const result = calculateProfileCompleteness(
      makeProfile({ summary: "Short." })
    );
    const summary = result.sections.find((s) => s.key === "summary");
    expect(summary?.complete).toBe(false);
  });

  it("marks experience complete when at least one entry", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        experiences: [
          {
            id: "1",
            company: "Acme",
            title: "Dev",
            startDate: "2020",
            current: false,
            description: "Worked",
            highlights: [],
            skills: [],
          },
        ],
      })
    );
    const exp = result.sections.find((s) => s.key === "experience");
    expect(exp?.complete).toBe(true);
    expect(result.percentage).toBe(25);
  });

  it("marks education complete when at least one entry", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        education: [
          {
            id: "1",
            institution: "MIT",
            degree: "BS",
            field: "CS",
            highlights: [],
          },
        ],
      })
    );
    const edu = result.sections.find((s) => s.key === "education");
    expect(edu?.complete).toBe(true);
    expect(result.percentage).toBe(15);
  });

  it("marks skills complete when at least 3 skills", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        skills: [
          { id: "1", name: "TypeScript", category: "technical" },
          { id: "2", name: "React", category: "technical" },
          { id: "3", name: "Node.js", category: "technical" },
        ],
      })
    );
    const skills = result.sections.find((s) => s.key === "skills");
    expect(skills?.complete).toBe(true);
    expect(result.percentage).toBe(25);
  });

  it("does not mark skills complete with fewer than 3", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        skills: [
          { id: "1", name: "TypeScript", category: "technical" },
          { id: "2", name: "React", category: "technical" },
        ],
      })
    );
    const skills = result.sections.find((s) => s.key === "skills");
    expect(skills?.complete).toBe(false);
  });

  it("returns 100% for fully complete profile", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        contact: { name: "John", email: "john@example.com" },
        summary: "A professional with extensive experience in software.",
        experiences: [
          {
            id: "1",
            company: "Acme",
            title: "Dev",
            startDate: "2020",
            current: true,
            description: "Worked on things",
            highlights: [],
            skills: [],
          },
        ],
        education: [
          { id: "1", institution: "MIT", degree: "BS", field: "CS", highlights: [] },
        ],
        skills: [
          { id: "1", name: "TypeScript", category: "technical" },
          { id: "2", name: "React", category: "technical" },
          { id: "3", name: "Node.js", category: "technical" },
        ],
      })
    );
    expect(result.percentage).toBe(100);
    expect(result.nextAction).toBeNull();
  });

  it("returns nextAction pointing to first incomplete section", () => {
    const result = calculateProfileCompleteness(
      makeProfile({
        contact: { name: "John", email: "john@example.com" },
      })
    );
    expect(result.nextAction?.key).toBe("summary");
    expect(result.nextAction?.href).toBe("/profile#summary");
  });

  it("all sections have valid href values", () => {
    const result = calculateProfileCompleteness(null);
    for (const section of result.sections) {
      expect(section.href).toMatch(/^\/profile#/);
    }
  });
});
