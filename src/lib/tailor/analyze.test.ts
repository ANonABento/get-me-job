import { describe, it, expect } from "vitest";
import type { BankEntry, GroupedBankEntries } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import {
  analyzeJobFit,
  analyzeResumeFit,
  extractKeywords,
  resumeToKeywordSearchText,
  scoreBankEntry,
} from "./analyze";

function makeBankEntry(overrides: Partial<BankEntry> = {}): BankEntry {
  return {
    id: "entry-1",
    userId: "default",
    category: "skill",
    content: { name: "React" },
    confidenceScore: 0.9,
    createdAt: "2024-01-01",
    ...overrides,
  };
}

function makeEmptyBank(): GroupedBankEntries {
  return {
    experience: [],
    skill: [],
    project: [],
    hackathon: [],
    education: [],
    achievement: [],
    certification: [],
  };
}

function makeResume(overrides: Partial<TailoredResume> = {}): TailoredResume {
  return {
    contact: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      location: "London",
    },
    summary: "Frontend engineer building React applications.",
    experiences: [
      {
        company: "Acme",
        title: "Senior Engineer",
        dates: "2020 - Present",
        highlights: ["Built TypeScript design systems for customer portals."],
      },
    ],
    skills: ["React", "TypeScript"],
    education: [
      {
        institution: "Example University",
        degree: "BS",
        field: "Computer Science",
        date: "2018",
      },
    ],
    ...overrides,
  };
}

describe("extractKeywords", () => {
  it("should extract meaningful keywords from text", () => {
    const text = "We need a React developer with TypeScript experience";
    const keywords = extractKeywords(text);
    expect(keywords).toContain("react");
    expect(keywords).toContain("developer");
    expect(keywords).toContain("typescript");
  });

  it("should filter out stop words", () => {
    const text = "The candidate should have experience with Python and SQL";
    const keywords = extractKeywords(text);
    expect(keywords).not.toContain("the");
    expect(keywords).not.toContain("and");
    expect(keywords).not.toContain("with");
    expect(keywords).toContain("python");
    expect(keywords).toContain("sql");
  });

  it("should extract bigrams", () => {
    const text = "machine learning and deep learning skills required";
    const keywords = extractKeywords(text);
    expect(keywords).toContain("machine learning");
    expect(keywords).toContain("deep learning");
  });

  it("should deduplicate keywords", () => {
    const text = "React React React developer";
    const keywords = extractKeywords(text);
    const reactCount = keywords.filter((k) => k === "react").length;
    expect(reactCount).toBe(1);
  });

  it("should handle empty string", () => {
    const keywords = extractKeywords("");
    expect(keywords).toEqual([]);
  });

  it("should handle special characters", () => {
    const text = "C++ developer, .NET experience, CI/CD pipelines";
    const keywords = extractKeywords(text);
    expect(keywords).toContain("c++");
    expect(keywords).toContain(".net");
    expect(keywords).toContain("ci/cd");
  });
});

describe("scoreBankEntry", () => {
  it("should return null for no keyword matches", () => {
    const entry = makeBankEntry({ content: { name: "Python" } });
    const result = scoreBankEntry(entry, ["java", "go", "rust"]);
    expect(result).toBeNull();
  });

  it("should return match with score for matching keywords", () => {
    const entry = makeBankEntry({
      content: { name: "React", context: "Built frontend with TypeScript" },
    });
    const result = scoreBankEntry(entry, ["react", "typescript", "node"]);
    expect(result).not.toBeNull();
    expect(result!.matchedKeywords).toContain("react");
    expect(result!.matchedKeywords).toContain("typescript");
    expect(result!.relevanceScore).toBeGreaterThan(0);
  });

  it("should cap relevance score at 1", () => {
    const entry = makeBankEntry({
      content: {
        name: "Full Stack",
        description: "react typescript node express mongodb docker kubernetes",
      },
    });
    const result = scoreBankEntry(entry, ["react", "typescript"]);
    expect(result).not.toBeNull();
    expect(result!.relevanceScore).toBeLessThanOrEqual(1);
  });
});

describe("analyzeJobFit", () => {
  it("should return 0 match score for empty bank", () => {
    const bank = makeEmptyBank();
    const result = analyzeJobFit("Looking for React developer", bank);
    expect(result.matchScore).toBe(0);
    expect(result.matchedEntries).toHaveLength(0);
  });

  it("should match bank entries against job description", () => {
    const bank = makeEmptyBank();
    bank.skill = [
      makeBankEntry({ id: "s1", content: { name: "React" } }),
      makeBankEntry({ id: "s2", content: { name: "TypeScript" } }),
    ];
    bank.experience = [
      makeBankEntry({
        id: "e1",
        category: "experience",
        content: {
          company: "Acme",
          title: "Frontend Developer",
          highlights: ["Built React components"],
        },
      }),
    ];

    const result = analyzeJobFit(
      "Looking for a React and TypeScript developer with frontend experience",
      bank
    );

    expect(result.matchScore).toBeGreaterThan(0);
    expect(result.matchedEntries.length).toBeGreaterThan(0);
    expect(result.keywordsFound.length).toBeGreaterThan(0);
  });

  it("should identify gaps (missing keywords)", () => {
    const bank = makeEmptyBank();
    bank.skill = [
      makeBankEntry({ id: "s1", content: { name: "React" } }),
    ];

    const result = analyzeJobFit(
      "Need React, Kubernetes, and Terraform experience",
      bank
    );

    expect(result.keywordsMissing.length).toBeGreaterThan(0);
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it("should sort matched entries by relevance", () => {
    const bank = makeEmptyBank();
    bank.skill = [
      makeBankEntry({ id: "s1", content: { name: "Python" } }),
      makeBankEntry({
        id: "s2",
        content: { name: "React", context: "Used React with TypeScript for 3 years" },
      }),
    ];

    const result = analyzeJobFit(
      "Senior React TypeScript developer needed",
      bank
    );

    if (result.matchedEntries.length >= 2) {
      expect(result.matchedEntries[0].relevanceScore).toBeGreaterThanOrEqual(
        result.matchedEntries[1].relevanceScore
      );
    }
  });

  it("should accept pre-extracted keywords", () => {
    const bank = makeEmptyBank();
    bank.skill = [
      makeBankEntry({ id: "s1", content: { name: "React" } }),
    ];

    const result = analyzeJobFit("some text", bank, ["react", "vue"]);
    expect(result.keywordsFound).toContain("react");
    expect(result.keywordsMissing).toContain("vue");
  });

  it("should categorize skill gaps correctly", () => {
    const bank = makeEmptyBank();
    const result = analyzeJobFit(
      "Must know Python and Docker and have AWS certified credentials",
      bank
    );

    const skillGaps = result.gaps.filter((g) => g.category === "skill");
    expect(skillGaps.length).toBeGreaterThan(0);
    expect(skillGaps[0].suggestion).toMatch(/Skills|experience bullet/);
  });
});

describe("resumeToKeywordSearchText", () => {
  it("should include searchable resume fields", () => {
    const text = resumeToKeywordSearchText(makeResume());

    expect(text).toContain("frontend engineer");
    expect(text).toContain("typescript design systems");
    expect(text).toContain("computer science");
  });
});

describe("analyzeResumeFit", () => {
  it("should score a generated resume against a job description", () => {
    const result = analyzeResumeFit(
      "Need React, TypeScript, GraphQL, and Kubernetes experience",
      makeResume(),
      ["react", "typescript", "graphql", "kubernetes"]
    );

    expect(result.matchScore).toBe(50);
    expect(result.keywordsFound).toEqual(["react", "typescript"]);
    expect(result.keywordsMissing).toEqual(["graphql", "kubernetes"]);
    expect(result.gaps.map((gap) => gap.requirement)).toEqual([
      "graphql",
      "kubernetes",
    ]);
  });

  it("should update the score when resume content changes", () => {
    const keywords = ["react", "typescript", "graphql"];
    const first = analyzeResumeFit("some jd", makeResume(), keywords);
    const improved = analyzeResumeFit(
      "some jd",
      makeResume({ skills: ["React", "TypeScript", "GraphQL"] }),
      keywords
    );

    expect(first.matchScore).toBe(67);
    expect(improved.matchScore).toBe(100);
    expect(improved.keywordsMissing).toEqual([]);
  });
});
