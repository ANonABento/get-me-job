import { describe, expect, it } from "vitest";
import type { BankEntry } from "@/types";
import { calculateResumeScore } from "./scoring";

function makeEntry(
  category: BankEntry["category"],
  content: BankEntry["content"],
): BankEntry {
  return {
    id: category,
    userId: "user-1",
    category,
    content,
    confidenceScore: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("calculateResumeScore", () => {
  it("scores a complete targeted resume with strong signals highly", () => {
    const resumeText = `
      Summary Software engineer focused on accessible React platforms.
      Experience Led migration to TypeScript, improved performance by 42%,
      reduced release time by 3 days, and shipped analytics workflows for
      25000 users. Skills React TypeScript accessibility testing Node.
      Education BS Computer Science. Projects Built design system tooling.
    `;

    const result = calculateResumeScore({
      resumeText,
      jobDescription:
        "Frontend engineer with React, TypeScript, accessibility, testing, and analytics experience.",
      entries: [
        makeEntry("experience", {
          title: "Software Engineer",
          highlights: ["Led a team of 5 engineers", "Reduced latency 32%"],
        }),
        makeEntry("skill", { skills: ["React", "TypeScript", "Testing"] }),
        makeEntry("education", { degree: "BS Computer Science" }),
        makeEntry("project", { name: "Analytics workflow" }),
        makeEntry("achievement", { value: "Supported 25000 users" }),
      ],
    });

    expect(result.overall).toBeGreaterThanOrEqual(75);
    expect(result.breakdown.completeness).toBeGreaterThanOrEqual(85);
    expect(result.breakdown.keywordDensity).toBeGreaterThanOrEqual(70);
    expect(result.stats.quantifiedAchievementCount).toBeGreaterThanOrEqual(4);
  });

  it("penalizes sparse resumes without job keyword matches or metrics", () => {
    const result = calculateResumeScore({
      resumeText: "Helped with internal tasks.",
      jobDescription:
        "React TypeScript accessibility performance testing analytics",
    });

    expect(result.overall).toBeLessThan(45);
    expect(result.breakdown.length).toBeLessThan(10);
    expect(result.breakdown.keywordDensity).toBe(0);
    expect(result.breakdown.quantifiedAchievements).toBe(0);
  });

  it("treats keyword density as complete when no job description is available", () => {
    const result = calculateResumeScore({
      resumeText:
        "Experience Built React applications. Skills TypeScript. Education BS.",
    });

    expect(result.breakdown.keywordDensity).toBe(100);
    expect(result.stats.totalKeywordCount).toBe(0);
  });

  it("uses selected bank entry categories for completeness", () => {
    const result = calculateResumeScore({
      resumeText: "Built internal tools with React.",
      entries: [
        makeEntry("experience", { title: "Developer" }),
        makeEntry("skill", { skills: ["React"] }),
      ],
    });

    expect(result.breakdown.completeness).toBe(48);
  });
});
